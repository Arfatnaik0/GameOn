from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import httpx
import os
from datetime import datetime, timedelta, timezone

bearer_scheme = HTTPBearer()

# Cache the JWKS with a TTL so keys refresh periodically.
_jwks_cache = None
_jwks_cache_expires_at = None
JWKS_CACHE_TTL_SECONDS = int(os.getenv("JWKS_CACHE_TTL_SECONDS", "3600"))

async def get_jwks():
    global _jwks_cache, _jwks_cache_expires_at

    now = datetime.now(timezone.utc)
    if _jwks_cache and _jwks_cache_expires_at and now < _jwks_cache_expires_at:
        return _jwks_cache

    supabase_url = os.getenv("SUPABASE_URL")
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{supabase_url}/auth/v1/.well-known/jwks.json")
        response.raise_for_status()
        _jwks_cache = response.json()
        _jwks_cache_expires_at = now + timedelta(seconds=JWKS_CACHE_TTL_SECONDS)

    return _jwks_cache

class AuthenticatedUser:
    def __init__(self, user_id: str):
        self.id = user_id

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
) -> AuthenticatedUser:
    token = credentials.credentials

    try:
        # Get unverified header to find the right key
        header = jwt.get_unverified_header(token)
        kid = header.get("kid")

        # Fetch JWKS and find matching key
        jwks = await get_jwks()
        key = next((k for k in jwks["keys"] if k.get("kid") == kid), None)

        if not key:
            raise HTTPException(status_code=401, detail="Public key not found")

        payload = jwt.decode(
            token,
            key,
            algorithms=["ES256"],
            audience="authenticated",
        )

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token missing subject")

        return AuthenticatedUser(user_id=user_id)

    except JWTError as e:
        print(f"JWT Error: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    except Exception as e:
        print(f"Auth Error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")
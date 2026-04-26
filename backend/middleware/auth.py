from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import httpx
import os
from datetime import datetime, timedelta, timezone

bearer_scheme = HTTPBearer()
optional_bearer_scheme = HTTPBearer(auto_error=False)

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


def _decode_token_to_user(token: str) -> AuthenticatedUser:
    try:
        # Get unverified header to find the right key
        header = jwt.get_unverified_header(token)
        kid = header.get("kid")

        # Fetch JWKS and find matching key
        jwks = _jwks_cache
        if not jwks:
            raise HTTPException(status_code=401, detail="Authentication failed")

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

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
) -> AuthenticatedUser:
    await get_jwks()
    token = credentials.credentials

    try:
        return _decode_token_to_user(token)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Auth Error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(optional_bearer_scheme)
) -> AuthenticatedUser | None:
    if not credentials:
        return None

    await get_jwks()

    try:
        return _decode_token_to_user(credentials.credentials)
    except HTTPException:
        return None
    except Exception as e:
        print(f"Optional Auth Error: {e}")
        return None
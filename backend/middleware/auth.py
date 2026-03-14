from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
import os

bearer_scheme = HTTPBearer()

class AuthenticatedUser:
    def __init__(self,user_id:str):
        self.user_id = user_id

async def get_current_user(
        credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
) -> AuthenticatedUser:
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            os.getenv("SUPABASE_JWT_SECRET"),
            algorithms=["HS256"],
            audience="authenticated"
        )
        user_id: str = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token missing subject claim"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    return AuthenticatedUser(user_id=user_id)


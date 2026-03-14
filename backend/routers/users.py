from fastapi import APIRouter, Depends, HTTPException
from middleware.auth import get_current_user, AuthenticatedUser
from supabase import create_client
import os
import dotenv

dotenv.load_dotenv()

router = APIRouter(prefix="/users", tags=["users"])

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_ANON_KEY")
)

@router.get("/me")
async def get_my_profile(user: AuthenticatedUser = Depends(get_current_user)):
    response = supabase.table("profiles").select("*").eq("id", user.user_id).single().execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return response.data
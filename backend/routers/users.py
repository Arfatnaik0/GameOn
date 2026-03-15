from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from middleware.auth import get_current_user, AuthenticatedUser
from supabase import create_client
from gotrue.errors import AuthApiError
import os
import dotenv

dotenv.load_dotenv()

router = APIRouter(prefix="/users", tags=["users"])

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))
supabase_admin = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))


class ProfileUpdate(BaseModel):
    username: Optional[str] = None
    bio: Optional[str] = None


@router.get("/me")
async def get_my_profile(user: AuthenticatedUser = Depends(get_current_user)):
    response = supabase.table("profiles").select("*").eq("id", user.id).single().execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return response.data


@router.put("/me")
async def update_my_profile(body: ProfileUpdate, user: AuthenticatedUser = Depends(get_current_user)):
    update_data = {k: v for k, v in body.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = supabase_admin.table("profiles").update(update_data).eq("id", user.id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return result.data[0]


@router.delete("/me")
async def delete_my_account(user: AuthenticatedUser = Depends(get_current_user)):
    try:
        supabase_admin.auth.admin.delete_user(user.id)
        return {"message": "Account deleted"}
    except AuthApiError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to delete account")


@router.get("/{user_id}")
async def get_user_profile(user_id: str):
    response = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return response.data


@router.put("/{user_id}")
async def update_user_profile(user_id: str, body: ProfileUpdate, user: AuthenticatedUser = Depends(get_current_user)):
    if user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    update_data = {k: v for k, v in body.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = supabase_admin.table("profiles").update(update_data).eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return result.data[0]


@router.get("/{user_id}/reviews")
async def get_user_reviews(user_id: str):
    result = supabase.table("reviews").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    return {"results": result.data}
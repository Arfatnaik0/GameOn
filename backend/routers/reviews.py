from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from middleware.auth import get_current_user, AuthenticatedUser
import os
from db import supabase, supabase_admin

router = APIRouter(prefix="/reviews", tags=["reviews"])



class ReviewCreate(BaseModel):
    rawg_game_id: int
    rating: int = Field(..., ge=1, le=10)
    review_text: Optional[str] = None


class ReviewUpdate(BaseModel):
    rating: int = Field(..., ge=1, le=10)
    review_text: Optional[str] = None


@router.get("/game/{game_id}")
async def get_reviews_for_game(game_id: int):
    result = supabase.table("reviews")\
        .select("*, profiles(username, avatar_url)")\
        .eq("rawg_game_id", game_id)\
        .order("created_at", desc=True)\
        .execute()
    return {"results": result.data}


@router.get("/me/count")
async def get_my_review_count(current_user: AuthenticatedUser = Depends(get_current_user)):
    result = supabase_admin.table("reviews")\
        .select("id", count="exact")\
        .eq("user_id", current_user.id)\
        .execute()
    return {"count": result.count}

@router.get("/me")
async def get_my_reviews(current_user: AuthenticatedUser = Depends(get_current_user)):
    result = supabase_admin.table("reviews")\
        .select("*")\
        .eq("user_id", current_user.id)\
        .order("created_at", desc=True)\
        .execute()
    return {"results": result.data}


@router.get("/game/{game_id}/mine")
async def get_my_review_for_game(game_id: int, current_user: AuthenticatedUser = Depends(get_current_user)):
    result = supabase_admin.table("reviews")\
        .select("*")\
        .eq("rawg_game_id", game_id)\
        .eq("user_id", current_user.id)\
        .execute()
    return {"review": result.data[0] if result.data else None}


@router.post("/")
async def create_review(body: ReviewCreate, current_user: AuthenticatedUser = Depends(get_current_user)):
    try:
        result = supabase_admin.table("reviews").insert({
            "user_id": current_user.id,
            "rawg_game_id": body.rawg_game_id,
            "rating": body.rating,
            "review_text": body.review_text,
        }).execute()
        return {"review": result.data[0]}
    except Exception as e:
        print(f"Review insert error: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{review_id}")
async def update_review(review_id: str, body: ReviewUpdate, current_user: AuthenticatedUser = Depends(get_current_user)):
    result = supabase_admin.table("reviews")\
        .update({"rating": body.rating, "review_text": body.review_text})\
        .eq("id", review_id)\
        .eq("user_id", current_user.id)\
        .execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"review": result.data[0]}

@router.get("/")
async def get_all_reviews(page: int=1,page_size:int=20):
    offset = (page -1) * page_size

    result =supabase.table("reviews")\
        .select("*",count="exact")\
        .order("created_at", desc=True)\
        .range(offset, offset + page_size - 1)\
        .execute()
    
    reviews=result.data

    for review in reviews:
        try:
            profile = supabase.table("profiles")\
                .select("username, avatar_url")\
                .eq("id", review["user_id"])\
                .single()\
                .execute()
            review["profiles"] = profile.data
        except Exception:
            review["profiles"] = {"username": "Anonymous", "avatar_url": None}

    return {
        "results": reviews,
        "total": result.count,
        "page": page,
        "page_size": page_size,
        "total_pages":-(-result.count // page_size)
    }


@router.delete("/{review_id}")
async def delete_review(review_id: str, current_user: AuthenticatedUser = Depends(get_current_user)):
    result = supabase_admin.table("reviews")\
        .delete()\
        .eq("id", review_id)\
        .eq("user_id", current_user.id)\
        .execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"message": "Review deleted"}

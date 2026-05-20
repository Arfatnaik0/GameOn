from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Literal
import logging
from middleware.auth import get_current_user, AuthenticatedUser
import os
from db import supabase, supabase_admin

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/lists", tags=["lists"])


class ListEntry(BaseModel):
    rawg_game_id: int
    status: Literal['want_to_play', 'playing', 'played']


class StatusUpdate(BaseModel):
    status: Literal['want_to_play', 'playing', 'played']


@router.get("/me")
async def get_my_list(current_user: AuthenticatedUser = Depends(get_current_user)):
    result = supabase_admin.table("user_game_lists")\
        .select("*")\
        .eq("user_id", current_user.id)\
        .order("created_at", desc=True)\
        .execute()
    return {"results": result.data}


@router.get("/me/{rawg_game_id}")
async def get_game_status(rawg_game_id: int, current_user: AuthenticatedUser = Depends(get_current_user)):
    result = supabase_admin.table("user_game_lists")\
        .select("*")\
        .eq("user_id", current_user.id)\
        .eq("rawg_game_id", rawg_game_id)\
        .execute()
    return {"entry": result.data[0] if result.data else None}


@router.post("/")
async def add_to_list(body: ListEntry, current_user: AuthenticatedUser = Depends(get_current_user)):
    try:
        result = supabase_admin.table("user_game_lists").insert({
            "user_id": current_user.id,
            "rawg_game_id": body.rawg_game_id,
            "status": body.status,
        }).execute()
        return {"entry": result.data[0]}
    except Exception as e:
        logger.error("List insert error: %s", e)
        raise HTTPException(status_code=400, detail="Failed to add to list")


@router.put("/{rawg_game_id}")
async def update_status(rawg_game_id: int, body: StatusUpdate, current_user: AuthenticatedUser = Depends(get_current_user)):
    result = supabase_admin.table("user_game_lists")\
        .update({"status": body.status})\
        .eq("user_id", current_user.id)\
        .eq("rawg_game_id", rawg_game_id)\
        .execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"entry": result.data[0]}


@router.delete("/{rawg_game_id}")
async def remove_from_list(rawg_game_id: int, current_user: AuthenticatedUser = Depends(get_current_user)):
    result = supabase_admin.table("user_game_lists")\
        .delete()\
        .eq("user_id", current_user.id)\
        .eq("rawg_game_id", rawg_game_id)\
        .execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"message": "Removed from list"}
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

from db import supabase_admin
from middleware.auth import AuthenticatedUser, get_current_user
from routers.reviews import enrich_reviews_with_reactions

router = APIRouter(prefix="/socials", tags=["socials"])


class FriendRequestCreate(BaseModel):
    profile_id: str


def _get_profile_map(user_ids: list[str]) -> dict:
    unique_ids = list({user_id for user_id in user_ids if user_id})
    if not unique_ids:
        return {}

    result = supabase_admin.table("profiles")\
        .select("id, username, avatar_url, bio, created_at")\
        .in_("id", unique_ids)\
        .execute()
    return {profile.get("id"): profile for profile in (result.data or [])}


def _relationship_with_profile(row: dict, current_user_id: str) -> dict:
    other_id = row.get("addressee_id") if row.get("requester_id") == current_user_id else row.get("requester_id")
    return {
        **row,
        "profile_id": other_id,
    }


def _friend_ids_for_user(user_id: str) -> list[str]:
    result = supabase_admin.table("friendships")\
        .select("requester_id, addressee_id")\
        .eq("status", "accepted")\
        .or_(f"requester_id.eq.{user_id},addressee_id.eq.{user_id}")\
        .execute()

    friend_ids = []
    for row in result.data or []:
        friend_ids.append(row.get("addressee_id") if row.get("requester_id") == user_id else row.get("requester_id"))
    return [friend_id for friend_id in friend_ids if friend_id]


@router.get("/summary")
async def get_social_summary(current_user: AuthenticatedUser = Depends(get_current_user)):
    result = supabase_admin.table("friendships")\
        .select("*")\
        .or_(f"requester_id.eq.{current_user.id},addressee_id.eq.{current_user.id}")\
        .order("updated_at", desc=True)\
        .execute()

    rows = result.data or []
    profile_ids = []
    for row in rows:
        if row.get("requester_id") != current_user.id:
            profile_ids.append(row.get("requester_id"))
        if row.get("addressee_id") != current_user.id:
            profile_ids.append(row.get("addressee_id"))

    profiles = _get_profile_map(profile_ids)

    friends = []
    incoming_requests = []
    outgoing_requests = []

    for row in rows:
        item = _relationship_with_profile(row, current_user.id)
        item["profile"] = profiles.get(item["profile_id"])

        if row.get("status") == "accepted":
            friends.append(item)
        elif row.get("status") == "pending" and row.get("addressee_id") == current_user.id:
            incoming_requests.append(item)
        elif row.get("status") == "pending" and row.get("requester_id") == current_user.id:
            outgoing_requests.append(item)

    return {
        "friends": friends,
        "incoming_requests": incoming_requests,
        "outgoing_requests": outgoing_requests,
    }


@router.get("/search")
async def search_profiles(q: str, current_user: AuthenticatedUser = Depends(get_current_user)):
    query = q.strip()
    if len(query) < 2:
        return {"results": []}

    result = supabase_admin.table("profiles")\
        .select("id, username, avatar_url, bio")\
        .ilike("username", f"%{query}%")\
        .neq("id", current_user.id)\
        .limit(8)\
        .execute()

    return {"results": result.data or []}


@router.post("/requests")
async def send_friend_request(body: FriendRequestCreate, current_user: AuthenticatedUser = Depends(get_current_user)):
    target_id = body.profile_id
    if target_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot add yourself")

    target = supabase_admin.table("profiles")\
        .select("id")\
        .eq("id", target_id)\
        .limit(1)\
        .execute()
    if not target.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    existing = supabase_admin.table("friendships")\
        .select("*")\
        .or_(
            f"and(requester_id.eq.{current_user.id},addressee_id.eq.{target_id}),"
            f"and(requester_id.eq.{target_id},addressee_id.eq.{current_user.id})"
        )\
        .limit(1)\
        .execute()

    if existing.data:
        row = existing.data[0]
        if row.get("status") == "accepted":
            raise HTTPException(status_code=409, detail="You are already friends")
        if row.get("addressee_id") == current_user.id:
            raise HTTPException(status_code=409, detail="This player already sent you a request")
        raise HTTPException(status_code=409, detail="Friend request already sent")

    result = supabase_admin.table("friendships").insert({
        "requester_id": current_user.id,
        "addressee_id": target_id,
        "status": "pending",
    }).execute()

    return {"request": result.data[0]}


@router.post("/requests/{request_id}/accept")
async def accept_friend_request(request_id: str, current_user: AuthenticatedUser = Depends(get_current_user)):
    result = supabase_admin.table("friendships")\
        .update({"status": "accepted"})\
        .eq("id", request_id)\
        .eq("addressee_id", current_user.id)\
        .eq("status", "pending")\
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Friend request not found")
    return {"friendship": result.data[0]}


@router.delete("/requests/{request_id}")
async def delete_friend_request(request_id: str, current_user: AuthenticatedUser = Depends(get_current_user)):
    result = supabase_admin.table("friendships")\
        .delete()\
        .eq("id", request_id)\
        .eq("status", "pending")\
        .or_(f"requester_id.eq.{current_user.id},addressee_id.eq.{current_user.id}")\
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Friend request not found")
    return {"message": "Friend request removed"}


@router.delete("/friends/{friend_id}")
async def remove_friend(friend_id: str, current_user: AuthenticatedUser = Depends(get_current_user)):
    result = supabase_admin.table("friendships")\
        .delete()\
        .eq("status", "accepted")\
        .or_(
            f"and(requester_id.eq.{current_user.id},addressee_id.eq.{friend_id}),"
            f"and(requester_id.eq.{friend_id},addressee_id.eq.{current_user.id})"
        )\
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Friendship not found")
    return {"message": "Friend removed"}


@router.get("/friend-reviews")
async def get_friend_reviews(
    page: int = 1,
    page_size: int = 10,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    page = max(1, page)
    page_size = max(1, min(page_size, 20))

    friend_ids = _friend_ids_for_user(current_user.id)
    if not friend_ids:
        return {
            "results": [],
            "total": 0,
            "page": page,
            "page_size": page_size,
            "total_pages": 1,
        }

    offset = (page - 1) * page_size
    result = supabase_admin.table("reviews")\
        .select("*, profiles(username, avatar_url)", count="exact")\
        .in_("user_id", friend_ids)\
        .order("created_at", desc=True)\
        .range(offset, offset + page_size - 1)\
        .execute()

    enriched = enrich_reviews_with_reactions(result.data or [], current_user.id)
    total = result.count or 0

    return {
        "results": enriched,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, -(-total // page_size)),
    }

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Literal
import os
from middleware.auth import get_current_user, get_optional_user, AuthenticatedUser
from db import supabase, supabase_admin

router = APIRouter(prefix="/reviews", tags=["reviews"])

ACHIEVEMENT_TARGETS = [5, 10, 25, 50, 100]
POPULAR_REVIEW_CANDIDATE_LIMIT = max(50, int(os.getenv("POPULAR_REVIEW_CANDIDATE_LIMIT", "400")))



class ReviewCreate(BaseModel):
    rawg_game_id: int
    rating: int = Field(..., ge=1, le=10)
    review_text: Optional[str] = None


class ReviewUpdate(BaseModel):
    rating: int = Field(..., ge=1, le=10)
    review_text: Optional[str] = None


class ReviewReactionUpdate(BaseModel):
    reaction: Literal["like", "dislike"]


def get_latest_achievement_target(review_count: int) -> Optional[int]:
    latest = None
    for target in ACHIEVEMENT_TARGETS:
        if review_count >= target:
            latest = target
    return latest


def enrich_reviews_with_reactions(reviews: list, current_user_id: Optional[str] = None) -> list:
    if not reviews:
        return []

    review_ids = [review.get("id") for review in reviews if review.get("id")]
    if not review_ids:
        return reviews

    reaction_data = []
    try:
        reaction_rows = supabase_admin.table("review_reactions") \
            .select("review_id, user_id, reaction") \
            .in_("review_id", review_ids) \
            .execute()
        reaction_data = reaction_rows.data or []
    except Exception as e:
        # Keep review feeds available even if reactions table is not ready yet.
        print(f"Review reaction aggregation skipped: {e}")

    counts_by_review = {review_id: {"like": 0, "dislike": 0} for review_id in review_ids}
    user_reaction_by_review = {}

    reviewer_ids = list({review.get("user_id") for review in reviews if review.get("user_id")})
    review_count_by_user = {reviewer_id: 0 for reviewer_id in reviewer_ids}
    if reviewer_ids:
        try:
            review_count_rows = supabase_admin.table("reviews") \
                .select("user_id") \
                .in_("user_id", reviewer_ids) \
                .execute()
            for row in review_count_rows.data or []:
                reviewer_id = row.get("user_id")
                if reviewer_id in review_count_by_user:
                    review_count_by_user[reviewer_id] += 1
        except Exception as e:
            print(f"Review achievement aggregation skipped: {e}")

    for row in reaction_data:
        review_id = row.get("review_id")
        reaction = row.get("reaction")
        if review_id not in counts_by_review:
            counts_by_review[review_id] = {"like": 0, "dislike": 0}

        if reaction == "like":
            counts_by_review[review_id]["like"] += 1
        elif reaction == "dislike":
            counts_by_review[review_id]["dislike"] += 1

        if current_user_id and row.get("user_id") == current_user_id:
            user_reaction_by_review[review_id] = reaction

    enriched = []
    for review in reviews:
        review_id = review.get("id")
        like_count = counts_by_review.get(review_id, {}).get("like", 0)
        dislike_count = counts_by_review.get(review_id, {}).get("dislike", 0)
        review_count = review_count_by_user.get(review.get("user_id"), 0)
        latest_achievement_target = get_latest_achievement_target(review_count)
        enriched.append({
            **review,
            "like_count": like_count,
            "dislike_count": dislike_count,
            "score": like_count - dislike_count,
            "current_user_reaction": user_reaction_by_review.get(review_id),
            "review_count": review_count,
            "latest_achievement_target": latest_achievement_target,
        })

    return enriched


@router.get("/game/{game_id}")
async def get_reviews_for_game(game_id: int, current_user: Optional[AuthenticatedUser] = Depends(get_optional_user)):
    result = supabase.table("reviews")\
        .select("*, profiles(username, avatar_url)")\
        .eq("rawg_game_id", game_id)\
        .order("created_at", desc=True)\
        .execute()

    enriched = enrich_reviews_with_reactions(
        result.data or [],
        current_user.id if current_user else None,
    )
    return {"results": enriched}


@router.get("/me/count")
async def get_my_review_count(current_user: AuthenticatedUser = Depends(get_current_user)):
    result = supabase_admin.table("reviews")\
        .select("id", count="exact")\
        .eq("user_id", current_user.id)\
        .execute()
    return {"count": result.count}


@router.get("/me/like-notifications")
async def get_my_like_notifications(current_user: AuthenticatedUser = Depends(get_current_user)):
    my_reviews_result = supabase_admin.table("reviews")\
        .select("id, rawg_game_id, review_text")\
        .eq("user_id", current_user.id)\
        .execute()

    my_reviews = my_reviews_result.data or []
    if not my_reviews:
        return {
            "total_likes": 0,
            "review_count": 0,
            "notifications": [],
        }

    review_by_id = {review.get("id"): review for review in my_reviews if review.get("id")}
    review_ids = list(review_by_id.keys())
    if not review_ids:
        return {
            "total_likes": 0,
            "review_count": len(my_reviews),
            "notifications": [],
        }

    like_rows = []
    try:
        likes_result = supabase_admin.table("review_reactions")\
            .select("review_id, created_at")\
            .eq("reaction", "like")\
            .in_("review_id", review_ids)\
            .execute()
        like_rows = likes_result.data or []
    except Exception as e:
        # Table might not be provisioned yet; return safe empty notifications.
        print(f"Like notifications aggregation skipped: {e}")
        return {
            "total_likes": 0,
            "review_count": len(my_reviews),
            "notifications": [],
        }

    notifications_map = {}
    for row in like_rows:
        review_id = row.get("review_id")
        if review_id not in review_by_id:
            continue

        source_review = review_by_id[review_id]
        if review_id not in notifications_map:
            review_text = (source_review.get("review_text") or "").strip()
            notifications_map[review_id] = {
                "review_id": review_id,
                "rawg_game_id": source_review.get("rawg_game_id"),
                "review_excerpt": review_text[:120] if review_text else "No written review.",
                "like_count": 0,
                "latest_liked_at": None,
            }

        notifications_map[review_id]["like_count"] += 1

        created_at = row.get("created_at")
        if created_at:
            latest = notifications_map[review_id]["latest_liked_at"]
            if not latest or str(created_at) > str(latest):
                notifications_map[review_id]["latest_liked_at"] = created_at

    notifications = sorted(
        notifications_map.values(),
        key=lambda item: (
            item.get("like_count", 0),
            str(item.get("latest_liked_at") or ""),
        ),
        reverse=True,
    )

    total_likes = sum(item.get("like_count", 0) for item in notifications)
    return {
        "total_likes": total_likes,
        "review_count": len(my_reviews),
        "notifications": notifications,
    }

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


@router.post("/{review_id}/reaction")
async def set_review_reaction(
    review_id: str,
    body: ReviewReactionUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    review = supabase.table("reviews")\
        .select("id")\
        .eq("id", review_id)\
        .limit(1)\
        .execute()
    if not review.data:
        raise HTTPException(status_code=404, detail="Review not found")

    try:
        supabase_admin.table("review_reactions")\
            .upsert({
                "review_id": review_id,
                "user_id": current_user.id,
                "reaction": body.reaction,
            }, on_conflict="review_id,user_id")\
            .execute()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Reaction system is not configured yet. Please create the review_reactions table in Supabase."
        )

    return {"message": "Reaction saved", "reaction": body.reaction}


@router.delete("/{review_id}/reaction")
async def clear_review_reaction(review_id: str, current_user: AuthenticatedUser = Depends(get_current_user)):
    try:
        supabase_admin.table("review_reactions")\
            .delete()\
            .eq("review_id", review_id)\
            .eq("user_id", current_user.id)\
            .execute()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Reaction system is not configured yet. Please create the review_reactions table in Supabase."
        )

    return {"message": "Reaction removed"}


@router.get("/popular")
async def get_popular_reviews(
    page: int = 1,
    page_size: int = 5,
    current_user: Optional[AuthenticatedUser] = Depends(get_optional_user)
):
    page = max(1, page)
    page_size = max(1, min(page_size, 20))

    result = supabase.table("reviews")\
        .select("*, profiles(username, avatar_url)")\
        .order("created_at", desc=True)\
        .range(0, POPULAR_REVIEW_CANDIDATE_LIMIT - 1)\
        .execute()

    enriched = enrich_reviews_with_reactions(
        result.data or [],
        current_user.id if current_user else None,
    )

    ranked = sorted(
        enriched,
        key=lambda review: (
            review.get("like_count", 0),
            review.get("score", 0),
            str(review.get("created_at") or ""),
        ),
        reverse=True,
    )

    total = len(ranked)
    offset = (page - 1) * page_size
    paged = ranked[offset: offset + page_size]
    total_pages = max(1, -(-total // page_size))

    return {
        "results": paged,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }

@router.get("/")
async def get_all_reviews(
    page: int = 1,
    page_size: int = 20,
    current_user: Optional[AuthenticatedUser] = Depends(get_optional_user)
):
    offset = (page - 1) * page_size

    result = supabase.table("reviews")\
        .select("*, profiles(username, avatar_url)", count="exact")\
        .order("created_at", desc=True)\
        .range(offset, offset + page_size - 1)\
        .execute()

    enriched = enrich_reviews_with_reactions(
        result.data or [],
        current_user.id if current_user else None,
    )

    return {
        "results": enriched,
        "total": result.count,
        "page": page,
        "page_size": page_size,
        "total_pages": -(-result.count // page_size)
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

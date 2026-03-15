from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, Request
import os
from services import rawg

router = APIRouter(prefix="/games", tags=["games"])
SEARCH_RATE_LIMIT_PER_MINUTE = int(os.getenv("SEARCH_RATE_LIMIT_PER_MINUTE", "60"))
_search_rate_limit_hits = defaultdict(deque)


def _get_client_ip(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _enforce_search_rate_limit(request: Request) -> None:
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(minutes=1)
    client_ip = _get_client_ip(request)
    hits = _search_rate_limit_hits[client_ip]

    while hits and hits[0] < cutoff:
        hits.popleft()

    if len(hits) >= SEARCH_RATE_LIMIT_PER_MINUTE:
        raise HTTPException(status_code=429, detail="Too many search requests. Try again in a minute.")

    hits.append(now)

@router.get("/search")
async def search_games(request: Request, q: str, page: int = 1):
    _enforce_search_rate_limit(request)
    data = await rawg.search_games(query=q, page=page)
    games = [
        {
            "id": g["id"],
            "name": g["name"],
            "cover": g["background_image"],
            "rating": g["rating"],
            "released": g["released"],
            "genres": [genre["name"] for genre in g["genres"]],
        }
        for g in data["results"]
    ]
    return {"count": data["count"], "results": games}


@router.get("/featured")
async def get_featured_games():
    data = await rawg.get_featured_games()
    games = [
        {
            "id": g["id"],
            "name": g["name"],
            "cover": g["background_image"],
            "rating": g["rating"],
            "released": g["released"],
            "genres": [genre["name"] for genre in g["genres"]],
        }
        for g in data["results"]
    ]
    return {"results": games}


@router.get("/popular")
async def get_popular_games():
    data = await rawg.get_popular_games()
    games = [
        {
            "id": g["id"],
            "name": g["name"],
            "cover": g["background_image"],
            "rating": g["rating"],
            "released": g["released"],
            "genres": [genre["name"] for genre in g["genres"]],
        }
        for g in data["results"]
    ]
    return {"results": games}


@router.get("/{game_id}")
async def get_game(game_id: int):
    return await rawg.get_game(game_id)


@router.get("/{game_id}/screenshots")
async def get_screenshots(game_id: int):
    return await rawg.get_game_screenshots(game_id)
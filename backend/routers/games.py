from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone
from urllib.parse import urlparse

from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import Response
from pydantic import BaseModel, Field
import os
from services import rawg, store_prices

router = APIRouter(prefix="/games", tags=["games"])
SEARCH_RATE_LIMIT_PER_MINUTE = int(os.getenv("SEARCH_RATE_LIMIT_PER_MINUTE", "60"))
_search_rate_limit_hits = defaultdict(deque)


class GameBatchRequest(BaseModel):
    ids: list[int] = Field(default_factory=list, max_length=50)


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


@router.get("/image-proxy")
async def proxy_game_image(url: str = Query(..., min_length=10, max_length=2000)):
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"}:
        raise HTTPException(status_code=400, detail="Invalid image URL scheme")

    host = (parsed.hostname or "").lower()
    if not host.endswith("rawg.io"):
        raise HTTPException(status_code=400, detail="Only RAWG image URLs are supported")

    try:
        upstream = await rawg.client.get(
            url,
            headers={"Accept": "image/*"},
            follow_redirects=True,
        )
    except Exception:
        raise HTTPException(status_code=502, detail="Failed to fetch upstream image")

    if upstream.status_code >= 400:
        raise HTTPException(status_code=502, detail="Upstream image request failed")

    content_type = upstream.headers.get("content-type", "")
    if not content_type.startswith("image/"):
        raise HTTPException(status_code=415, detail="Upstream URL did not return an image")

    return Response(
        content=upstream.content,
        media_type=content_type,
        headers={
            "Cache-Control": "public, max-age=2592000, immutable",
        },
    )


@router.post("/batch")
async def get_games_batch(body: GameBatchRequest):
    unique_ids = []
    seen = set()
    for game_id in body.ids:
        if game_id in seen:
            continue
        seen.add(game_id)
        unique_ids.append(game_id)

    games = await rawg.get_games_batch(unique_ids)
    game_by_id = {
        game.get("id"): game
        for game in games
        if game
    }
    return {"results": [game_by_id.get(game_id) for game_id in body.ids]}


@router.get("/{game_id}")
async def get_game(game_id: int):
    return await rawg.get_game(game_id)


@router.get("/{game_id}/prices")
async def get_game_prices(game_id: int, country: str = Query("US", min_length=2, max_length=2)):
    game = await rawg.get_game(game_id)
    return await store_prices.get_game_prices(game, country=country)


@router.get("/{game_id}/screenshots")
async def get_screenshots(game_id: int):
    return await rawg.get_game_screenshots(game_id)

import httpx
import os
from fastapi import HTTPException
from datetime import datetime, timedelta, timezone
from db import supabase, supabase_admin

RAWG_BASE_URL = "https://api.rawg.io/api"

client = httpx.AsyncClient(timeout=10.0)

def _build_params(extra: dict = None) -> dict:
    return {
        'key': os.getenv("RAWG_API_KEY"),
        **(extra or {})
    }

async def _get(endpoint: str, params: dict = None) -> dict:
    url = f"{RAWG_BASE_URL}{endpoint}"
    try:
        response = await client.get(url, params=_build_params(params))
        response.raise_for_status()
        return response.json()
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="RAWG API request timed out")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail="RAWG API error")

def _is_stale(last_fetched_str: str) -> bool:
    last_fetched = datetime.fromisoformat(last_fetched_str.replace("Z", "+00:00"))
    return datetime.now(timezone.utc) - last_fetched > timedelta(days=7)

async def _cache_games(games: list) -> None:
    rows = [
        {
            "rawg_id": game["id"],
            "data": game,
            "last_fetched": datetime.now(timezone.utc).isoformat()
        }
        for game in games
    ]
    supabase_admin.table("games_cache").upsert(rows).execute()

async def get_game(game_id: int) -> dict:
    cached = supabase_admin.table("games_cache")\
        .select("data, last_fetched")\
        .eq("rawg_id", game_id)\
        .execute()

    if cached.data and not _is_stale(cached.data[0]["last_fetched"]):
        return cached.data[0]["data"]

    data = await _get(f"/games/{game_id}")
    supabase_admin.table("games_cache").upsert({
        "rawg_id": game_id,
        "data": data,
        "last_fetched": datetime.now(timezone.utc).isoformat()
    }).execute()
    return data

async def get_game_screenshots(game_id: int) -> dict:
    return await _get(f"/games/{game_id}/screenshots")

async def search_games(query: str, page: int = 1) -> dict:
    return await _get("/games", {
        "search": query,
        "page": page,
        "page_size": 20
    })

async def get_genres() -> dict:
    return await _get("/genres")

async def get_platforms() -> dict:
    return await _get("/platforms")

async def get_featured_games():
    today = datetime.today().strftime('%Y-%m-%d')
    forty_days_ago = (datetime.today() - timedelta(days=40)).strftime('%Y-%m-%d')
    data = await _get("/games", {
        "ordering": "-rating",
        "dates": f"{forty_days_ago},{today}",
        "page_size": 5,
    })
    await _cache_games(data["results"])
    return data

async def get_popular_games():
    one_year_ago = (datetime.today() - timedelta(days=365)).strftime('%Y-%m-%d')
    today = datetime.today().strftime('%Y-%m-%d')
    data = await _get("/games", {
        "ordering": "-rating",
        "dates": f"{one_year_ago},{today}",
        "page_size": 20,
    })
    await _cache_games(data["results"])
    return data
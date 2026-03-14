import httpx
import os
from fastapi import HTTPException

RAWG_BASE_URL = "https://api.rawg.io/api"

client=httpx.AsyncClient(timeout=10.0)

def _build_params(extra:dict=None)->dict:
    return {
        'key':os.getenv("RAWG_API_KEY"),
        **extra
    }

async def _get(endpoint:str,params:dict=None)->dict:
    url=f"{RAWG_BASE_URL}{endpoint}"
    try:
        response = await client.get(url,params=_build_params(params))
        response.raise_for_status()
        return response.json()
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="RAWG API request timed out")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail="RAWG API error")

async def search_games(query: str, page: int = 1) -> dict:
    return await _get("/games", {
        "search": query,
        "page": page,
        "page_size": 20
    })

async def get_game(game_id: int) -> dict:
    return await _get(f"/games/{game_id}")

async def get_game_screenshots(game_id: int) -> dict:
    return await _get(f"/games/{game_id}/screenshots")

async def get_genres() -> dict:
    return await _get("/genres")


async def get_platforms() -> dict:
    return await _get("/platforms")
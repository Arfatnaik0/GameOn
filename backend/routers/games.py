from fastapi import APIRouter
from services import rawg

router = APIRouter(prefix="/games", tags=["games"])

@router.get("/search")
async def search_games(q: str, page: int = 1):
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
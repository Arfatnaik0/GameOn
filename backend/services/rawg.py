import asyncio
import logging
import os
from datetime import datetime, timedelta, timezone
from typing import Awaitable, Callable

import httpx
from fastapi import HTTPException

from db import supabase_admin

RAWG_BASE_URL = "https://api.rawg.io/api"

logger = logging.getLogger(__name__)

client = httpx.AsyncClient(timeout=httpx.Timeout(10.0, connect=5.0))


def _get_feed_cache_ttl_seconds() -> int:
    value = os.getenv("FEED_CACHE_TTL_SECONDS", "21600")
    try:
        return max(int(value), 0)
    except ValueError:
        logger.warning("Invalid FEED_CACHE_TTL_SECONDS value '%s'. Using 21600.", value)
        return 21600


FEED_CACHE_TTL_SECONDS = _get_feed_cache_ttl_seconds()
SEARCH_CACHE_TTL_SECONDS = int(os.getenv("SEARCH_CACHE_TTL_SECONDS", "3600"))
SCREENSHOT_CACHE_TTL_SECONDS = int(os.getenv("SCREENSHOT_CACHE_TTL_SECONDS", "86400"))

_featured_cache = {"data": None, "expires_at": None}
_popular_cache = {"data": None, "expires_at": None}
_search_cache = {}
_screenshots_cache = {}
_featured_lock = asyncio.Lock()
_popular_lock = asyncio.Lock()
_game_refresh_locks: dict[int, asyncio.Lock] = {}
_background_game_refreshes: set[int] = set()


def _build_params(extra: dict | None = None) -> dict:
    return {
        "key": os.getenv("RAWG_API_KEY"),
        **(extra or {}),
    }


async def _get(endpoint: str, params: dict | None = None) -> dict:
    url = f"{RAWG_BASE_URL}{endpoint}"
    try:
        response = await client.get(url, params=_build_params(params))
        response.raise_for_status()
        return response.json()
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="RAWG API request timed out")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail="RAWG API error")


def _is_stale(last_fetched_str: str | None) -> bool:
    if not last_fetched_str:
        return True
    try:
        last_fetched = datetime.fromisoformat(last_fetched_str.replace("Z", "+00:00"))
    except ValueError:
        return True
    return datetime.now(timezone.utc) - last_fetched > timedelta(days=7)


def _feed_cache_hit(cache_bucket: dict) -> bool:
    data = cache_bucket.get("data")
    expires_at = cache_bucket.get("expires_at")
    return (
        data is not None
        and expires_at is not None
        and datetime.now(timezone.utc) < expires_at
    )


def _ttl_cache_get(cache: dict, key):
    item = cache.get(key)
    if not item:
        return None
    if datetime.now(timezone.utc) >= item["expires_at"]:
        cache.pop(key, None)
        return None
    return item["data"]


def _ttl_cache_set(cache: dict, key, data: dict, ttl_seconds: int) -> None:
    cache[key] = {
        "data": data,
        "expires_at": datetime.now(timezone.utc) + timedelta(seconds=ttl_seconds),
    }


def _run_background(coro: Awaitable[None]) -> None:
    task = asyncio.create_task(coro)

    def _done_callback(done_task: asyncio.Task) -> None:
        try:
            done_task.result()
        except Exception as exc:
            logger.warning("Background task failed: %s", exc)

    task.add_done_callback(_done_callback)


def _upsert_games_sync(rows: list[dict]) -> None:
    if rows:
        supabase_admin.table("games_cache").upsert(rows).execute()


def _upsert_game_sync(game_id: int, data: dict) -> None:
    supabase_admin.table("games_cache").upsert(
        {
            "rawg_id": game_id,
            "data": data,
            "last_fetched": datetime.now(timezone.utc).isoformat(),
        }
    ).execute()


async def _cache_games(games: list) -> None:
    rows = [
        {
            "rawg_id": game["id"],
            "data": game,
            "last_fetched": datetime.now(timezone.utc).isoformat(),
        }
        for game in games
    ]
    await asyncio.to_thread(_upsert_games_sync, rows)


async def _get_or_refresh_feed(
    cache_bucket: dict,
    lock: asyncio.Lock,
    fetcher: Callable[[], Awaitable[dict]],
) -> tuple[dict, bool]:
    if _feed_cache_hit(cache_bucket):
        return cache_bucket["data"], False

    async with lock:
        if _feed_cache_hit(cache_bucket):
            return cache_bucket["data"], False

        data = await fetcher()
        cache_bucket["data"] = data
        cache_bucket["expires_at"] = datetime.now(timezone.utc) + timedelta(
            seconds=FEED_CACHE_TTL_SECONDS
        )
        return data, True


async def _refresh_game_cache(game_id: int) -> None:
    try:
        lock = _game_refresh_locks.setdefault(game_id, asyncio.Lock())
        async with lock:
            data = await _get(f"/games/{game_id}")
            await asyncio.to_thread(_upsert_game_sync, game_id, data)
    finally:
        _background_game_refreshes.discard(game_id)


async def get_game(game_id: int) -> dict:
    cached = await asyncio.to_thread(
        lambda: supabase_admin.table("games_cache")
        .select("data, last_fetched")
        .eq("rawg_id", game_id)
        .execute()
    )

    if cached.data:
        cached_row = cached.data[0]
        cached_data = cached_row["data"]
        if not _is_stale(cached_row.get("last_fetched")):
            return cached_data

        if game_id not in _background_game_refreshes:
            _background_game_refreshes.add(game_id)
            _run_background(_refresh_game_cache(game_id))
        return cached_data

    data = await _get(f"/games/{game_id}")

    # Cache writes should never block request latency.
    _run_background(asyncio.to_thread(_upsert_game_sync, game_id, data))
    return data


async def get_games_batch(game_ids: list[int]) -> list[dict | None]:
    normalized_ids = []
    seen = set()
    for game_id in game_ids:
        if not game_id or game_id in seen:
            continue
        seen.add(game_id)
        normalized_ids.append(game_id)

    if not normalized_ids:
        return []

    cached = await asyncio.to_thread(
        lambda: supabase_admin.table("games_cache")
        .select("rawg_id, data, last_fetched")
        .in_("rawg_id", normalized_ids)
        .execute()
    )

    cache_by_id = {row["rawg_id"]: row for row in (cached.data or [])}
    missing_ids = [game_id for game_id in normalized_ids if game_id not in cache_by_id]

    for game_id, row in cache_by_id.items():
        if _is_stale(row.get("last_fetched")) and game_id not in _background_game_refreshes:
            _background_game_refreshes.add(game_id)
            _run_background(_refresh_game_cache(game_id))

    if missing_ids:
        semaphore = asyncio.Semaphore(4)

        async def _fetch_missing(game_id: int):
            async with semaphore:
                try:
                    data = await _get(f"/games/{game_id}")
                    _run_background(asyncio.to_thread(_upsert_game_sync, game_id, data))
                    return game_id, {"rawg_id": game_id, "data": data}
                except HTTPException:
                    logger.warning("Failed to fetch missing game %s from RAWG", game_id)
                    return game_id, None

        fetched = await asyncio.gather(*[_fetch_missing(game_id) for game_id in missing_ids])
        for game_id, row in fetched:
            if row:
                cache_by_id[game_id] = row

    return [cache_by_id.get(game_id, {}).get("data") for game_id in game_ids]


async def get_game_screenshots(game_id: int) -> dict:
    cached = _ttl_cache_get(_screenshots_cache, game_id)
    if cached:
        return cached

    data = await _get(f"/games/{game_id}/screenshots")
    _ttl_cache_set(_screenshots_cache, game_id, data, SCREENSHOT_CACHE_TTL_SECONDS)
    return data


async def search_games(query: str, page: int = 1) -> dict:
    normalized_query = query.strip().lower()
    cache_key = (normalized_query, page)
    cached = _ttl_cache_get(_search_cache, cache_key)
    if cached:
        return cached

    data = await _get(
        "/games",
        {
            "search": normalized_query,
            "page": page,
            "page_size": 20,
        },
    )
    if data.get("results"):
        _run_background(_cache_games(data["results"]))
    _ttl_cache_set(_search_cache, cache_key, data, SEARCH_CACHE_TTL_SECONDS)
    return data


async def get_genres() -> dict:
    return await _get("/genres")


async def get_platforms() -> dict:
    return await _get("/platforms")


async def get_featured_games():
    async def _fetch() -> dict:
        today = datetime.now(timezone.utc).date()
        forty_days_ago = today - timedelta(days=40)
        return await _get(
            "/games",
            {
                "ordering": "-rating",
                "dates": f"{forty_days_ago},{today}",
                "page_size": 5,
            },
        )

    data, refreshed = await _get_or_refresh_feed(_featured_cache, _featured_lock, _fetch)

    if refreshed and data.get("results"):
        _run_background(_cache_games(data["results"]))

    return data


async def get_popular_games():
    async def _fetch() -> dict:
        today = datetime.now(timezone.utc).date()
        one_year_ago = today - timedelta(days=365)
        return await _get(
            "/games",
            {
                "ordering": "-rating",
                "dates": f"{one_year_ago},{today}",
                "page_size": 20,
            },
        )

    data, refreshed = await _get_or_refresh_feed(_popular_cache, _popular_lock, _fetch)

    if refreshed and data.get("results"):
        _run_background(_cache_games(data["results"]))

    return data

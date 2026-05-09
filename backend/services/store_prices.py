import html
import logging
import os
import re
from datetime import datetime, timedelta, timezone
from urllib.parse import urlparse

from services.rawg import client

logger = logging.getLogger(__name__)

PRICE_CACHE_TTL_SECONDS = int(os.getenv("PRICE_CACHE_TTL_SECONDS", "3600"))
CHEAPSHARK_EPIC_STORE_ID = "25"

STORE_CONFIG = {
    "steam": {"name": "Steam", "aliases": {"steam"}},
    "epic_games": {"name": "Epic Games", "aliases": {"epic-games", "epic_games", "epic"}},
    "playstation_store": {"name": "PlayStation Store", "aliases": {"playstation-store", "playstation_store", "playstation"}},
    "xbox_store": {"name": "Xbox Store", "aliases": {"xbox-store", "xbox_store", "xbox"}},
}

STORE_ORDER = ["steam", "epic_games", "playstation_store", "xbox_store"]
PRICE_REQUEST_HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Accept-Language": "en-US,en;q=0.9",
}

_price_cache = {}


def _cache_get(cache_key: tuple[int, str]):
    cached = _price_cache.get(cache_key)
    if not cached:
        return None
    if datetime.now(timezone.utc) >= cached["expires_at"]:
        _price_cache.pop(cache_key, None)
        return None
    return cached["data"]


def _cache_set(cache_key: tuple[int, str], data: dict) -> None:
    _price_cache[cache_key] = {
        "data": data,
        "expires_at": datetime.now(timezone.utc) + timedelta(seconds=PRICE_CACHE_TTL_SECONDS),
    }


def _normalize_store_key(slug: str | None) -> str | None:
    if not slug:
        return None
    normalized = str(slug).strip().lower().replace(" ", "-").replace("_", "-")
    for store_key, config in STORE_CONFIG.items():
        if normalized in config["aliases"]:
            return store_key
    return None


def _default_store_entry(store_key: str, url: str | None = None) -> dict:
    return {
        "store_key": store_key,
        "store_name": STORE_CONFIG[store_key]["name"],
        "status": "unavailable" if url else "not_listed",
        "has_price": False,
        "current_price": None,
        "current_price_text": None,
        "original_price": None,
        "original_price_text": None,
        "currency": None,
        "discount_percent": 0,
        "url": url,
        "note": "Store page found, but live price could not be fetched." if url else "This game is not linked to this store in RAWG.",
    }


def _price_payload(
    store_key: str,
    *,
    url: str | None,
    status: str,
    current_price_text: str | None = None,
    original_price_text: str | None = None,
    currency: str | None = None,
    discount_percent: int = 0,
    note: str | None = None,
) -> dict:
    return {
        "store_key": store_key,
        "store_name": STORE_CONFIG[store_key]["name"],
        "status": status,
        "has_price": bool(current_price_text) or status == "free",
        "current_price": None,
        "current_price_text": current_price_text,
        "original_price": None,
        "original_price_text": original_price_text,
        "currency": currency,
        "discount_percent": discount_percent,
        "url": url,
        "note": note,
    }


def _extract_store_links(game: dict) -> dict[str, str]:
    links = {}
    for item in game.get("stores") or []:
        store = item.get("store") or {}
        store_key = _normalize_store_key(store.get("slug"))
        url = item.get("url_en") or item.get("url")
        if store_key and url and store_key not in links:
            links[store_key] = url
    return links


def _slugify_title(value: str) -> str:
    normalized = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return normalized or "game"


def _normalize_title_for_match(value: str | None) -> str:
    return re.sub(r"[^a-z0-9]+", " ", (value or "").lower()).strip()


def _essential_query_tokens(value: str | None) -> set[str]:
    normalized = _normalize_title_for_match(value)
    stopwords = {
        "the",
        "a",
        "an",
        "of",
        "and",
        "for",
        "to",
        "edition",
        "game",
    }
    return {
        token
        for token in normalized.split()
        if token not in stopwords
    }


def _has_essential_token_coverage(query: str | None, candidate: str | None) -> bool:
    query_tokens = _essential_query_tokens(query)
    candidate_tokens = _essential_query_tokens(candidate)
    return bool(query_tokens) and query_tokens.issubset(candidate_tokens)


def _dedupe_preserve_order(values: list[str]) -> list[str]:
    seen = set()
    result = []
    for value in values:
        normalized = value.strip()
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        result.append(normalized)
    return result


def _game_title_variants(game: dict) -> list[str]:
    name = str(game.get("name") or "").strip()
    slug_name = str(game.get("slug") or "").replace("-", " ").strip()
    digitless_name = re.sub(r"\b\d+\b", " ", name)
    digitless_name = re.sub(r"\s+", " ", digitless_name).strip()
    return _dedupe_preserve_order([
        name,
        digitless_name,
        slug_name,
        re.sub(r"\b\d+\b", " ", slug_name).strip(),
    ])


def _preferred_search_query(game: dict) -> str:
    variants = _game_title_variants(game)
    primary = variants[0] if variants else ""
    if not primary:
        return primary

    tokens = primary.split()
    has_mid_title_digit = any(token.isdigit() and index < len(tokens) - 1 for index, token in enumerate(tokens))
    if has_mid_title_digit:
        for variant in variants[1:]:
            if variant and not re.search(r"\b\d+\b", variant):
                return variant
    return primary


def _title_penalty(candidate: str | None) -> int:
    normalized = _normalize_title_for_match(candidate)
    penalties = [
        "dlc",
        "add on",
        "addon",
        "season pass",
        "expansion pass",
        "soundtrack",
        "language pack",
        "cash card",
        "shark card",
        "armor set",
        "card set",
        "bundle",
        "controller",
        "headset",
        "console",
    ]
    score = 0
    for term in penalties:
        if term in normalized:
            score += 220
    return score


def _version_mismatch_penalty(query: str | None, candidate: str | None) -> int:
    normalized_query = _normalize_title_for_match(query)
    normalized_candidate = _normalize_title_for_match(candidate)
    version_terms = [
        "vr",
        "online",
        "enhanced",
        "remastered",
        "definitive",
        "special edition",
        "deluxe",
        "ultimate",
        "complete edition",
        "director s cut",
        "gold edition",
        "premium edition",
        "expansion pass",
        "shadow of the erdtree",
        "nightreign",
    ]
    penalty = 0
    for term in version_terms:
        if term in normalized_candidate and term not in normalized_query:
            penalty += 160
    return penalty


def _is_confident_console_match(query: str | None, candidate: str | None) -> bool:
    normalized_query = _normalize_title_for_match(query)
    normalized_candidate = _normalize_title_for_match(candidate)
    if not normalized_query or not normalized_candidate:
        return False

    if normalized_candidate == normalized_query:
        return True

    query_tokens = _essential_query_tokens(query)
    candidate_tokens = _essential_query_tokens(candidate)
    if query_tokens and not query_tokens.issubset(candidate_tokens):
        return False

    if normalized_candidate.startswith(normalized_query):
        suffix = normalized_candidate[len(normalized_query):].strip()
        allowed_suffixes = {
            "",
            "ps4",
            "ps5",
            "ps4 ps5",
            "xbox one",
            "xbox series x s",
            "windows",
            "for windows",
        }
        if suffix in allowed_suffixes:
            return True

    return False


def _is_price_text_numeric(value: str | None) -> bool:
    return bool(value and re.search(r"[$€£]\s*\d", value))


def _is_non_purchase_price_text(value: str | None) -> bool:
    normalized = (value or "").strip().lower()
    return normalized in {"included", "game trial", "trial", "unavailable"}


def _title_match_score(query: str, candidate: str) -> int:
    normalized_query = _normalize_title_for_match(query)
    normalized_candidate = _normalize_title_for_match(candidate)
    if not normalized_query or not normalized_candidate:
        return -1
    if normalized_query == normalized_candidate:
        return 1000
    score = 0
    if normalized_query in normalized_candidate:
        score += 400
    if normalized_candidate in normalized_query:
        score += 250
    query_words = set(normalized_query.split())
    candidate_words = set(normalized_candidate.split())
    score += len(query_words & candidate_words) * 25
    missing_tokens = _essential_query_tokens(query) - _essential_query_tokens(candidate)
    score -= len(missing_tokens) * 200
    score -= _title_penalty(candidate)
    score -= _version_mismatch_penalty(query, candidate)
    return score


def _best_title_match_score(game: dict, candidate: str | None) -> int:
    return max(
        (_title_match_score(query, candidate or "") for query in _game_title_variants(game)),
        default=-1,
    )


def _has_variant_coverage(game: dict, candidate: str | None) -> bool:
    return any(
        _has_essential_token_coverage(query, candidate)
        for query in _game_title_variants(game)
    )


def _build_store_search_url(store_key: str, game: dict) -> str | None:
    query = _preferred_search_query(game) or (game.get("name") or game.get("slug") or "")
    if not query:
        return None
    if store_key == "steam":
        return f"https://store.steampowered.com/search/?term={query.replace(' ', '%20')}"
    if store_key == "epic_games":
        return f"https://store.epicgames.com/en-US/browse?q={query.replace(' ', '%20')}&sortBy=relevancy&sortDir=DESC&count=40"
    if store_key == "playstation_store":
        return f"https://store.playstation.com/en-us/search/{query.replace(' ', '%20')}"
    if store_key == "xbox_store":
        return f"https://www.xbox.com/en-US/search?q={query.replace(' ', '%20')}"
    return None


def _epic_slug_candidates(game: dict) -> list[str]:
    title = game.get("name") or ""
    slug = game.get("slug") or ""
    raw_candidates = [
        _slugify_title(title),
        _slugify_title(title.replace(":", "")),
        _slugify_title(title.replace("&", "and")),
        _slugify_title(slug),
        _slugify_title(slug.replace("-", " ")),
    ]
    candidates = []
    seen = set()
    for candidate in raw_candidates:
        if candidate and candidate not in seen:
            seen.add(candidate)
            candidates.append(candidate)
    return candidates


def _extract_steam_app_id(url: str) -> str | None:
    match = re.search(r"/app/(\d+)", url)
    return match.group(1) if match else None


async def _fetch_text(url: str) -> str:
    response = await client.get(
        url,
        headers=PRICE_REQUEST_HEADERS,
        follow_redirects=True,
        timeout=15.0,
    )
    response.raise_for_status()
    return response.text


async def _fetch_steam_price(url: str, country: str) -> dict:
    app_id = _extract_steam_app_id(url)
    if not app_id:
        return _default_store_entry("steam", url)

    response = await client.get(
        "https://store.steampowered.com/api/appdetails",
        params={"appids": app_id, "cc": country.lower()},
        headers=PRICE_REQUEST_HEADERS,
        follow_redirects=True,
        timeout=15.0,
    )
    response.raise_for_status()
    data = response.json().get(app_id) or {}
    if not data.get("success"):
        return _default_store_entry("steam", url)

    game = data.get("data") or {}
    if game.get("is_free"):
        return _price_payload(
            "steam",
            url=url,
            status="free",
            current_price_text="Free",
            note="Live price from Steam",
        )

    price = game.get("price_overview") or {}
    final_text = price.get("final_formatted")
    if final_text:
        return _price_payload(
            "steam",
            url=url,
            status="priced",
            current_price_text=final_text,
            original_price_text=price.get("initial_formatted") or final_text,
            currency=price.get("currency"),
            discount_percent=price.get("discount_percent") or 0,
            note="Live price from Steam",
        )

    return _default_store_entry("steam", url)


async def _search_steam_price(game: dict, country: str) -> dict:
    steam_appid = game.get("steam_appid")
    if steam_appid:
        return await _fetch_steam_price(f"https://store.steampowered.com/app/{steam_appid}", country)

    search_url = _build_store_search_url("steam", game)
    if not search_url:
        return _default_store_entry("steam")

    html_text = await _fetch_text(search_url)
    result_blocks = re.findall(
        r'<a href="https://store\.steampowered\.com/app/(\d+)/[^"]*".*?class="search_result_row.*?<span class="title">([^<]+)</span>',
        html_text,
        re.I | re.S,
    )
    if not result_blocks:
        return _price_payload(
            "steam",
            url=search_url,
            status="unavailable",
            note="Steam search page is available, but no matching product was resolved.",
        )

    best_app_id, best_title = max(
        result_blocks,
        key=lambda item: _best_title_match_score(game, html.unescape(item[1]).strip()),
    )
    if _best_title_match_score(game, best_title) < 150 or not _has_variant_coverage(game, best_title):
        return _price_payload(
            "steam",
            url=search_url,
            status="unavailable",
            note="Steam search results were ambiguous, so no price was selected.",
        )

    app_id = best_app_id
    return await _fetch_steam_price(f"https://store.steampowered.com/app/{app_id}", country)


def _extract_playstation_price(html_text: str) -> tuple[str | None, str | None]:
    pairs = []
    for match in re.finditer(r'"priceOrText":"([^"]+)","originalPrice":"([^"]*)"', html_text):
        current_price = html.unescape(match.group(1).strip()) or None
        original_price = html.unescape(match.group(2).strip()) or None
        pairs.append((current_price, original_price))

    for current_price, original_price in pairs:
        if _is_price_text_numeric(current_price) or (str(current_price).lower() == "free"):
            return current_price, original_price

    for current_price, original_price in pairs:
        if _is_non_purchase_price_text(current_price) and _is_price_text_numeric(original_price):
            return original_price, original_price

    text_matches = re.findall(r'data-qa="mfeCtaMain#offer\d+#finalPrice"[^>]*>([^<]+)<', html_text)
    for value in text_matches:
        parsed_value = html.unescape(value.strip()) or None
        if _is_price_text_numeric(parsed_value) or (str(parsed_value).lower() == "free"):
            return parsed_value, None

    return None, None


async def _fetch_playstation_price(url: str) -> dict:
    html_text = await _fetch_text(url)
    current_price, original_price = _extract_playstation_price(html_text)
    if not current_price:
        return _default_store_entry("playstation_store", url)

    lowered = current_price.lower()
    if "free" in lowered:
        return _price_payload(
            "playstation_store",
            url=url,
            status="free",
            current_price_text=current_price,
            original_price_text=original_price,
            note="Live price from PlayStation Store",
        )

    return _price_payload(
        "playstation_store",
        url=url,
        status="priced",
        current_price_text=current_price,
        original_price_text=original_price or current_price,
        note="Live price from PlayStation Store",
    )


async def _search_playstation_price(game: dict) -> dict:
    search_url = _build_store_search_url("playstation_store", game)
    if not search_url:
        return _default_store_entry("playstation_store")

    html_text = await _fetch_text(search_url)
    tile_matches = re.finditer(
        r'(<div data-qa="search#productTile\d+".*?</a>)',
        html_text,
        re.I | re.S,
    )

    candidates = []
    for match in tile_matches:
        block = match.group(1)
        href_match = re.search(r'href="([^"]+)"', block, re.I)
        telemetry_match = re.search(r'data-telemetry-meta="([^"]+)"', block, re.I | re.S)
        if not href_match or not telemetry_match:
            continue
        product_href = href_match.group(1)
        telemetry = html.unescape(telemetry_match.group(1))
        name_match = re.search(r'"name":"([^"]+)"', telemetry, re.I)
        price_match = re.search(r'"price":"([^"]+)"', telemetry, re.I)
        product_name = html.unescape(name_match.group(1).strip()) if name_match else None
        current_price = html.unescape(price_match.group(1).strip()) if price_match else None
        candidates.append({
            "href": product_href,
            "name": product_name,
            "price": current_price,
            "score": _best_title_match_score(game, product_name),
        })

    if not candidates:
        return _price_payload(
            "playstation_store",
            url=search_url,
            status="unavailable",
            note="PlayStation search page is available, but no matching product was resolved.",
        )

    best = max(candidates, key=lambda item: item["score"])
    if best["score"] < 150 or not _has_variant_coverage(game, best["name"]) or not any(
        _is_confident_console_match(query, best["name"])
        for query in _game_title_variants(game)
    ):
        return _price_payload(
            "playstation_store",
            url=search_url,
            status="unavailable",
            note="PlayStation search results were ambiguous, so no base-game price was selected.",
        )
    product_href = best["href"]
    current_price = best["price"]
    product_name = best["name"]
    full_url = f"https://store.playstation.com{product_href}" if product_href else search_url

    if product_href:
        direct_price = await _fetch_playstation_price(full_url)
        if direct_price.get("has_price"):
            direct_price["note"] = f"{product_name or 'PlayStation listing'} resolved via store search"
            return direct_price

    if not current_price:
        return _price_payload(
            "playstation_store",
            url=full_url,
            status="unavailable",
            note="PlayStation search page is available, but no matching price was resolved.",
        )

    return _price_payload(
        "playstation_store",
        url=full_url,
        status="free" if "free" in current_price.lower() else "priced",
        current_price_text=current_price,
        original_price_text=current_price,
        note=f"{product_name or 'PlayStation listing'} resolved via store search",
    )


def _extract_xbox_price(html_text: str) -> tuple[str | None, str | None]:
    price_match = re.search(
        r'ProductDetailsHeader-module__price[^>]*>.*?<span[^>]*>\s*([^<]+?)\s*</span>',
        html_text,
        re.S,
    )
    list_match = re.search(r'List price was\s*([^<]+?)<', html_text, re.I)
    current_price = html.unescape(price_match.group(1).strip()) if price_match else None
    original_price = html.unescape(list_match.group(1).strip()) if list_match else None
    return current_price, original_price


async def _fetch_xbox_price(url: str) -> dict:
    html_text = await _fetch_text(url)
    current_price, original_price = _extract_xbox_price(html_text)
    if not current_price:
        return _default_store_entry("xbox_store", url)

    lowered = current_price.lower()
    if "free" in lowered:
        return _price_payload(
            "xbox_store",
            url=url,
            status="free",
            current_price_text=current_price,
            original_price_text=original_price,
            note="Live price from Xbox Store",
        )

    return _price_payload(
        "xbox_store",
        url=url,
        status="priced",
        current_price_text=current_price,
        original_price_text=original_price or current_price,
        note="Live price from Xbox Store",
    )


async def _search_xbox_price(game: dict) -> dict:
    search_url = _build_store_search_url("xbox_store", game)
    if not search_url:
        return _default_store_entry("xbox_store")

    html_text = await _fetch_text(search_url)
    product_matches = re.finditer(
        r'"productId":"([^"]+)"(?:(?!"productId":)[\s\S]){0,6000}?"specificPrices":\{"purchaseable":\[\{.*?"discountPercentage":(\d+).*?"listPrice":([\d.]+).*?"msrp":([\d.]+).*?"currency":"([^"]+)".*?"title":"([^"]+)"',
        html_text,
        re.I | re.S,
    )
    candidates = []
    for match in product_matches:
        product_id, discount_percent, list_price, msrp, currency, title = match.groups()
        candidates.append({
            "product_id": product_id,
            "discount_percent": discount_percent,
            "list_price": list_price,
            "msrp": msrp,
            "currency": currency,
            "title": title,
            "score": _best_title_match_score(game, title),
        })

    if not candidates:
        return _price_payload(
            "xbox_store",
            url=search_url,
            status="unavailable",
            note="Xbox search page is available, but no matching price was resolved.",
        )

    best = max(candidates, key=lambda item: item["score"])
    if best["score"] < 150 or not _has_variant_coverage(game, best["title"]) or not any(
        _is_confident_console_match(query, best["title"])
        for query in _game_title_variants(game)
    ):
        return _price_payload(
            "xbox_store",
            url=search_url,
            status="unavailable",
            note="Xbox search results were ambiguous, so no base-game price was selected.",
        )
    product_id = best["product_id"]
    discount_percent = best["discount_percent"]
    list_price = best["list_price"]
    msrp = best["msrp"]
    currency = best["currency"]
    title = best["title"]
    current_price_text = f"${float(list_price):.2f}+"
    original_price_text = f"${float(msrp):.2f}" if float(msrp) != float(list_price) else current_price_text
    product_url = f"https://www.xbox.com/en-US/games/store/{_slugify_title(title)}/{product_id.lower()}"

    return _price_payload(
        "xbox_store",
        url=product_url,
        status="priced",
        current_price_text=current_price_text,
        original_price_text=original_price_text,
        currency=currency,
        discount_percent=int(discount_percent),
        note=f"{title} resolved via Xbox search",
    )


async def _fetch_epic_price(url: str) -> dict:
    try:
        await _fetch_text(url)
    except Exception:
        return _price_payload(
            "epic_games",
            url=url,
            status="unavailable",
            note="Epic blocked automated price fetch for this request, but the store page is linked.",
        )

    return _price_payload(
        "epic_games",
        url=url,
        status="unavailable",
        note="Epic store page is available, but live price parsing is not supported yet.",
    )


async def _search_epic_price(game: dict) -> dict:
    search_url = _build_store_search_url("epic_games", game)
    deals = []
    for query in _game_title_variants(game):
        response = await client.get(
            "https://www.cheapshark.com/api/1.0/deals",
            params={"title": query, "storeID": CHEAPSHARK_EPIC_STORE_ID, "pageSize": 10},
            headers=PRICE_REQUEST_HEADERS,
            follow_redirects=True,
            timeout=15.0,
        )
        response.raise_for_status()
        deals = response.json() or []
        if deals:
            break

    candidates = []
    for deal in deals:
        title = deal.get("title")
        candidates.append({
            "title": title,
            "sale_price": deal.get("salePrice"),
            "normal_price": deal.get("normalPrice"),
            "is_on_sale": deal.get("isOnSale") == "1",
            "score": _best_title_match_score(game, title),
        })

    if not candidates:
        return _price_payload(
            "epic_games",
            url=search_url,
            status="unavailable",
            note="Epic price lookup did not find a confident match, so this falls back to store search.",
        )

    best = max(candidates, key=lambda item: item["score"])
    if best["score"] < 150 or not _has_variant_coverage(game, best["title"]) or not any(
        _is_confident_console_match(query, best["title"])
        for query in _game_title_variants(game)
    ):
        return _price_payload(
            "epic_games",
            url=search_url,
            status="unavailable",
            note="Epic price lookup found only ambiguous titles or wrong editions, so no price was selected.",
        )

    sale_price = best["sale_price"]
    normal_price = best["normal_price"]
    current_price_text = f"${float(sale_price):.2f}" if sale_price is not None else None
    original_price_text = f"${float(normal_price):.2f}" if normal_price is not None else current_price_text
    discount_percent = 0
    if sale_price is not None and normal_price is not None and float(normal_price) > 0:
        discount_percent = max(0, round((1 - (float(sale_price) / float(normal_price))) * 100))

    return _price_payload(
        "epic_games",
        url=search_url,
        status="priced" if current_price_text else "unavailable",
        current_price_text=current_price_text,
        original_price_text=original_price_text,
        currency="USD",
        discount_percent=discount_percent,
        note=f"{best['title']} price via CheapShark Epic feed. Open Store goes to Epic search results to avoid age-gated product redirects.",
    )


async def _resolve_store_price(store_key: str, url: str | None, country: str, game: dict) -> dict:
    try:
        if store_key == "steam":
            return await (_fetch_steam_price(url, country) if url else _search_steam_price(game, country))
        if store_key == "playstation_store":
            return await (_fetch_playstation_price(url) if url else _search_playstation_price(game))
        if store_key == "xbox_store":
            return await (_fetch_xbox_price(url) if url else _search_xbox_price(game))
        if store_key == "epic_games":
            return await (_fetch_epic_price(url) if url else _search_epic_price(game))
    except Exception as exc:
        host = urlparse(url).netloc if url else "search"
        logger.warning("Price fetch failed for %s (%s): %s", store_key, host, exc)
    return _default_store_entry(store_key, url or _build_store_search_url(store_key, game))


async def get_game_prices(game: dict, country: str = "US") -> dict:
    game_id = int(game["id"])
    normalized_country = (country or "US").upper()
    cache_key = (game_id, normalized_country)
    cached = _cache_get(cache_key)
    if cached:
        return cached

    links = _extract_store_links(game)
    store_entries = {
        store_key: _default_store_entry(store_key, links.get(store_key))
        for store_key in STORE_ORDER
    }

    for store_key in STORE_ORDER:
        url = links.get(store_key)
        store_entries[store_key] = await _resolve_store_price(store_key, url or None, normalized_country, game)

    payload = {
        "game_id": game_id,
        "country": normalized_country,
        "stores": [store_entries[store_key] for store_key in STORE_ORDER],
        "fetched_at": datetime.now(timezone.utc).isoformat(),
    }
    _cache_set(cache_key, payload)
    return payload

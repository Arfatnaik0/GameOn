from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
import os
import dotenv
from routers import games, users, reviews, lists, socials

dotenv.load_dotenv()

app = FastAPI()

app.add_middleware(GZipMiddleware, minimum_size=500)

frontend_urls = [
    origin.strip()
    for origin in os.getenv("FRONTEND_URLS", os.getenv("FRONTEND_URL", "http://localhost:5173")).split(",")
    if origin.strip()
]

if "*" in frontend_urls:
    raise RuntimeError("FRONTEND_URL/FRONTEND_URLS must not contain '*' when credentials are enabled")

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_urls,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

app.include_router(games.router)
app.include_router(users.router)
app.include_router(reviews.router)
app.include_router(lists.router)
app.include_router(socials.router)

@app.get("/health")
async def health():
    return {"status": "ok"}

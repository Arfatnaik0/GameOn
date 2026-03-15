from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import dotenv
from routers import games, users, reviews, lists

dotenv.load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

app.include_router(games.router)
app.include_router(users.router)
app.include_router(reviews.router)
app.include_router(lists.router)
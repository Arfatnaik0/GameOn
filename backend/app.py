from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import dotenv
from routers import games,users

app.include_router(games.router)
app.include_router(users.router)

dotenv.load_dotenv()

project_url = os.getenv("SUPABASE_URL")
anon_key = os.getenv("SUPABASE_ANON_KEY")
JWT_key = os.getenv("SUPABASE_JWT_SECRET")
rawg_api_key = os.getenv("RAWG_API_KEY")

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/")
def read_root():
    return {"Hello": "World"}

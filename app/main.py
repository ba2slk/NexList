from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from src.todos.router import router as post_router
from src.todos.database import engine, Base
from src.todos.models import Todo

Base.metadata.create_all(bind=engine)  # Base에 연결된 모든 Table 생성
# Base.metadata.drop_all(bind=engine)

# FastAPI Configuration
app = FastAPI(debug=True)
app.mount("/static", StaticFiles(directory="./src/static"), name="static")

# posts_router
app.include_router(post_router, prefix="/posts", tags=["Posts"])

# CORS 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# root
# app.get("/")
# def read_root(request: Request):
#     api_url = os.getenv("API_URL", "http://127.0.0.1:8000/todo")
#     return templates.TemplateResponse(
#         "index.html", {"request": request, "api_url": api_url}
#     )

import os
from database import Base, engine
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from todos.models import Todo
from todos.router import router as todos_router
from auth.router import router as auth_router

# Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)  # Base에 연결된 모든 Table 생성

# FastAPI Configuration
app = FastAPI(debug=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# include routers
app.include_router(todos_router)
app.include_router(auth_router)

# CORS 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://127.0.0.1:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # 이 파일이 위치한 절대 경로 상의 디렉토리 명
templates = Jinja2Templates(directory="templates")  # templates 폴더명 지정

@app.get("/main", response_class=HTMLResponse)
def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})
from database import Base, engine
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from todos.models import Todo
from todos.router import router as todos_router

# Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)  # Base에 연결된 모든 Table 생성

# FastAPI Configuration
app = FastAPI(debug=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# posts_router
app.include_router(todos_router)

# CORS 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
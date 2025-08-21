from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from nexlist.auth.router import router as auth_router
from nexlist.db.database import create_tables
from nexlist.memo.router import router as memo_router
from nexlist.todos.router import router as todos_router

# Create MySQL Tables
create_tables()

# FastAPI Configuration
app = FastAPI(debug=True)
app.mount("/assets", StaticFiles(directory="nexlist/static/dist/assets"), name="assets")

# include routers
app.include_router(todos_router)
app.include_router(auth_router)
app.include_router(memo_router)

# CORS 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://127.0.0.1:8000", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/{full_path:path}")
async def serve_react_app(request: Request, full_path: str):
    return FileResponse("static/dist/index.html")

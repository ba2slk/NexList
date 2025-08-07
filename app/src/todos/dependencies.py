from db.dependencies import get_db
from sqlalchemy.orm import Session
from fastapi import Depends
from todos.repository import TodoRepository
from todos.service import TodoService


# 서비스 의존성
def get_todo_service(db: Session = Depends(get_db)) -> TodoService:
    repo = TodoRepository(db)
    return TodoService(repo)
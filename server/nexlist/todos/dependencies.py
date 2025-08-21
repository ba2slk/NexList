from fastapi import Depends
from sqlalchemy.orm import Session

from nexlist.db.dependencies import get_db

from .repository import TodoRepository
from .service import TodoService


# 서비스 의존성
def get_todo_service(db: Session = Depends(get_db)) -> TodoService:
    repo = TodoRepository(db)
    return TodoService(repo)

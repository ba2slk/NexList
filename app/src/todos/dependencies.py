from db.dependencies import get_db
from fastapi import Depends
from todos.repository import TodoRepository
from todos.service import TodoService


# 서비스 의존성
def get_todo_service(repo=Depends(TodoRepository), db=Depends(get_db)):
    return TodoService(repo, db)
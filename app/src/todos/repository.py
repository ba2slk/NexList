# DB 접근 로직 담당
# : CRUD 동작을 라우터 또는 서비스 계층에 노출하기 위한 중간 계층 역할

from typing import List

from sqlalchemy.orm import Session
from todos.models import Todo
from todos.schemas import TodoCompletedStateToggle, TodoItem, TodoResponse
from auth.models import User


# READ: single todo
def get_todo_by_id(todo_id: int, user_id: int, db: Session) -> Todo | None:
    return db.query(Todo).filter(
        Todo.id == todo_id,
        Todo.user_id == user_id        
        ).first()


# READ: all todos
def get_all_todos(user_id: int, db: Session) -> List[Todo] | None:
    return db.query(Todo).filter(Todo.user_id == user_id).all()


# CREATE: single todo
def create_todo(todo: TodoItem, user_id: int, db: Session) -> Todo:
    new_todo = Todo(**todo.model_dump())
    new_todo.user_id = user_id
    db.add(new_todo)
    db.commit()
    db.refresh(new_todo)
    return new_todo


# DELETE: all todos
def remove_all_todos(user_id: int, db: Session) -> int:
    deleted = db.query(Todo).filter(Todo.user_id == user_id).delete()
    db.commit()
    return deleted  # 삭제된 row 수


# DELETE: single todo
def remove_todo_by_id(todo_id: int, user_id: int, db: Session) -> int:
    todo = get_todo_by_id(todo_id, user_id, db)
    if not todo:
        return None
    deleted = db.query(Todo).filter(
        Todo.id == todo_id,
        Todo.user_id == user_id
        ).delete()
    db.commit()
    return deleted


# UPDATE: todo
def update_todo_by_id(todo_id: int, change: TodoItem, user_id: int, db: Session) -> Todo:
    todo = get_todo_by_id(todo_id, user_id, db)
    if not todo:
        return None
    todo.task = change.task
    todo.due_date = change.due_date
    db.commit()
    db.refresh(todo)
    return todo


def update_completed_state_by_id(
    todo_id: int, state: TodoCompletedStateToggle, user_id: int, db: Session
) -> Todo:
    todo = get_todo_by_id(todo_id, user_id, db)
    if not todo:
        return None
    todo.is_done = state.is_done
    db.commit()
    db.refresh(todo)
    return todo

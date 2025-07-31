# DB 접근 로직 담당
# : CRUD 동작을 라우터 또는 서비스 계층에 노출하기 위한 중간 계층 역할

from typing import List

from sqlalchemy.orm import Session
from todos.models import Todo
from todos.schemas import TodoCompletedStateToggle, TodoItem, TodoResponse


# READ: single todo
def get_todo_by_id(todo_id: int, db: Session) -> Todo | None:
    return db.query(Todo).filter(Todo.id == todo_id).first()


# READ: all todos
def get_all_todos(db: Session) -> List[Todo] | None:
    return db.query(Todo).all()


# CREATE: single todo
def create_todo(todo: TodoItem, db: Session) -> Todo:
    new_todo = Todo(**todo.model_dump())
    db.add(new_todo)
    new_todo.task = todo.task
    new_todo.due_date = todo.due_date
    new_todo.is_done = False
    db.commit()
    db.refresh(new_todo)
    return new_todo


# DELETE: all todos
def remove_all_todos(db: Session) -> int:
    deleted = db.query(Todo).delete()
    db.commit()
    return deleted  # 삭제된 row 수


# DELEte: single todo
def remove_todo_by_id(todo_id: int, db: Session) -> int:
    todo = get_todo_by_id(todo_id, db)
    if not todo:
        return -1
    deleted = db.query(Todo).filter(Todo.id == todo_id).delete()
    db.commit()
    return deleted


# UPDATE: todo
def update_todo_by_id(todo_id: int, change: TodoItem, db: Session) -> Todo:
    todo = get_todo_by_id(todo_id, db)
    if not todo:
        return -1
    todo.task = change.task
    todo.due_date = change.due_date
    db.commit()
    db.refresh(todo)
    return todo


def update_completed_state_by_id(
    todo_id: int, state: TodoCompletedStateToggle, db: Session
) -> Todo:
    todo = get_todo_by_id(todo_id, db)
    if not todo:
        return -1
    todo.is_done = state.is_done
    db.commit()
    db.refresh(todo)
    return todo

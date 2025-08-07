from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from todos.constants import TODO_NOT_FOUND_DETAIL
from db.dependencies import get_db
from todos.repository import *
from todos.schemas import TodoCompletedStateToggle, TodoItem, TodoResponse
from auth.dependencies import get_current_user
from auth.models import User

router = APIRouter(prefix="/todos", tags=["Todos"])


# 할 일 추가하기
@router.post("/", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
def create_todo_item(
    todo: TodoItem,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    todo_item = create_todo(todo, user.id, db)
    return todo_item


# 할 일 목록 불러오기
@router.get("/", response_model=List[TodoResponse])
def read_todo_list(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    todo_list = get_all_todos(user.id, db)
    return todo_list


# 하나의 todo만 불러오기
@router.get("/{id}", response_model=TodoResponse)
def read_todo(
    id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    todo = get_todo_by_id(id, user.id, db)
    if not todo:
        raise HTTPException(status_code=404, detail=TODO_NOT_FOUND_DETAIL)
    return todo


# 리스트 초기화
@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo_list(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    remove_all_todos(user.id, db)


# 단일 아이템 삭제
@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(
    id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    deleted = remove_todo_by_id(id, user.id, db)
    if deleted is None:
        raise HTTPException(status_code=404, detail=TODO_NOT_FOUND_DETAIL)


# todo 내용 변경하기
@router.put("/{id}")
def update_todo(
    id: int,
    todo: TodoItem,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    updated = update_todo_by_id(id, todo, user.id, db)
    if updated is None:
        raise HTTPException(status_code=404, detail=TODO_NOT_FOUND_DETAIL)
    return updated


# todo 완료 상태 변경하기
@router.put("/{id}/toggle")
def update_todo_completed_state(
    id: int, 
    update: TodoCompletedStateToggle,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    updated = update_completed_state_by_id(id, update, user.id, db)
    if updated is None:
        raise HTTPException(status_code=404, detail=TODO_NOT_FOUND_DETAIL)
    return updated

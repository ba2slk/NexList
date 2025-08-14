from auth.dependencies import get_current_user
from auth.models import User
from fastapi import APIRouter, Depends, status, Query
from todos.dependencies import get_todo_service
from todos.schemas import TodoCompletedState, TodoItem, TodoResponse
from todos.service import TodoService
from typing import Optional

router = APIRouter(prefix="/todos", tags=["Todos"])


# 할 일 추가하기
@router.post(
    "/",
    response_model=TodoResponse,
    status_code=status.HTTP_201_CREATED
)
def create_todo_item(
    todo: TodoItem,
    service: TodoService = Depends(get_todo_service),
    user: User = Depends(get_current_user)
):
    return service.create_todo(todo, user)


# 할 일 목록 불러오기
@router.get(
    "/",
    response_model=list[TodoResponse],
    status_code=status.HTTP_200_OK
)
def read_todo_list(
    service: TodoService = Depends(get_todo_service),
    user: User = Depends(get_current_user),
    today: Optional[bool] = Query(
        default=None,
        description="오늘 할 일만: true, 오늘 할 일이 아닌 것만: false, 전체: 생략"
    )
):
    return service.get_all_todos(user, today)


# 하나의 todo만 불러오기
@router.get(
    "/{id}",
    response_model=TodoResponse,
    status_code=status.HTTP_200_OK
)
def read_todo(
    id: int,
    service: TodoService = Depends(get_todo_service),
    user: User = Depends(get_current_user)
):
    return service.get_todo_by_id(id, user)


# 리스트 초기화
@router.delete(
    "/",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_todo_list(
    service: TodoService = Depends(get_todo_service),
    user: User = Depends(get_current_user)
):
    service.remove_all_todos(user)


# 단일 아이템 삭제
@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_todo(
    id: int,
    service: TodoService = Depends(get_todo_service),
    user: User = Depends(get_current_user)
):
    service.remove_todo_by_id(id, user)


# todo 내용 변경하기
@router.put(
    "/{id}",
    response_model=TodoResponse,
    status_code=status.HTTP_200_OK
)
def update_todo(
    id: int,
    todo: TodoItem,
    service: TodoService = Depends(get_todo_service),
    user: User = Depends(get_current_user)
):
    return service.update_todo_by_id(todo, id, user)


# todo 완료 상태 변경하기
@router.put(
    "/{id}/completed",
    response_model=TodoResponse,
    status_code=status.HTTP_200_OK
)
def update_todo_completed_state(
    id: int,
    update: TodoCompletedState,
    service: TodoService = Depends(get_todo_service),
    user: User = Depends(get_current_user)
):
    return service.update_todo_completed_state_by_id(id, update, user)

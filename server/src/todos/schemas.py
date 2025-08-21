# 요청 & 응답 데이터 스키마

from datetime import date
from typing import Optional

from pydantic import BaseModel


# Request
class TodoItem(BaseModel):
    task: str
    due_date: Optional[date] = None
    today: bool


# Request
class TodoCompletedState(BaseModel):
    is_done: bool


# Request: update 'today' state.
class TodoTodayState(BaseModel):
    today: bool


# Response
class TodoResponse(BaseModel):
    id: int
    task: str
    due_date: Optional[date]
    is_done: bool
    today: bool

    class Config:
        from_attributes = True  # (deprecated) orm_mode

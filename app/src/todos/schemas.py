# 요청 & 응답 데이터 스키마

from typing import Optional
from pydantic import BaseModel


# Base Models
class TodoItem(BaseModel):
    task: str
    due_date: Optional[str] = None

    class Config:
        extra = "ignore"


class TodoUpdate(BaseModel):
    completed: bool

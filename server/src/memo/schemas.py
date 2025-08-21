from pydantic import BaseModel
from datetime import date
from typing import Optional


# PUT request
class MemoContent(BaseModel):
    content: str


# PUT response
class MemoUpdatedResponse(BaseModel):
    saved_at: date = date.today



class MemoResponse(BaseModel):
    user_id: int
    content: str
    saved_at: Optional[date]

    class Config:
        from_attributes = True
    
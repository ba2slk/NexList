from datetime import date

from pydantic import BaseModel


# PUT request
class MemoContent(BaseModel):
    content: str


# PUT response
class MemoUpdatedResponse(BaseModel):
    saved_at: date = date.today



class MemoResponse(BaseModel):
    user_id: int
    content: str
    saved_at: date | None

    class Config:
        from_attributes = True

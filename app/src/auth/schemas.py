from datetime import date
from pydantic import BaseModel


class UserInfo(BaseModel):
    id: int
    email: str
    name: str
    google_sub: str
    created_at: date


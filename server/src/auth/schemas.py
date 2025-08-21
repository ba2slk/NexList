from datetime import date
from pydantic import BaseModel, ConfigDict, Field


class UserInfoResponse(BaseModel):
    id: int
    email: str
    name: str
    created_at: date

    model_config = ConfigDict(from_attributes=True)


class GoogleUserInfoResponse(BaseModel):
    google_sub: str = Field(alias="id")  # google 응답 시 키 값이 'id'
    email: str
    verified_email: bool
    name: str
    given_name: str
    picture: str

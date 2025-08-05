# User 테이블 접근

from sqlalchemy.orm import Session
from auth.models import User
from auth.schemas import UserInfo


# CREATE: 신규 유저 추가
def add_user(user: UserInfo, db: Session) -> UserInfo:
    new_user = User(**user.model_dump())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# User 테이블 접근

from datetime import datetime

from sqlalchemy.orm import Session

from .models import User
from .schemas import GoogleUserInfoResponse, UserInfoResponse


# CREATE: 신규 유저 추가
def add_user(google_user_info: GoogleUserInfoResponse, db: Session) -> UserInfoResponse:
    # 기존 유저인지 확인
    existing_user: User = get_user_by_sub(google_user_info.google_sub, db)
    if existing_user:
        # .model_validate(): ORM 객체 -> Pydantic 모델(즉, API Response) 변환
        # schema.py에서 model_config = ConfigDict(from_attribute=True) 설정 필요
        return UserInfoResponse.model_validate(existing_user)

    # 신규 유저 생성
    new_user: User = User(**google_user_info.model_dump())
    new_user.created_at = datetime.now()

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return UserInfoResponse.model_validate(new_user)


def get_user_by_sub(sub: str, db: Session) -> User | None:
    return db.query(User).filter(User.google_sub == sub).first()

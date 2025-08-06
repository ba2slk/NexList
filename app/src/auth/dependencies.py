from fastapi import Depends, HTTPException, Request
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from dependencies import get_db
from auth.models import User
from auth.constants import JWT_SECRET_KEY, JWT_ALGORITHM


# 현재 로그인 상태인 유저를 반환
def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    token = request.cookies.get("access_token")

    if token is None:
        raise HTTPException(status_code=401, detail="Login Required")

    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid Token")

    except JWTError:
        raise HTTPException(status_code=401, detail="Token decode error")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return user

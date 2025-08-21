from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import Optional
from auth.constants import JWT_SECRET_KEY, ACCESS_TOKEN_EXPIRE_MINUTES, JWT_ALGORITHM


# jwt 토큰 생성
def create_jwt_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()

    # 토큰 만료 시간 설정
    if expires_delta:
        expire = datetime.now() + expires_delta
    else:
        expire = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    # 토큰 만료 시간 멤버 추가
    to_encode.update({"exp": expire})

    # jwt 인코딩
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

    return encoded_jwt


# jwt 토큰 복호화
def decode_jwt_token(token: str):
    try:
        return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])

    except jwt.JWTError:
        return None

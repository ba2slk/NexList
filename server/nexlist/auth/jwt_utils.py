from datetime import datetime, timedelta

from jose import jwt

from nexlist.config import settings


# jwt 토큰 생성
def create_jwt_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()

    # 토큰 만료 시간 설정
    if expires_delta:
        expire = datetime.now() + expires_delta
    else:
        expire = datetime.now() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTE)

    # 토큰 만료 시간 멤버 추가
    to_encode.update({"exp": expire})

    # jwt 인코딩
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

    return encoded_jwt


# jwt 토큰 복호화
def decode_jwt_token(token: str):
    try:
        return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])

    except jwt.JWTError:
        return None

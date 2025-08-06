import requests
from fastapi import APIRouter, HTTPException, Request, Response, Depends
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy.orm import Session
from auth.constants import *
from auth.repository import *
from auth.jwt_utils import *
from dependencies import get_db

""" Todo
0. 데이터베이스 확장
- users 테이블 생성
- todos 테이블에 user_id 외래키 추가


1. /google/callback 에서 신규유저 구분
1-1. 신규 유저라면 DB에 정보 저장
1-2. 기존 유저라면 access_token만 쿠키에 저장

"""

router = APIRouter(prefix="/auth")


@router.get("/login/google")
async def login_google():
    return RedirectResponse(url=GOOGLE_LOGIN_URL)


@router.get("/google/callback")
async def auth_google(code: str, db: Session = Depends(get_db)):
    token_url = GOOGLE_TOKEN_URL
    data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code",
    }

    # 토큰 요청
    token_response = requests.post(token_url, data=data)
    if token_response.status_code != 200:
        raise HTTPException(status_code=400, detail=TOKEN_OBTAIN_FAILED_DETAIL)

    access_token = token_response.json().get("access_token")

    # Google로부터 사용자 정보 받아오기
    headers = {"Authorization": f"Bearer {access_token}"}
    user_info_response = requests.get(GOOGLE_USER_INFO_ENDPOINT, headers=headers)

    if user_info_response.status_code != 200:
        response = Response(status_code=401)
        response.delete_cookie("access_token")
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    raw_json = user_info_response.json()
    user_info = GoogleUserInfoResponse(**raw_json)
    user = add_user(user_info, db)

    jwt_token = create_jwt_token({"user_id": user.id})

    # jwt 발급 후 /main 으로 redirection
    response = RedirectResponse(url="/main")
    response.set_cookie(
        key="access_token", value=jwt_token, httponly=True, samesite="lax"
    )

    return response


# 로그인 정보
@router.get("/me")
async def get_me(request: Request, db: Session = Depends(get_db)):
    # 클라이언트(브라우저)에 캐싱된 access_token을 받아옴.
    jwt_token = request.cookies.get("access_token")

    # access_token이 없다면 로그인 필요 -> 401 Unauthorized Error
    if not jwt_token:
        raise HTTPException(status_code=401, detail="Not logged in")

    # (임시)
    # user = get_user_by_sub(sub, db)
    headers = {"Authorization": f"Bearer {jwt_token}"}
    user_info_response = requests.get(GOOGLE_USER_INFO_ENDPOINT, headers=headers)

    return user_info_response.json()


@router.post("/logout")
async def logout():
    response = JSONResponse(content={"message": "Logged out"})
    response.delete_cookie("access_token")
    return response

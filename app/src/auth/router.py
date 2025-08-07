import requests
from fastapi import APIRouter, HTTPException, Response, Depends
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy.orm import Session
from auth.constants import *
from auth.repository import *
from auth.jwt_utils import *
from auth.dependencies import get_current_user
from auth.google_auth import *
from db.dependencies import get_db


router = APIRouter(prefix="/auth")


@router.get("/login/google")
async def login_google() -> RedirectResponse:
    """ Google 로그인 화면으로 리디렉션"""
    return RedirectResponse(url=GOOGLE_LOGIN_URL)


@router.get("/google/callback")
async def auth_google(code: str, db: Session = Depends(get_db)) -> RedirectResponse:
    """ Google로부터 access_token을 받아와서 신규 유저라면 DB에 등록하고 로그인한 사용자에게 jwt 토큰을 반환함.
    : SRP 위배 -> 책임 분리를 위한 리팩토링 필요
    """

    access_token = fetch_google_access_token(code)  #Google Access Token 발급
    
    google_user_info = fetch_google_user_info(access_token)  #유저 정보 획득
    user_info = add_user(google_user_info, db) #유저 정보 등록

    jwt_token = create_jwt_token({"user_id": user_info.id})  #jwt token 생성
    
    response = RedirectResponse(url="/main")  #jwt token 발급 및 main/ 리디렉션
    response.set_cookie(
        key="access_token", value=jwt_token, httponly=True, samesite="lax"
    )

    return response


@router.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    """ 로그인 상태 정보 제공 """
    return user


@router.post("/logout")
async def logout() -> JSONResponse:
    """ 유저 로그아웃
    : jwt_token(access_token)을 쿠키에서 삭제
    """
    response = JSONResponse(content={"message": "Logged out"})
    response.delete_cookie("access_token")
    return response

import requests
from fastapi import APIRouter, HTTPException, Request, Response
from fastapi.responses import JSONResponse, RedirectResponse
from .constants import *
from typing import Dict, Any

router = APIRouter(prefix="/auth")

@router.get("/login/google")
async def login_google() :
    return RedirectResponse(url=GOOGLE_LOGIN_URL)

@router.get("/google/callback")
async def auth_google(code: str):
    token_url = GOOGLE_TOKEN_URL
    data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code",
    }

    token_response = requests.post(token_url, data=data)
    if token_response.status_code != 200:
        raise HTTPException(status_code=400, detail=TOKEN_OBTAIN_FAILED_DETAIL)

    access_token = token_response.json().get("access_token")

    response = RedirectResponse(url="/main")
    response.set_cookie(key="access_token", value=access_token, httponly=True, samesite='lax')
    return response


# 추후 체화 필요 (내가 작성하지 않음.)
@router.get("/me")
async def get_me(request: Request):
    access_token = request.cookies.get("access_token")
    print("ACCESS_TOKEN:", access_token)
    if not access_token:
        raise HTTPException(status_code=401, detail="Not logged in")

    headers = {"Authorization": f"Bearer {access_token}"}
    user_info_response = requests.get(GOOGLE_USER_INFO_ENDPOINT, headers=headers)

    if user_info_response.status_code != 200:
        # Potentially invalid token, clear cookie and raise error
        response = Response(status_code=401)
        response.delete_cookie("access_token")
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return user_info_response.json()


@router.post("/logout")
async def logout():
    response = JSONResponse(content={"message": "Logged out"})
    response.delete_cookie("access_token")
    return response

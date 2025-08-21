import requests
from fastapi import HTTPException, Response

from nexlist.config import settings
from .schemas import GoogleUserInfoResponse



def fetch_google_access_token(code: str) -> str:
    """ Google 인증 서버에 토큰 요청 """

    token_url = settings.GOOGLE_TOKEN_URL
    data = {
        "code": code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code",
    }

    token_response = requests.post(token_url, data=data)
    if token_response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to obtain token")

    access_token = token_response.json().get("access_token")

    return access_token


def fetch_google_user_info(access_token: str) -> GoogleUserInfoResponse:
    """ Google로부터 사용자 정보 받아오기 """

    headers = {"Authorization": f"Bearer {access_token}"}
    user_info_response = requests.get(settings.GOOGLE_USER_INFO_ENDPOINT, headers=headers)

    if user_info_response.status_code != 200:
        response = Response(status_code=401)
        response.delete_cookie("access_token")
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    raw_json = user_info_response.json()
    user_info = GoogleUserInfoResponse(**raw_json)

    return user_info

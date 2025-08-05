import os

from dotenv import load_dotenv

load_dotenv()

# Google
# OAuth
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")

# Enpoints
GOOGLE_LOGIN_URL = f"https://accounts.google.com/o/oauth2/auth?response_type=code&client_id={GOOGLE_CLIENT_ID}&redirect_uri={GOOGLE_REDIRECT_URI}&scope=openid%20profile%20email&access_type=offline&prompt=select_account"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USER_INFO_ENDPOINT = "https://www.googleapis.com/oauth2/v1/userinfo"


# Details
TOKEN_OBTAIN_FAILED_DETAIL = "Failed to obtain access token from Google"
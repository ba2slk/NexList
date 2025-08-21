"""
Copyright 2025 Polar Software Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""

import os
from enum import StrEnum

from pydantic_settings import BaseSettings, SettingsConfigDict


class Environment(StrEnum):
    development = "development"
    testing = "testing"
    production = "production"


env = Environment(os.getenv("NEXLIST_ENV", Environment.development))
env_file = ".env.testing" if env == Environment.testing else ".env.dev"

class Settings(BaseSettings):
    ENV: Environment = Environment.development
    TESTING: bool = False

    # Backend url
    BASE_URL: str = ""

    # Frontend url
    FRONTEND_BASE_URL: str = ""

    # Google
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = ""
    GOOGLE_TOKEN_URL: str = "https://oauth2.googleapis.com/token"
    GOOGLE_USER_INFO_ENDPOINT: str = "https://www.googleapis.com/oauth2/v1/userinfo"

    #JWT
    JWT_SECRET_KEY: str = ""
    JWT_ALGORITHM: str = ""
    ACCESS_TOKEN_EXPIRE_MINUTE: int = 30

    # MySQL
    MYSQL_USER: str = ''
    MYSQL_PASSWORD: str = ''
    MYSQL_HOST: str = ""
    MYSQL_PORT: int = 3306
    MYSQL_DB_NAME: str = ""
    MYSQL_AUTHENTICATION_PLUGIN: str = ""

    model_config = SettingsConfigDict(
        env_prefix="NEXLIST_",
        case_sensitive=False,
        env_file=env_file,
        env_file_encoding="utf-8"
    )

settings = Settings()

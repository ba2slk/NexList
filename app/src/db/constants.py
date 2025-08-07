# Global Constants

import os
from urllib.parse import quote


from dotenv import load_dotenv

load_dotenv()

# Constants for MySQL connection
MYSQL_USER = os.getenv("MYSQL_USER")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")
MYSQL_HOST = os.getenv("MYSQL_HOST")
MYSQL_PORT = os.getenv("MYSQL_PORT")
MYSQL_DB_NAME = os.getenv("MYSQL_DB_NAME")
DB_URL = f"mysql+pymysql://{MYSQL_USER}:{quote(MYSQL_PASSWORD)}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB_NAME}?charset=utf8"

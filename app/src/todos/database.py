# mysql 연결 담당

from urllib.parse import quote
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from .constants import MYSQL_USER, MYSQL_PASSWORD, MYSQL_HOST, MYSQL_PORT, MYSQL_DB_NAME

mysql_user = MYSQL_USER
mysql_password = MYSQL_PASSWORD
mysql_host = MYSQL_HOST
mysql_port = MYSQL_PORT
mysql_db_name = MYSQL_DB_NAME

db_url = f"mysql+pymysql://{mysql_user}:{quote(mysql_password)}@{mysql_host}:{mysql_port}/{MYSQL_DB_NAME}?charset=utf8"

engine = create_engine(db_url, pool_recycle=500, pool_size=5, max_overflow=5, echo=True)
SessionLocal = sessionmaker(bind=engine)  # DB 세션 팩토리
Base = declarative_base()

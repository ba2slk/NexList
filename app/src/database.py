# Connect to MySQL DB

from urllib.parse import quote

from constants import MYSQL_DB_NAME, MYSQL_HOST, MYSQL_PASSWORD, MYSQL_PORT, MYSQL_USER
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

mysql_user = MYSQL_USER
mysql_password = MYSQL_PASSWORD
mysql_host = MYSQL_HOST
mysql_port = MYSQL_PORT
mysql_db_name = MYSQL_DB_NAME

db_url = f"mysql+pymysql://{mysql_user}:{quote(mysql_password)}@{mysql_host}:{mysql_port}/{MYSQL_DB_NAME}?charset=utf8"

# DB Engine
engine = create_engine(db_url, pool_recycle=500, pool_size=5, max_overflow=5, echo=True)

# DB 세션 팩토리
SessionLocal = sessionmaker(bind=engine)

# models.py의 각 Table 클래스가 상속하는 Base Class: Table로 인식
Base = declarative_base()

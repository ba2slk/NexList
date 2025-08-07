from db.constants import DB_URL
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


# DB Engine
engine = create_engine(DB_URL, pool_recycle=500, pool_size=5, max_overflow=5, echo=True)

# DB 세션 팩토리
SessionLocal = sessionmaker(bind=engine)

# models.py의 각 Table 클래스가 상속하는 Base Class: Table로 인식
Base = declarative_base()


def create_tables():
    """Base에 연결된 모든 Table 생성"""

    from todos.models import Todo
    from auth.models import User

    Base.metadata.create_all(bind=engine)

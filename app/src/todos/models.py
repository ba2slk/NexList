# 데이터 구조만 정의

from .database import Base
from sqlalchemy import Column, Integer, String, Boolean, Date


# Base: DB 테이블 정의 선언
class Todo(Base):
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    isDone = Column(Boolean, default=False)
    task = Column(String(255))
    due_date = Column(Date)

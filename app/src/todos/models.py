# 데이터 구조만 정의

from db.database import Base
from sqlalchemy import Boolean, Column, Date, Integer, String, ForeignKey


# Base: DB 테이블 정의 선언
class Todo(Base):
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    is_done = Column(Boolean, default=False)
    task = Column(String(255))
    due_date = Column(Date)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'))

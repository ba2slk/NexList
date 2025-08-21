from db.database import Base
from sqlalchemy import Column, Date, Integer, String, ForeignKey


class Memo(Base):
    __tablename__ = "memos"
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)
    content = Column(String(8192))
    saved_at = Column(Date)
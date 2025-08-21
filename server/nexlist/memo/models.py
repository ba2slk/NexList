from sqlalchemy import Column, Date, ForeignKey, Integer, String

from nexlist.db.database import Base


class Memo(Base):
    __tablename__ = "memos"
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)
    content = Column(String(8192))
    saved_at = Column(Date)

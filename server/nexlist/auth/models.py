from sqlalchemy import Boolean, Column, Date, Integer, String

from nexlist.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)  # 내부 ID
    email = Column(String(255), unique=True)
    verified_email = Column(Boolean)
    name = Column(String(255))
    given_name = Column(String(255))
    google_sub = Column(String(255), unique=True)  # Google 사용자 고유 ID
    created_at = Column(Date)
    picture = Column(String(4096))

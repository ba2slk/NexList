from database import Base

from sqlalchemy import Column, Date, Integer, String
from sqlalchemy.orm import relationship


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True)
    name = Column(String(255))
    google_sub = Column(String(255), unique=True)
    created_at = Column(Date)

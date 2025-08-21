from .database import SessionLocal


def get_db():
    db = SessionLocal()  # Session Factory
    try:
        yield db
    finally:
        db.close()

from fastapi import Depends
from sqlalchemy.orm import Session

from nexlist.db.dependencies import get_db

from .repository import MemoRepository
from .service import MemoService


def get_memo_service(db: Session = Depends(get_db)) -> MemoService:
    repo = MemoRepository(db)
    return MemoService(repository = repo)

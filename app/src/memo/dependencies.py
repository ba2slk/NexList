from memo.repository import MemoRepository
from memo.service import MemoService
from fastapi import Depends
from db.dependencies import get_db
from sqlalchemy.orm import Session

def get_memo_service(db: Session = Depends(get_db)) -> MemoService:
    repo = MemoRepository(db)
    return MemoService(repository = repo)

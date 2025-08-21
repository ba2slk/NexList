from abc import abstractmethod
from datetime import datetime

from sqlalchemy.orm import Session

from nexlist.auth.models import User
from nexlist.memo.models import Memo
from nexlist.memo.schemas import MemoContent, MemoUpdatedResponse


class MemoRepositoryInterface:
    @abstractmethod
    def create_memo(self, content: MemoContent, user: User) -> Memo:
        pass

    @abstractmethod
    def get_memo_by_id(self, memo_id: int, user: User) -> MemoContent | None:
        pass

    @abstractmethod
    def update_memo_by_id(self, memo_id: int, user: User) -> MemoUpdatedResponse:
        pass


class MemoRepository(MemoRepositoryInterface):
    def __init__(self, db: Session):
        self.db = db

    # CREATE: Memo -> 처음 한 번 생성 후 삭제 X
    def create_memo(self, content: MemoContent, user: User) -> Memo:
        existing_memo = self.get_memo(user)
        if existing_memo:
            return None
        new_memo = Memo(**content.model_dump())
        new_memo.user_id = user.id
        new_memo.saved_at = None  # 처음 메모를 생성할 경우에만
        self.db.add(new_memo)
        self.db.commit()
        self.db.refresh(new_memo)
        return new_memo

    # READ: single memo
    def get_memo(self, user: User) -> Memo:
        return self.db.query(Memo).filter_by(user_id=user.id).first()

    # UPDATE: memo content
    def update_memo(self, change: MemoContent, user: User) -> MemoUpdatedResponse:
        memo = self.get_memo(user)
        if not memo:
            return None
        memo.content = change.content
        current_date = datetime.now().date()
        memo.saved_at = current_date
        self.db.commit()
        return MemoUpdatedResponse(saved_at=current_date)

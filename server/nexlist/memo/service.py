from fastapi import HTTPException

from nexlist.auth.models import User

from .models import Memo
from .repository import MemoRepositoryInterface
from .schemas import MemoContent, MemoUpdatedResponse


class MemoService:
    def __init__(self, repository: MemoRepositoryInterface):
        self.repository = repository

    def create_memo(self, content: MemoContent, user: User) -> Memo:
        memo = self.repository.create_memo(content, user)
        if memo is None:
            raise HTTPException(status_code=500, detail="Memo already exists")
        return memo

    def get_memo(self, user: User) -> Memo:
        memo = self.repository.get_memo(user)
        if memo is None:
            raise HTTPException(status_code=404, detail="Memo Not Found")
        return memo


    def update_memo(self, content: MemoContent, user: User) -> MemoUpdatedResponse:
        memo = self.repository.update_memo(content, user)
        if memo is None:
            raise HTTPException(status_code=404, detail="Memo Not Found")
        return memo

from memo.repository import MemoRepositoryInterface
from memo.schemas import MemoContent, MemoUpdatedResponse
from memo.models import Memo
from auth.models import User
from fastapi import HTTPException


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

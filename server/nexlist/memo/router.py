
from fastapi import APIRouter, Depends, status

from nexlist.auth.dependencies import get_current_user
from nexlist.auth.models import User
from nexlist.memo.dependencies import get_memo_service
from nexlist.memo.schemas import MemoContent, MemoResponse, MemoUpdatedResponse
from nexlist.memo.service import MemoService

router = APIRouter(prefix="/memo", tags=["Memo"])


@router.post(
    "/",
    response_model=MemoResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_memo(
    content: MemoContent,
    user: User = Depends(get_current_user),
    service: MemoService = Depends(get_memo_service)
) -> MemoResponse:
    return service.create_memo(content, user)


@router.get(
    "/",
    status_code=status.HTTP_200_OK
)
def get_memo(
    user: User = Depends(get_current_user),
    service: MemoService = Depends(get_memo_service)
):
    return service.get_memo(user)


@router.put(
    "/",
    status_code=status.HTTP_200_OK
)
def update_memo(
    memo: MemoContent,
    user:User = Depends(get_current_user),
    service: MemoService = Depends(get_memo_service)
) -> MemoUpdatedResponse:
    return service.update_memo(memo, user)

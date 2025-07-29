from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from .constants import TODO_NOT_FOUND_DETAIL
from .repository import DAO
from .schemas import TodoItem, TodoUpdate

# from .service import find_
# from service import get_all_posts, create_post

router = APIRouter(prefix="/todo", tags=["Todos"])

# DAO & todo_list initialization
dao = DAO()
todo_list: list[dict] = dao.load_todo_list()


# 할 일 추가하기
@router.post("/todo", status_code=status.HTTP_201_CREATED)
def create_todo(item: TodoItem):
    global idx
    item_dict = item.model_dump()
    idx += 1
    item_dict["id"] = idx
    item_dict["completed"] = False
    if not item_dict.get("due_date"):
        item_dict["due_date"] = datetime.now().isoformat()
    print(item_dict)
    todo_list.append(item_dict)
    dao.save_todo_list(todo_list)

    return {"message": f"Successfully added <{item_dict['task']}> to the list."}


# 할 일 목록 불러오기
@router.get("/todo")
def read_todo_list():
    return todo_list


# 하나의 todo만 불러오기
@router.get("/todo/{id}")
def read_todo(id: int):
    for todo in todo_list:
        if todo["id"] == id:
            return todo
    raise HTTPException(404, "No Such Element Exception")


# 리스트 초기화
@router.delete("/todo", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo_list():
    todo_list.clear()
    dao.save_todo_list(todo_list)
    global idx
    idx = 0


# 단일 아이템 삭제
@router.delete("/todo/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_single_todo(item_id: int):
    global idx
    target = find_todo_by_id(item_id)
    if target is None:
        raise HTTPException(status_code=404, detail=TODO_NOT_FOUND_DETAIL)
    todo_list.remove(target)
    dao.save_todo_list(todo_list)


# todo 내용 변경하기
@router.put("/todo/{id}")
def edit_item(id: int, item: TodoItem):
    target = find_todo_by_id(id)
    if target is None:
        raise HTTPException(status_code=404, detail=TODO_NOT_FOUND_DETAIL)

    target["task"] = item.task
    target["due_date"] = item.due_date
    dao.save_todo_list(todo_list)

    return {"message": f"Todo {id} updated successfully"}


# todo 완료 상태 변경하기
@router.put("/todo/{id}/toggle")
def toggle_todo_completed(id: int, update: TodoUpdate):
    target = find_todo_by_id(id)
    if target is None:
        raise HTTPException(status_code=404, detail=TODO_NOT_FOUND_DETAIL)

    target["completed"] = update.completed
    return {
        "message": f"Todo {id} completed status updated successfully",
        "completed": target["completed"],
    }

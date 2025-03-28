from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import json
from dotenv import load_dotenv
import os

load_dotenv()

JSON_PATH = "./todo.json"

class TodoItem(BaseModel):
    task: str
    description: str


class TodoUpdate(BaseModel):
    completed: bool


app = FastAPI(debug=True)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"], 
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_DIR = os.path.join(BASE_DIR, "templates")

templates = Jinja2Templates(directory=TEMPLATE_DIR)
@app.get("/", response_class=HTMLResponse)
def read_root(request: Request):
    api_url = os.getenv("API_URL", "http://127.0.0.1:8000/todo")
    return templates.TemplateResponse("index.html", {"request": request, "api_url": api_url})


def find_todo_by_id(id: int) -> dict:
    for todo in todo_list:
        if todo["id"] == id:
            return todo
    return None


class DAO():
    def load_todo_list(self) -> list[dict]:
        try:
            with open(JSON_PATH, "r", encoding="utf-8") as file:
                return json.load(file)
        except (FileNotFoundError, json.JSONDecodeError):
            return []
        
    def save_todo_list(self, todo_list: list[dict]):
        with open(JSON_PATH, "w", encoding="utf-8") as file:
            json.dump(todo_list, file, indent=4, ensure_ascii=False)


dao = DAO()
todo_list: list[dict] = dao.load_todo_list()


idx = 0
for todo in todo_list:
    cur = int(todo["id"])
    if cur > idx:
        idx = cur


@app.post("/todo", status_code=status.HTTP_201_CREATED)
def create_todo(item: TodoItem):
    global idx
    item_dict = item.model_dump()
    idx += 1
    item_dict["id"] = idx
    item_dict["completed"] = False
    todo_list.append(item_dict)
    dao.save_todo_list(todo_list)

    return {"message": f"Successfully added <{item_dict['task']}> to the list."}


# 할 일 목록 불러오기
@app.get("/todo")
def read_todo_list():
    return todo_list


# 하나의 todo만 불러오기
@app.get("/todo/{id}")
def read_todo(id: int):
    for todo in todo_list:
         if todo["id"] == id:
              return todo
    raise HTTPException(404, "No Such Element Exception")    


# 리스트 초기화
@app.delete("/todo", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo_list():
    todo_list.clear()
    dao.save_todo_list(todo_list)
    global idx
    idx = 0
    return


# 단일 아이템 삭제
@app.delete("/todo/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_single_todo(item_id: int):
    global idx
    target = find_todo_by_id(item_id)
    if target is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    todo_list.remove(target)
    dao.save_todo_list(todo_list)
    return


# todo 내용 변경하기
@app.put("/todo/{id}")
def edit_item(id: int, item: TodoItem):
    target = find_todo_by_id(id)
    if target is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    target["task"] = item.task
    target["description"] = item.description
    dao.save_todo_list(todo_list)

    return {"message": f"Todo {id} updated successfully"}


# todo 완료 상태 변경하기
@app.put("/todo/{id}/toggle")
def toggle_todo_completed(id: int, update: TodoUpdate):
    target = find_todo_by_id(id)
    if target is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    target["completed"] = update.completed
    return {"message": f"Todo {id} completed status updated successfully", "completed": target["completed"]}

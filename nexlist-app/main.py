from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import json
from dotenv import load_dotenv
import os
from prometheus_fastapi_instrumentator import Instrumentator
from influxdb import InfluxDBClient

import logging
import time
from multiprocessing import Queue
from os import getenv
from fastapi import Request
from logging_loki import LokiQueueHandler


# Constants
JSON_PATH = "./todo.json"
TODO_NOT_FOUND_DETAIL = "Todo not found"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_DIR = os.path.join(BASE_DIR, "templates")


# 환경변수 불러오기
load_dotenv()


# Base Models
class TodoItem(BaseModel):
    task: str
    due_date: Optional[str] = None

    class Config:
        extra = "ignore"

class TodoUpdate(BaseModel):
    completed: bool


# Data Access Object: LOAD(SAVE) todo items from(to) the list
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


# DAO & todo_list initialization
dao = DAO()
todo_list: list[dict] = dao.load_todo_list()


# Set Index
idx = 0
for todo in todo_list:
    cur = int(todo["id"])
    if cur > idx:
        idx = cur


# FastAPI Configuration
app = FastAPI(debug=True)
app.mount("/static", StaticFiles(directory="static"), name="static")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"], 
)

# InfluxDB 클라이언트 설정 (도커 컴포즈에서 influxdb 라는 서비스 이름 쓴 경우)
# influx_client = InfluxDBClient(host="influxdb", port=8086)
# influx_client.switch_database("testdb")
# def log_influx_event(user: str, action: str, todo_id: int = None):
#     json_body = [
#         {
#             "measurement": "todo_events",
#             "tags": {
#                 "user": user,
#                 "action": action
#             },
#             "time": datetime.utcnow().isoformat(),
#             "fields": {
#                 "value": 1,
#                 "todo_id": todo_id or 0
#             }
#         }
#     ]
#     influx_client.write_points(json_body)


# Prometheus Metrics Endpoint (/metrics)
Instrumentator().instrument(app).expose(app, endpoint="/metrics")

loki_logs_handler = LokiQueueHandler(
    Queue(-1),
    url=getenv("LOKI_ENDPOINT"),
    tags={"application": "nexlist"},
    version="1",
)

print("DEBUG: LOKI_ENDPOINT =", os.getenv("LOKI_ENDPOINT"))
# print("DEBUG: loki_logs_handler.url =", loki_logs_handler.url)



# Custom access logger (ignore Uvicorn's default logging)
custom_logger = logging.getLogger("custom.access")
custom_logger.setLevel(logging.INFO)

# Add Loki handler (assuming `loki_logs_handler` is correctly configured)
custom_logger.addHandler(loki_logs_handler)

async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time  # Compute response time

    log_message = (
        f'{request.client.host} - "{request.method} {request.url.path} HTTP/1.1" {response.status_code} {duration:.3f}s'
    )

    # **Only log if duration exists**
    if duration:
        custom_logger.info(log_message)

    return response

app.middleware("http")(log_requests)



# Template
templates = Jinja2Templates(directory=TEMPLATE_DIR)



# Helper Function: id로 todo item 찾기
def find_todo_by_id(id: int) -> Optional[dict]:
    for todo in todo_list:
        if todo["id"] == id:
            return todo
        

# root 진입 시 js 코드에 API_URL 주입
@app.get("/", response_class=HTMLResponse)
def read_root(request: Request):
    api_url = os.getenv("API_URL", "http://127.0.0.1:8000/todo")
    print(f"INFO: API_URL={api_url}")
    return templates.TemplateResponse("index.html", {"request": request, "api_url": api_url})


# 할 일 추가하기
@app.post("/todo", status_code=status.HTTP_201_CREATED)
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

    # influx log 
    # log_influx_event(user="default_user", action="create", todo_id=idx)

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


# 단일 아이템 삭제
@app.delete("/todo/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_single_todo(item_id: int):
    global idx
    target = find_todo_by_id(item_id)
    if target is None:
        raise HTTPException(status_code=404, detail=TODO_NOT_FOUND_DETAIL)
    todo_list.remove(target)
    dao.save_todo_list(todo_list)


# todo 내용 변경하기
@app.put("/todo/{id}")
def edit_item(id: int, item: TodoItem):
    target = find_todo_by_id(id)
    if target is None:
        raise HTTPException(status_code=404, detail=TODO_NOT_FOUND_DETAIL)
    
    target["task"] = item.task
    target["due_date"] = item.due_date
    dao.save_todo_list(todo_list)

    return {"message": f"Todo {id} updated successfully"}


# todo 완료 상태 변경하기
@app.put("/todo/{id}/toggle")
def toggle_todo_completed(id: int, update: TodoUpdate):
    target = find_todo_by_id(id)
    if target is None:
        raise HTTPException(status_code=404, detail=TODO_NOT_FOUND_DETAIL)
    
    target["completed"] = update.completed
    return {"message": f"Todo {id} completed status updated successfully", "completed": target["completed"]}

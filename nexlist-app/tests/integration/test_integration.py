import requests
import pytest

from dotenv import load_dotenv
import os

#load_dotenv("/home/ubuntu/env_var")

# 실제 배포된 FastAPI 서버의 URL
BASE_URL = "http://52.78.55.91:5000"


@pytest.fixture(autouse=True)
def reset_todo_list():
    # 각 테스트 시작 전과 종료 후에 /todo 엔드포인트를 통해 할 일 목록을 초기화
    requests.delete(f"{BASE_URL}/todo")
    yield
    requests.delete(f"{BASE_URL}/todo")

def test_create_todo():
    response = requests.post(f"{BASE_URL}/todo", json={"task": "Test Task", "due_date": "2025-12-31"})
    assert response.status_code == 201
    data = response.json()
    assert "Successfully added" in data["message"]

def test_read_todo_list():
    # 두 개의 할 일을 생성
    requests.post(f"{BASE_URL}/todo", json={"task": "Task 1", "due_date": "2025-12-31"})
    requests.post(f"{BASE_URL}/todo", json={"task": "Task 2", "due_date": "2025-12-31"})
    response = requests.get(f"{BASE_URL}/todo")
    assert response.status_code == 200
    todos = response.json()
    assert isinstance(todos, list)
    assert len(todos) == 2

def test_read_single_todo():
    requests.post(f"{BASE_URL}/todo", json={"task": "Single Task", "due_date": "2025-12-31"})
    response = requests.get(f"{BASE_URL}/todo/1")
    assert response.status_code == 200
    todo = response.json()
    assert todo["task"] == "Single Task"

def test_edit_todo():
    requests.post(f"{BASE_URL}/todo", json={"task": "Old Task", "due_date": "2025-12-31"})
    response = requests.put(f"{BASE_URL}/todo/1", json={"task": "New Task", "due_date": "2026-01-01"})
    assert response.status_code == 200
    data = response.json()
    assert "updated successfully" in data["message"]
    # 수정된 내용 확인
    updated = requests.get(f"{BASE_URL}/todo/1").json()
    assert updated["task"] == "New Task"
    assert updated["due_date"] == "2026-01-01"

def test_toggle_todo_completed():
    requests.post(f"{BASE_URL}/todo", json={"task": "Toggle Task", "due_date": "2025-12-31"})
    response = requests.put(f"{BASE_URL}/todo/1/toggle", json={"completed": True})
    assert response.status_code == 200
    data = response.json()
    assert data["completed"] is True

def test_delete_single_todo():
    requests.post(f"{BASE_URL}/todo", json={"task": "Task to Delete", "due_date": "2025-12-31"})
    response = requests.delete(f"{BASE_URL}/todo/1")
    assert response.status_code == 204
    # 삭제 후 목록 확인
    response = requests.get(f"{BASE_URL}/todo")
    assert response.status_code == 200
    todos = response.json()
    assert len(todos) == 0

def test_delete_all_todos():
    requests.post(f"{BASE_URL}/todo", json={"task": "Task 1", "due_date": "2025-12-31"})
    requests.post(f"{BASE_URL}/todo", json={"task": "Task 2", "due_date": "2025-12-31"})
    response = requests.delete(f"{BASE_URL}/todo")
    assert response.status_code == 204
    # 전체 삭제 후 확인
    response = requests.get(f"{BASE_URL}/todo")
    assert response.status_code == 200
    todos = response.json()
    assert len(todos) == 0

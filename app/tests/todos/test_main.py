import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

import pytest
from fastapi.testclient import TestClient
import app.src.todos.router as main

client = TestClient(main.app)


@pytest.fixture(autouse=True)
def setup_test_env(monkeypatch):
    # 파일 입출력 대신 dummy 함수를 사용해서 실제 파일 시스템에 영향을 주지 않음
    monkeypatch.setattr(main.dao, "save_todo_list", lambda todo_list: None)
    monkeypatch.setattr(main.dao, "load_todo_list", lambda: [])
    # 전역 todo_list와 idx를 초기화
    main.todo_list.clear()
    monkeypatch.setattr(main, "idx", 0)
    yield
    # 테스트 종료 후에도 초기화
    main.todo_list.clear()
    monkeypatch.setattr(main, "idx", 0)


def test_create_todo():
    response = client.post(
        "/todo", json={"task": "Test Task", "due_date": "2025-12-31"}
    )
    assert response.status_code == 201
    data = response.json()
    assert "Successfully added" in data["message"]


def test_read_todo_list():
    # 두 개의 할 일을 생성
    client.post("/todo", json={"task": "Task 1", "due_date": "2025-12-31"})
    client.post("/todo", json={"task": "Task 2", "due_date": "2025-12-31"})
    response = client.get("/todo")
    assert response.status_code == 200
    todos = response.json()
    assert isinstance(todos, list)
    assert len(todos) == 2


def test_read_single_todo():
    client.post("/todo", json={"task": "Single Task", "due_date": "2025-12-31"})
    response = client.get("/todo/1")
    assert response.status_code == 200
    todo = response.json()
    assert todo["task"] == "Single Task"


def test_edit_todo():
    client.post("/todo", json={"task": "Old Task", "due_date": "2025-12-31"})
    response = client.put(
        "/todo/1", json={"task": "New Task", "due_date": "2026-01-01"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "updated successfully" in data["message"]
    # 수정 내용 확인
    response_get = client.get("/todo/1")
    todo = response_get.json()
    assert todo["task"] == "New Task"
    assert todo["due_date"] == "2026-01-01"


def test_toggle_todo_completed():
    client.post("/todo", json={"task": "Toggle Task", "due_date": "2025-12-31"})
    response = client.put("/todo/1/toggle", json={"completed": True})
    assert response.status_code == 200
    data = response.json()
    assert data["completed"] is True


def test_delete_single_todo():
    client.post("/todo", json={"task": "Task to Delete", "due_date": "2025-12-31"})
    response = client.delete("/todo/1")
    assert response.status_code == 204
    # 할 일 목록이 비어있는지 확인
    response = client.get("/todo")
    assert response.status_code == 200
    todos = response.json()
    assert len(todos) == 0


def test_delete_all_todos():
    client.post("/todo", json={"task": "Task 1", "due_date": "2025-12-31"})
    client.post("/todo", json={"task": "Task 2", "due_date": "2025-12-31"})
    response = client.delete("/todo")
    assert response.status_code == 204
    # 모든 할 일 삭제 확인
    response = client.get("/todo")
    assert response.status_code == 200
    todos = response.json()
    assert len(todos) == 0

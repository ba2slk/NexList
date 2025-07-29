# DB 접근 로직 담당
# : CRUD 동작을 라우터 또는 서비스 계층에 노출하기 위한 중간 계층 역할

from .constants import JSON_PATH
import json


# Data Access Object: LOAD(SAVE) todo items from(to) the list
class DAO:
    def load_todo_list(self) -> list[dict]:
        try:
            with open(JSON_PATH, "r", encoding="utf-8") as file:
                return json.load(file)
        except (FileNotFoundError, json.JSONDecodeError):
            return []

    def save_todo_list(self, todo_list: list[dict]):
        with open(JSON_PATH, "w", encoding="utf-8") as file:
            json.dump(todo_list, file, indent=4, ensure_ascii=False)

from sqlalchemy.orm import Session
from todos.repository import TodoRepositoryInterface
from todos.models import Todo
from todos.schemas import *
from todos.constants import TODO_NOT_FOUND_DETAIL
from auth.models import User
from fastapi import HTTPException



class TodoService:
    def __init__(self, repository: TodoRepositoryInterface):
        self.repository = repository


    def create_todo(self, todo: TodoItem, user: User) -> Todo:
        return self.repository.create_todo(todo, user.id)
    

    def get_all_todos(self, user: User, today: bool | None) -> list[Todo]:
        return self.repository.get_all_todos(user.id, today)
    

    def get_todo_by_id(self, id: int, user: User) -> Todo:
        todo = self.repository.get_todo_by_id(id, user.id)
        if todo is None:
            raise HTTPException(status_code=404, detail=TODO_NOT_FOUND_DETAIL)
        return todo
    

    def remove_all_todos(self, user: User):
        self.repository.remove_all_todos(user.id)
    

    def remove_todo_by_id(self, id: int, user: User):
        deleted_todo = self.repository.remove_todo_by_id(id, user.id)
        if deleted_todo is None:
            raise HTTPException(status_code=404, detail=TODO_NOT_FOUND_DETAIL)


    def update_todo_by_id(self, todo: TodoItem, id: int, user: User) -> Todo:
        updated_todo = self.repository.update_todo_by_id(id, todo, user.id)
        if updated_todo is None:
            raise HTTPException(status_code=404, detail=TODO_NOT_FOUND_DETAIL)
        return updated_todo


    def update_todo_completed_state_by_id(self, id: int, update: TodoCompletedState, user: User) -> Todo:
        updated_todo = self.repository.update_completed_state_by_id(id, update, user.id)
        if updated_todo is None:
            raise HTTPException(status_code=404, detail=TODO_NOT_FOUND_DETAIL)
        return updated_todo
    
    
    def update_todo_today_state_by_id(self, id: int, update: TodoTodayState, user: User) -> Todo:
        updated_todo = self.repository.update_today_state_by_id(id, update, user.id)
        if updated_todo is None:
            raise HTTPException(status_code=404, detail=TODO_NOT_FOUND_DETAIL)
        return updated_todo
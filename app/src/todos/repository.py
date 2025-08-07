# DB 접근 로직 담당
# : CRUD 동작을 라우터 또는 서비스 계층에 노출하기 위한 중간 계층 역할

from abc import abstractmethod

from sqlalchemy.orm import Session
from todos.models import Todo
from todos.schemas import TodoCompletedState, TodoItem


# Todo Interface
class TodoRepositoryInterface:
    @abstractmethod
    def get_todo_by_id(self, todo_id: int, user_id: int) -> Todo | None:
        pass

    @abstractmethod
    def get_all_todos(self, user_id: int) -> list[Todo]:
        pass

    @abstractmethod
    def create_todo(self, todo: TodoItem, user_id: int) -> Todo:
        pass

    @abstractmethod
    def remove_all_todos(self, user_id: int) -> int:
        pass

    @abstractmethod
    def remove_todo_by_id(todo_id: int, user_id: int):
        pass

    @abstractmethod
    def update_todo_by_id(
        todo_id: int, change: TodoItem, user_id: int
    ) -> Todo:
        pass

    @abstractmethod
    def update_completed_state_by_id(
        todo_id: int, state: TodoCompletedState, user_id: int
    ) -> Todo:
        pass


# TodoRepository 구현체
class TodoRepository(TodoRepositoryInterface):
    def __init__(self, db: Session):
        self.db = db


    # READ: single todo
    def get_todo_by_id(self, todo_id: int, user_id: int) -> Todo | None:
        return (
            self.db.query(Todo).filter(Todo.id == todo_id, Todo.user_id == user_id).first()
        )

    # READ: all todos
    def get_all_todos(self, user_id: int) -> list[Todo] | None:
        return self.db.query(Todo).filter(Todo.user_id == user_id).all()

    # CREATE: single todo
    def create_todo(self, todo: TodoItem, user_id: int) -> Todo:
        new_todo = Todo(**todo.model_dump())
        new_todo.user_id = user_id
        self.db.add(new_todo)
        self.db.commit()
        self.db.refresh(new_todo)
        return new_todo

    # DELETE: all todos
    def remove_all_todos(self, user_id: int):
        self.db.query(Todo).filter(Todo.user_id == user_id).delete()
        self.db.commit()

    # DELETE: single todo
    def remove_todo_by_id(
        self, todo_id: int, user_id: int
    ) -> int | None:
        todo = self.get_todo_by_id(todo_id, user_id)
        if not todo:
            return None
        deleted = (
            self.db.query(Todo).filter(Todo.id == todo_id, Todo.user_id == user_id).delete()
        )
        self.db.commit()
        return deleted

    # UPDATE: todo
    def update_todo_by_id(
        self, todo_id: int, change: TodoItem, user_id: int
    ) -> Todo:
        todo = self.get_todo_by_id(todo_id, user_id)
        if not todo:
            return None
        todo.task = change.task
        todo.due_date = change.due_date
        self.db.commit()
        self.db.refresh(todo)
        return todo

    def update_completed_state_by_id(
        self, todo_id: int, state: TodoCompletedState, user_id: int
    ) -> Todo:
        todo = self.get_todo_by_id(todo_id, user_id)
        if not todo:
            return None
        todo.is_done = state.is_done
        self.db.commit()
        self.db.refresh(todo)
        return todo
    
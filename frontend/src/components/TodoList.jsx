import React from 'react';
import { List, ListItem, ListItemText, IconButton, Checkbox } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { deleteTodo, toggleTodo } from '../api';

function TodoList({ todos, onTodoDeleted, onTodoToggled }) {
  const handleDelete = async (id) => {
    await deleteTodo(id);
    onTodoDeleted(id);
  };

  const handleToggle = async (id) => {
    const todo = todos.find((todo) => todo.id === id);
    await toggleTodo(id, !todo.is_done);
    onTodoToggled(id);
  };

  return (
    <List>
      {todos.map((todo, index) => (
        <ListItem
          key={todo.id || index}
          secondaryAction={
            <>
              <IconButton edge="end" aria-label="edit">
                <Edit />
              </IconButton>
              <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(todo.id)}>
                <Delete />
              </IconButton>
            </>
          }
        >
          <Checkbox checked={todo.is_done || false} onChange={() => handleToggle(todo.id)} />
          <ListItemText primary={todo.task} style={{ textDecoration: todo.is_done ? 'line-through' : 'none' }} />
        </ListItem>
      ))}
    </List>
  );
}

export default TodoList;

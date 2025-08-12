import React, { useState } from 'react';
import { List, ListItem, ListItemText, IconButton, Checkbox, TextField, Box } from '@mui/material';
import { Delete, Edit, Save } from '@mui/icons-material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { deleteTodo, toggleTodo, updateTodo } from '../api';
import dayjs from 'dayjs';

function TodoList({ todos, onTodoDeleted, onTodoToggled, onTodoUpdated }) {
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [editedTask, setEditedTask] = useState('');
  const [editedDueDate, setEditedDueDate] = useState(null);

  const handleDelete = async (id) => {
    await deleteTodo(id);
    onTodoDeleted(id);
  };

  const handleToggle = async (id) => {
    const todo = todos.find((todo) => todo.id === id);
    await toggleTodo(id, !todo.is_done);
    onTodoToggled(id);
  };

  const handleEditClick = (todo) => {
    setEditingTodoId(todo.id);
    setEditedTask(todo.task);
    setEditedDueDate(todo.due_date ? dayjs(todo.due_date) : null);
  };

  const handleSaveClick = async (id) => {
    await updateTodo(id, { task: editedTask, due_date: editedDueDate ? dayjs(editedDueDate).format('YYYY-MM-DD') : null });
    onTodoUpdated(id, editedTask, editedDueDate ? dayjs(editedDueDate).format('YYYY-MM-DD') : null);
    setEditingTodoId(null);
    setEditedTask('');
    setEditedDueDate(null);
  };

  const handleKeyDown = (event, id) => {
    if (event.key === 'Enter') {
      handleSaveClick(id);
    }
  };

  return (
    <List>
      {todos.map((todo, index) => (
        <ListItem
          key={todo.id || index}
          secondaryAction={
            <>
              {editingTodoId === todo.id ? (
                <IconButton edge="end" aria-label="save" onClick={() => handleSaveClick(todo.id)}>
                  <Save />
                </IconButton>
              ) : (
                <IconButton edge="end" aria-label="edit" onClick={() => handleEditClick(todo)}>
                  <Edit />
                </IconButton>
              )}
              <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(todo.id)}>
                <Delete />
              </IconButton>
            </>
          }
        >
          <Checkbox checked={todo.is_done || false} onChange={() => handleToggle(todo.id)} />
          <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            {editingTodoId === todo.id ? (
              <TextField
                value={editedTask}
                onChange={(e) => setEditedTask(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, todo.id)}
                fullWidth
                variant="standard"
              />
            ) : (
              <ListItemText primary={todo.task} style={{ textDecoration: todo.is_done ? 'line-through' : 'none' }} />
            )}
            {editingTodoId === todo.id ? (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Due Date"
                  value={editedDueDate}
                  onChange={(newValue) => setEditedDueDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth variant="standard" />}
                />
              </LocalizationProvider>
            ) : (
              todo.due_date && (
                <ListItemText secondary={`Due: ${dayjs(todo.due_date).format('YYYY-MM-DD')}`} />
              )
            )}
          </Box>
        </ListItem>
      ))}
    </List>
  );
}

export default TodoList;

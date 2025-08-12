import React, { useState } from 'react';
import { List, ListItem, ListItemText, IconButton, Checkbox, TextField, Box } from '@mui/material';
import { Delete, Save } from '@mui/icons-material'; // Removed Edit icon
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { deleteTodo, toggleTodo, updateTodo } from '../api';
import dayjs from 'dayjs';

function TodoList({ todos, onTodoDeleted, onTodoToggled, onTodoUpdated, maxHeight }) { // Accept maxHeight prop
  const [editingTaskTodoId, setEditingTaskTodoId] = useState(null); // New state for task editing
  const [editingDueDateTodoId, setEditingDueDateTodoId] = useState(null); // New state for due date editing
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

  // Removed handleEditClick

  const handleSaveClick = async (id, field) => {
    const todoToUpdate = todos.find((todo) => todo.id === id);
    let updatedData = {};

    if (field === 'task') {
      updatedData = { task: editedTask, due_date: todoToUpdate.due_date }; // Keep existing due_date
      setEditingTaskTodoId(null);
      setEditedTask('');
    } else if (field === 'due_date') {
      updatedData = { task: todoToUpdate.task, due_date: editedDueDate ? dayjs(editedDueDate).format('YYYY-MM-DD') : null }; // Keep existing task
      setEditingDueDateTodoId(null);
      setEditedDueDate(null);
    }

    await updateTodo(id, updatedData);
    onTodoUpdated(id, updatedData.task, updatedData.due_date);
  };

  const handleKeyDown = (event, id, field) => {
    if (event.key === 'Enter') {
      handleSaveClick(id, field);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 520, // Scaled up by 1.3 times
        minWidth: 520, // Added to maintain width when empty
        mx: 'auto', // Center the box
        p: 2, // Add some padding to the outer Box
        borderRadius: 2, // Slightly rounded corners
        boxShadow: 3, // Subtle shadow for depth
        mb: 2,
        bgcolor: 'background.paper', // Use theme background color
      }}
    >
      <List
        sx={{
          maxHeight: maxHeight,
          overflowY: 'auto',
          // Custom Scrollbar Styles
          '&::-webkit-scrollbar': {
            width: '4px', // Adjust width for WebKit
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(0,0,0,0.1)', // Subtle track
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0,0,0,0.3)', // Subtle thumb
            borderRadius: '10px',
            '&:hover': {
              background: 'rgba(0,0,0,0.5)', // Darker on hover
            },
          },
          // Firefox scrollbar styles
          scrollbarWidth: 'thin', // "auto" or "thin"
          scrollbarColor: 'rgba(0,0,0,0.3) rgba(0,0,0,0.1)', // thumb track
        }}
      >
        {todos.map((todo, index) => (
          <ListItem
            key={todo.id || index}
            secondaryAction={
              <>
                {/* Save button only appears if either task or due date is being edited */}
                {(editingTaskTodoId === todo.id || editingDueDateTodoId === todo.id) && (
                  <IconButton edge="end" aria-label="save" onClick={() => handleSaveClick(todo.id, editingTaskTodoId === todo.id ? 'task' : 'due_date')}>
                    <Save />
                  </IconButton>
                )}
                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(todo.id)}>
                  <Delete />
                </IconButton>
              </>
            }
          >
            <Checkbox checked={todo.is_done || false} onChange={() => handleToggle(todo.id)} />
            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, mr: 4 }}>
              {editingTaskTodoId === todo.id ? (
                <TextField
                  value={editedTask}
                  onChange={(e) => setEditedTask(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, todo.id, 'task')}
                  onBlur={() => handleSaveClick(todo.id, 'task')} // Save on blur
                  fullWidth
                  variant="standard"
                  autoFocus // Focus on the input when it appears
                />
              ) : (
                <ListItemText
                  primary={todo.task}
                  style={{ textDecoration: todo.is_done ? 'line-through' : 'none' }}
                  sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
                  onClick={() => { // Enable editing on click
                    setEditingTaskTodoId(todo.id);
                    setEditedTask(todo.task);
                  }}
                />
              )}
              {/* Conditional rendering for Due Date */}
              {editingDueDateTodoId === todo.id ? ( // If due date is being edited
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Due Date"
                    value={editedDueDate}
                    onChange={(newValue) => {
                      setEditedDueDate(newValue);
                      if (newValue && newValue.isValid()) {
                        handleSaveClick(todo.id, 'due_date');
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        variant="standard"
                        onBlur={() => handleSaveClick(todo.id, 'due_date')}
                        autoFocus
                      />
                    )}
                  />
                </LocalizationProvider>
              ) : ( // If due date is not being edited
                <ListItemText
                  secondary={todo.due_date && dayjs(todo.due_date).isValid() ? `Due: ${dayjs(todo.due_date).format('YYYY-MM-DD')}` : "Add Due Date"}
                  onClick={() => {
                    setEditingDueDateTodoId(todo.id);
                    setEditedDueDate(todo.due_date && dayjs(todo.due_date).isValid() ? dayjs(todo.due_date) : null);
                  }}
                  sx={{ cursor: 'pointer' }} // Indicate clickable
                />
              )}
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default TodoList;

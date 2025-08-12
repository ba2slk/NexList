import React, { useState, useRef } from 'react';
import { List, ListItem, ListItemText, IconButton, Checkbox, TextField, Box, Typography } from '@mui/material';
import { Delete, Save } from '@mui/icons-material'; // Removed Edit icon
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
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
  const [openDatePickerId, setOpenDatePickerId] = useState(null); // State to control which date picker is open
  const datePickerAnchorRefs = useRef({}); // Ref to store refs for each date picker icon

  const handleDelete = async (id) => {
    await deleteTodo(id);
    onTodoDeleted(id);
  };

  const handleToggle = async (id) => {
    const todo = todos.find((todo) => todo.id === id);
    await toggleTodo(id, !todo.is_done);
    onTodoToggled(id);
  };

  const handleSaveClick = async (id, field, newDueDateValue = undefined) => {
    const todoToUpdate = todos.find((todo) => todo.id === id);
    let updatedData = {};

    if (field === 'task') {
      updatedData = { task: editedTask, due_date: todoToUpdate.due_date }; // Keep existing due_date
      setEditingTaskTodoId(null);
      setEditedTask('');
    } else if (field === 'due_date') {
      // Use newDueDateValue if provided, otherwise fall back to editedDueDate
      const finalDueDate = newDueDateValue !== undefined ? newDueDateValue : editedDueDate;
      updatedData = { task: todoToUpdate.task, due_date: finalDueDate ? dayjs(finalDueDate).format('YYYY-MM-DD') : null }; // Keep existing task
      setEditingDueDateTodoId(null);
      setEditedDueDate(null);
      setOpenDatePickerId(null); // Close date picker after saving
    }

    await updateTodo(id, updatedData);
    onTodoUpdated(id, updatedData.task, updatedData.date_due); // Ensure correct prop name for date_due
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
                {/* Save button for task editing */}
                {editingTaskTodoId === todo.id && (
                  <IconButton edge="end" aria-label="save-task" onClick={() => handleSaveClick(todo.id, 'task')}>
                    <Save />
                  </IconButton>
                )}
                {/* Save button for due date editing */}
                {editingDueDateTodoId === todo.id && (
                  <IconButton edge="end" aria-label="save-due-date" onClick={() => handleSaveClick(todo.id, 'due_date')}>
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
                  onClick={() => {
                    setEditingTaskTodoId(todo.id);
                    setEditedTask(todo.task);
                  }}
                />
              )}
              {/* Due Date Display and Picker */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    open={openDatePickerId === todo.id}
                    onOpen={() => setOpenDatePickerId(todo.id)}
                    onClose={() => setOpenDatePickerId(null)}
                    value={editedDueDate}
                    onChange={(newValue) => {
                      setEditedDueDate(newValue);
                      // Automatically save when a date is selected from the picker
                      if (newValue && newValue.isValid()) {
                        handleSaveClick(todo.id, 'due_date', newValue); // Pass newValue directly
                      } else if (newValue === null) { // Handle clearing the date
                        handleSaveClick(todo.id, 'due_date', null); // Pass null directly for clearing
                      }
                    }}
                    slotProps={{
                      textField: {
                        inputProps: { readOnly: true },
                        sx: { display: 'none' }, // Hide the text field
                      },
                    }}
                    PopperProps={{
                      anchorEl: () => datePickerAnchorRefs.current[todo.id],
                      placement: 'bottom-end',
                      modifiers: [
                        { name: 'offset', options: { offset: [0, 10] } }, // 10px offset
                        { name: 'flip', options: { fallbackPlacements: ['top-end'] } },
                        { name: 'preventOverflow', options: { boundary: 'viewport', padding: 8 } },
                      ],
                      disablePortal: false,
                      container: document.body,
                    }} // Anchor the popover to the icon
                  />
                  <IconButton
                    ref={el => datePickerAnchorRefs.current[todo.id] = el} // Assign ref dynamically
                    onClick={() => {
                      setEditingDueDateTodoId(todo.id); // Set editing mode for due date
                      setEditedDueDate(todo.due_date && dayjs(todo.due_date).isValid() ? dayjs(todo.due_date) : null);
                      setOpenDatePickerId(todo.id); // Open the date picker
                    }}
                    aria-label="Select due date"
                    sx={{ p: '8px' }} // Consistent padding
                  >
                    <CalendarTodayIcon />
                  </IconButton>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap', cursor: 'pointer' }}
                    onClick={() => {
                      setEditingDueDateTodoId(todo.id); // Set editing mode for due date
                      setEditedDueDate(todo.due_date && dayjs(todo.due_date).isValid() ? dayjs(todo.due_date) : null);
                      setOpenDatePickerId(todo.id); // Open the date picker
                    }}
                  >
                    {todo.due_date && dayjs(todo.due_date).isValid() ? `Due: ${dayjs(todo.due_date).format('YYYY-MM-DD')}` : "Add Due Date"}
                  </Typography>
                </LocalizationProvider>
              </Box>
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default TodoList;

import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { createTodo } from '../api';
import dayjs from 'dayjs';

function TodoForm({ onTodoCreated }) {
  const [task, setTask] = useState('');
  const [dueDate, setDueDate] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!task.trim()) return;
    const newTodo = await createTodo({ task, due_date: dueDate ? dayjs(dueDate).format('YYYY-MM-DD') : null });
    onTodoCreated(newTodo);
    setTask('');
    setDueDate(null);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1, mb: 2, flexDirection: 'column' }}>
      <TextField
        fullWidth
        variant="outlined"
        label="Add a new todo"
        value={task}
        onChange={(e) => setTask(e.target.value)}
      />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="Due Date"
          value={dueDate}
          onChange={(newValue) => setDueDate(newValue)}
          renderInput={(params) => <TextField {...params} fullWidth variant="outlined" />}
        />
      </LocalizationProvider>
      <Button type="submit" variant="contained">Add</Button>
    </Box>
  );
}

export default TodoForm;
import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';
import { createTodo } from '../api';

function TodoForm({ onTodoCreated }) {
  const [task, setTask] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!task.trim()) return;
    const newTodo = await createTodo({ task });
    onTodoCreated(newTodo);
    setTask('');
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1, mb: 2 }}>
      <TextField
        fullWidth
        variant="outlined"
        label="Add a new todo"
        value={task}
        onChange={(e) => setTask(e.target.value)}
      />
      <Button type="submit" variant="contained">Add</Button>
    </Box>
  );
}

export default TodoForm;
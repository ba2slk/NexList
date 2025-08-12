import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { TextField, Button, Box, IconButton, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { createTodo } from '../api';
import dayjs from 'dayjs';

const TodoForm = forwardRef(({ onTodoCreated }, ref) => {
  const [task, setTask] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const inputRef = useRef(null); // Ref for the TextField
  const datePickerAnchorRef = useRef(null); // Ref for the DatePicker anchor

  useImperativeHandle(ref, () => ({
    focusTodoInput: () => {
      inputRef.current.focus();
    }
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!task.trim()) return;
    const newTodo = await createTodo({ task, due_date: dueDate && dueDate.isValid() ? dueDate.format('YYYY-MM-DD') : null });
    onTodoCreated(newTodo);
    setTask('');
    setDueDate(null);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        gap: 1,
        mb: 2,
        flexDirection: 'row', // Changed to row
        alignItems: 'center', // Align items vertically in the row
        maxWidth: 520, // Scaled up by 1.3 times
        mx: 'auto',
        p: 2,
        borderRadius: 2,
        boxShadow: 3,
        bgcolor: 'background.paper', // Use theme background color
      }}
    >
      <TextField
        inputRef={inputRef} // Apply the ref here
        fullWidth
        sx={{ flexGrow: 1 }} // Allow it to grow
        variant="outlined"
        label="Add a new todo"
        value={task}
        onChange={(e) => setTask(e.target.value)}
      />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          open={openDatePicker}
          onOpen={() => setOpenDatePicker(true)}
          onClose={() => setOpenDatePicker(false)}
          value={dueDate}
          onChange={(newValue) => {
            setDueDate(newValue);
            // Call submit/update handler with ISO format if valid
            if (newValue && newValue.isValid()) {
              // This part is handled by the form submission, no direct save here
            }
          }}
          slotProps={{
            textField: {
              inputProps: { readOnly: true },
              sx: { display: 'none' }, // Hide the text field
            },
          }}
          PopperProps={{ anchorEl: datePickerAnchorRef.current }} // Anchor the popover to the icon
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton ref={datePickerAnchorRef} onClick={() => setOpenDatePicker(true)} aria-label="Select due date" sx={{ p: '8px' }}>
            <CalendarTodayIcon />
          </IconButton>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            {dueDate && dayjs(dueDate).isValid() ? dayjs(dueDate).format('YYYY-MM-DD') : 'No Due Date'}
          </Typography>
        </Box>
      </LocalizationProvider>
      <Button type="submit" variant="contained">Add</Button>
    </Box>
  );
});

export default TodoForm;

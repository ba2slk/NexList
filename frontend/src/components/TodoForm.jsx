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

  const inputRef = useRef(null);
  const datePickerAnchorRef = useRef(null); // IconButton anchor

  useImperativeHandle(ref, () => ({
    focusTodoInput: () => inputRef.current?.focus()
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!task.trim()) return;
    const newTodo = await createTodo({
      task,
      due_date: dueDate && dueDate.isValid() ? dueDate.format('YYYY-MM-DD') : null
    });
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
        flexDirection: 'row',
        alignItems: 'center',
        maxWidth: 520,
        mx: 'auto',
        p: 2,
        borderRadius: 2,
        boxShadow: 3,
        bgcolor: 'background.paper',
        overflowX: 'hidden', // 안전 차단
      }}
    >
      <TextField
        inputRef={inputRef}
        fullWidth
        sx={{ flexGrow: 1 }}
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
          onChange={(newValue) => setDueDate(newValue)}
          // hide the internal text field (icon-only trigger)
          slotProps={{
            textField: {
              inputProps: { readOnly: true },
              sx: { display: 'none' },
            },
            // popper anchored to the icon; open ABOVE it (top-end)
            popper: {
              anchorEl: () => datePickerAnchorRef.current,
              placement: 'top-end',
              modifiers: [
                { name: 'offset', options: { offset: [0, 10] } }, // 10px gap
                { name: 'flip', options: { fallbackPlacements: ['bottom-end'] } },
                { name: 'preventOverflow', options: { boundary: 'viewport', padding: 8 } },
              ],
              disablePortal: false, // render to body (clipping 방지)
            },
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton
            ref={datePickerAnchorRef}
            onClick={() => setOpenDatePicker(true)}
            aria-label="Select due date"
            sx={{ p: '8px' }}
          >
            <CalendarTodayIcon />
          </IconButton>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            {dueDate && dayjs(dueDate).isValid()
              ? dayjs(dueDate).format('YYYY-MM-DD')
              : 'No Due Date'}
          </Typography>
        </Box>
      </LocalizationProvider>

      <Button type="submit" variant="contained">Add</Button>
    </Box>
  );
});

export default TodoForm;

import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { TextField, Button, Box, IconButton, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { createTodo } from '../api';
import dayjs from 'dayjs';
import { useTheme, alpha } from '@mui/material/styles';

const TodoForm = forwardRef(({ onTodoCreated }, ref) => {
  const [task, setTask] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [openDatePicker, setOpenDatePicker] = useState(false);

  const inputRef = useRef(null);
  const datePickerAnchorRef = useRef(null);

  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  useImperativeHandle(ref, () => ({
    focusTodoInput: () => inputRef.current?.focus(),
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!task.trim()) return;
    const newTodo = await createTodo({
      task,
      due_date: dueDate && dueDate.isValid() ? dueDate.format('YYYY-MM-DD') : null,
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
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        p: 2,
        borderRadius: 2,
        // ▼ Glassmorphism
        position: 'relative',
        overflow: 'hidden',
        isolation: 'isolate',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        backgroundColor: isLight ? alpha('#ffffff', 0.65) : alpha('#0B253A', 0.9),
        border: isLight
          ? '1px solid rgba(255,255,255,0.45)'
          : '1px solid rgba(255,255,255,0.10)',
        boxShadow: '0 4px 18px rgba(0,0,0,0.12)',
        // 은은한 카드 내부 광원 (중첩 최소화)
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          background: isLight
            ? 'radial-gradient(60% 40% at 18% 0%, rgba(255,255,255,0.18), rgba(255,255,255,0.08) 40%, transparent 70%)'
            : 'radial-gradient(120% 40% at 20% 0%, rgba(255,255,255,0.04), rgba(255,255,255,0.01) 40%, transparent 70%)',
          mixBlendMode: 'screen',
        },
        // 내용은 광원 위
        '& > *': { position: 'relative', zIndex: 1 },
        overflowX: 'hidden',
      }}
    >
      <TextField
        inputRef={inputRef}
        fullWidth
        sx={{ flexGrow: 1 }}
        variant="outlined"
        label="할 일을 입력하세요"
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
          slotProps={{
            textField: {
              inputProps: { readOnly: true },
              sx: { display: 'none' }, // 아이콘으로만 열기
            },
            popper: {
              anchorEl: () => datePickerAnchorRef.current,
              placement: 'top-end', // 폼이 하단에 있으므로 위로
              modifiers: [
                { name: 'offset', options: { offset: [0, 10] } },
                { name: 'flip', options: { fallbackPlacements: ['bottom-end'] } },
                { name: 'preventOverflow', options: { boundary: 'viewport', padding: 8 } },
              ],
              disablePortal: false,
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

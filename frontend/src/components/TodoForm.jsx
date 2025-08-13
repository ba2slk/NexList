import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { TextField, Box, IconButton, Typography } from '@mui/material';
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

  const [showWarn, setShowWarn] = useState(false);
  const warnTimerRef = useRef(null);

  const inputRef = useRef(null);
  const datePickerAnchorRef = useRef(null);

  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  useImperativeHandle(ref, () => ({
    focusTodoInput: () => inputRef.current?.focus(),
  }));

  const triggerWarn = () => {
    setShowWarn(true);
    clearTimeout(warnTimerRef.current);
    warnTimerRef.current = setTimeout(() => setShowWarn(false), 1400);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!task.trim()) {
      triggerWarn();
      return;
    }
    const newTodo = await createTodo({
      task,
      due_date: dueDate && dueDate.isValid() ? dueDate.format('YYYY-MM-DD') : null,
    });
    onTodoCreated(newTodo);
    setTask('');
    setDueDate(null);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        role="status"
        aria-live="polite"
        sx={{
          position: 'absolute',
          left: 16,
          right: 16,
          top: -35,
          p: '6px 10px 0px 5px',
          borderRadius: 8,
          textAlign: 'center',
          fontSize: 13,
          pointerEvents: 'none',
          opacity: showWarn ? 1 : 0,
          transform: `translateY(${showWarn ? '0' : '-4px'})`,
          transition: 'opacity 220ms ease, transform 220ms ease',
          color: theme.palette.error.main,
          backgroundColor: alpha(theme.palette.error.main, isLight ? 0.16 : 0.22),
          border: `1px solid ${alpha(theme.palette.error.main, 0.35)}`,
          boxShadow: '0 6px 16px rgba(0,0,0,0.18)',
        }}
      >
        아무것도 안 하실 건가요?
      </Box>

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
          '& > *': { position: 'relative', zIndex: 1 },
          overflowX: 'hidden',
        }}
      >
        <TextField
          inputRef={inputRef}
          fullWidth
          sx={{
            flexGrow: 1,
            '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
              borderColor: showWarn
                ? `${theme.palette.error.main} !important`
                : undefined,
            },
            '& .MuiOutlinedInput-root': {
              transition: 'background-color 200ms ease, box-shadow 200ms ease',
              backgroundColor: showWarn
                ? alpha(theme.palette.error.main, isLight ? 0.12 : 0.16)
                : undefined,
              boxShadow: showWarn ? `0 0 0 3px ${alpha(theme.palette.error.main, 0.25)}` : 'none',
            },
          }}
          variant="outlined"
          label="할 일을 추가하세요"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
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
                sx: { display: 'none' },
              },
              popper: {
                anchorEl: () => datePickerAnchorRef.current,
                placement: 'top-end',
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
                : '마감 기한 없음'}
            </Typography>
          </Box>
        </LocalizationProvider>
      </Box>
    </Box>
  );
});

export default TodoForm;
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { List, ListItem, ListItemText, IconButton, Checkbox, TextField, Box, Typography, Tabs, Tab } from '@mui/material';
import { Delete } from '@mui/icons-material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { deleteTodo, toggleTodo, updateTodo } from '../api';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { useTheme, alpha } from '@mui/material/styles';

function TodoList({ todos, onTodoDeleted, onTodoToggled, onTodoUpdated, maxHeight, onTabChange }) {
  const [tabValue, setTabValue] = useState(0); // 0 = 오늘 할 일, 1 = 창고
  const [editingTaskTodoId, setEditingTaskTodoId] = useState(null);
  const [editedTask, setEditedTask] = useState('');
  const [editedDueDate, setEditedDueDate] = useState(null);
  const [openDatePickerId, setOpenDatePickerId] = useState(null);

  const datePickerAnchorRefs = useRef({});
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  const playedRef = useRef(new Set());
  const listRef = useRef(null);
  const [, force] = useState(0);

  // ── 커스텀 오버레이 스크롤바
  const [thumbTop, setThumbTop] = useState(0);
  const [thumbH, setThumbH] = useState(0);
  const [showBar, setShowBar] = useState(false);
  const hideTimerRef = useRef(null);

  // ▶️ 새로 추가된 항목이 "맨 끝"에 붙었을 때만 자동 스크롤
  const prevIdsRef = useRef(new Set());
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const currIds = new Set(todos.map(t => t?.id));
    let addedId = null;
    for (const t of todos) {
      const id = t?.id;
      if (id != null && !prevIdsRef.current.has(id)) addedId = id;
    }
    if (addedId) {
      const last = todos[todos.length - 1];
      const isAppendedAtEnd = last && (last.id === addedId || last.isNew);
      const hasScrollbar = el.scrollHeight > el.clientHeight;
      if (isAppendedAtEnd && hasScrollbar) {
        requestAnimationFrame(() => {
          el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
        });
      }
    }
    prevIdsRef.current = currIds;
  }, [todos]);

  const recalcThumb = () => {
    const el = listRef.current;
    if (!el) return;
    const { scrollTop, clientHeight, scrollHeight } = el;
    const ratio = clientHeight / scrollHeight;
    const h = Math.max(24, Math.round(clientHeight * ratio));
    const top = Math.round((scrollTop / Math.max(1, scrollHeight - clientHeight)) * (clientHeight - h)) || 0;
    setThumbH(h);
    setThumbTop(top);
  };

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const onScroll = () => {
      recalcThumb();
      setShowBar(true);
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => setShowBar(false), 700);
    };
    const onEnter = () => setShowBar(true);
    const onLeave = () => setShowBar(false);

    recalcThumb();
    el.addEventListener('scroll', onScroll, { passive: true });
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    window.addEventListener('resize', recalcThumb);
    return () => {
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('resize', recalcThumb);
      clearTimeout(hideTimerRef.current);
    };
  }, [maxHeight]);

  // CRUD helpers
  const handleDelete = async (id) => {
    await deleteTodo(id);
    onTodoDeleted(id);
  };

  const handleToggle = async (id) => {
    const todo = todos.find((t) => t.id === id);
    await toggleTodo(id, !todo.is_done);
    onTodoToggled(id);
  };

  const saveTask = async (id, value) => {
    const todoToUpdate = todos.find((t) => t.id === id);
    const updatedData = { task: value, due_date: todoToUpdate.due_date };
    await updateTodo(id, updatedData);
    onTodoUpdated(id, updatedData.task, updatedData.due_date);
  };

  const saveDue = async (id, valueDayjs) => {
    const todoToUpdate = todos.find((t) => t.id === id);
    const updatedData = {
      task: todoToUpdate.task,
      due_date: valueDayjs ? dayjs(valueDayjs).format('YYYY-MM-DD') : null,
    };
    await updateTodo(id, updatedData);
    onTodoUpdated(id, updatedData.task, updatedData.due_date);
  };

  const handleKeyDown = (event, id) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveTask(id, editedTask);
      setEditingTaskTodoId(null);
      setEditedTask('');
    }
  };

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    contentReveal: { opacity: 1, transition: { duration: 0.18, delay: 0.16, ease: 'easeOut' } }
  }), []);

  const isEmpty = !todos || todos.length === 0;

  return (
    <Box
      sx={{
        maxWidth: 520,
        minWidth: 520,
        mx: 'auto',
        p: 0,
        mb: 2,
        borderRadius: 3,
        background: 'transparent',
        boxShadow: 'none',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* 탭 영역 */}
      <Tabs
        value={tabValue}
        onChange={(e, newValue) => {
          setTabValue(newValue);
          if (onTabChange) {
            // 0 = 오늘 할 일(true), 1 = 창고(false)
            onTabChange(newValue === 0);
          }
        }}
        sx={{ mb: 1 }}
        textColor="primary"
        indicatorColor="primary"
        centered
      >
        <Tab label="오늘 할 일" />
        <Tab label="창고" />
      </Tabs>

      {/* 할 일 리스트 */}
      {!isEmpty && (
        <List
          ref={listRef}
          sx={{
            position: 'relative',
            zIndex: 1,
            maxHeight: maxHeight,
            overflowY: 'auto',
            overflowX: 'hidden',
            px: 0,
            py: 0,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { width: 0, height: 0 },
          }}
        >
          {todos.map((todo, index) => {
            const key = todo.id ?? index;
            const hasPlayed = playedRef.current.has(key);
            const shouldAnimate = !!todo.isNew && !hasPlayed;

            return (
              <motion.div
                key={key}
                initial={shouldAnimate ? 'hidden' : false}
                animate={shouldAnimate ? 'contentReveal' : { opacity: 1 }}
                onAnimationComplete={() => {
                  if (shouldAnimate) {
                    playedRef.current.add(key);
                    force(v => v + 1);
                  }
                }}
                style={{ position: 'relative', width: '100%' }}
              >
                <ListItem
                  sx={{
                    my: 1.25,
                    mx: 0,
                    px: 2,
                    py: 0.8,
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
                    boxShadow: isLight
                      ? '0 4px 18px rgba(0,0,0,0.04)'
                      : '0 4px 18px rgba(0,0,0,0.12)',
                    alignItems: 'flex-start',
                  }}
                  secondaryAction={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        edge="end"
                        aria-label="pick-due"
                        ref={(el) => (datePickerAnchorRefs.current[todo.id] = el)}
                        onClick={() => {
                          setEditedDueDate(
                            todo.due_date && dayjs(todo.due_date).isValid() ? dayjs(todo.due_date) : null
                          );
                          setOpenDatePickerId(todo.id);
                        }}
                      >
                        <CalendarTodayIcon />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(todo.id)}>
                        <Delete />
                      </IconButton>
                    </Box>
                  }
                >
                  <Checkbox
                    checked={todo.is_done || false}
                    onChange={() => handleToggle(todo.id)}
                    sx={{ mt: 0.25, alignSelf: 'flex-start' }}
                  />

                  <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, mr: 10 }}>
                    {editingTaskTodoId === todo.id ? (
                      <TextField
                        value={editedTask}
                        onChange={(e) => setEditedTask(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, todo.id)}
                        onBlur={() => {
                          saveTask(todo.id, editedTask);
                          setEditingTaskTodoId(null);
                          setEditedTask('');
                        }}
                        fullWidth
                        variant="standard"
                        autoFocus
                        InputProps={{ sx: { fontSize: '1rem', lineHeight: 1.5, py: 0 } }}
                      />
                    ) : (
                      <ListItemText
                        primary={todo.task}
                        primaryTypographyProps={{
                          sx: {
                            fontSize: '1rem',
                            lineHeight: 1.5,
                            fontWeight: 500,
                            textDecoration: todo.is_done ? 'line-through' : 'none',
                          },
                        }}
                        sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
                        onClick={() => {
                          setEditingTaskTodoId(todo.id);
                          setEditedTask(todo.task);
                        }}
                      />
                    )}

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0, fontSize: '0.765rem' }}
                    >
                      {todo.due_date && dayjs(todo.due_date).isValid()
                        ? `Due: ${dayjs(todo.due_date).format('YYYY-MM-DD')}`
                        : 'Due: -'}
                    </Typography>
                  </Box>

                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      open={openDatePickerId === todo.id}
                      onOpen={() => setOpenDatePickerId(todo.id)}
                      onClose={() => setOpenDatePickerId(null)}
                      value={editedDueDate}
                      onChange={(newValue) => {
                        setEditedDueDate(newValue);
                        if (newValue && newValue.isValid()) {
                          saveDue(todo.id, newValue);
                        } else if (newValue === null) {
                          saveDue(todo.id, null);
                        }
                      }}
                      slotProps={{
                        textField: { inputProps: { readOnly: true }, sx: { display: 'none' } },
                        popper: {
                          anchorEl: () => datePickerAnchorRefs.current[todo.id],
                          placement: 'bottom-end',
                          modifiers: [
                            { name: 'offset', options: { offset: [0, 10] } },
                            { name: 'flip', options: { fallbackPlacements: ['top-end'] } },
                            { name: 'preventOverflow', options: { boundary: 'viewport', padding: 8 } },
                          ],
                          disablePortal: false,
                        },
                      }}
                    />
                  </LocalizationProvider>
                </ListItem>
              </motion.div>
            );
          })}
        </List>
      )}

      {/* 커스텀 스크롤바 */}
      <Box
        aria-hidden
        sx={{
          pointerEvents: 'none',
          position: 'absolute',
          right: 6,
          top: 48,
          bottom: 8,
          width: 6,
          borderRadius: 3,
          zIndex: 2,
          opacity: showBar ? 1 : 0,
          transition: 'opacity 220ms ease',
          background: 'transparent',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            width: '100%',
            height: `${thumbH}px`,
            top: `${thumbTop + 8}px`,
            borderRadius: 3,
            background: isLight ? 'rgba(60,72,90,0.35)' : 'rgba(255,255,255,0.28)',
            boxShadow: '0 0 8px rgba(0,0,0,0.15)',
          }}
        />
      </Box>
    </Box>
  );
}

export default TodoList;

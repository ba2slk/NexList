import React, { useState, useRef, useMemo, useEffect } from 'react';
import { List, ListItem, ListItemText, IconButton, Checkbox, TextField, Box, Typography } from '@mui/material';
import { Delete, Save } from '@mui/icons-material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { deleteTodo, toggleTodo, updateTodo } from '../api';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { useTheme, alpha } from '@mui/material/styles';

function TodoList({ todos, onTodoDeleted, onTodoToggled, onTodoUpdated, maxHeight }) {
  const [editingTaskTodoId, setEditingTaskTodoId] = useState(null);
  const [editingDueDateTodoId, setEditingDueDateTodoId] = useState(null);
  const [editedTask, setEditedTask] = useState('');
  const [editedDueDate, setEditedDueDate] = useState(null);
  const [openDatePickerId, setOpenDatePickerId] = useState(null);

  const datePickerAnchorRefs = useRef({});
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  const playedRef = useRef(new Set());
  const listRef = useRef(null);
  const [, force] = useState(0);

  // custom overlay scrollbar state
  const [thumbTop, setThumbTop] = useState(0);
  const [thumbH, setThumbH] = useState(0);
  const [showBar, setShowBar] = useState(false);
  const hideTimerRef = useRef(null);

  // auto scroll to bottom when new item appears (only if scrollbar exists)
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    if (el.scrollHeight <= el.clientHeight) return;
    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    });
  }, [todos.length]);

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

  const handleDelete = async (id) => {
    await deleteTodo(id);
    onTodoDeleted(id);
  };

  const handleToggle = async (id) => {
    const todo = todos.find((t) => t.id === id);
    await toggleTodo(id, !todo.is_done);
    onTodoToggled(id);
  };

  const handleSaveClick = async (id, field, newDueDateValue = undefined) => {
    const todoToUpdate = todos.find((t) => t.id === id);
    let updatedData = {};
    if (field === 'task') {
      updatedData = { task: editedTask, due_date: todoToUpdate.due_date };
      setEditingTaskTodoId(null);
      setEditedTask('');
    } else if (field === 'due_date') {
      const finalDueDate = newDueDateValue !== undefined ? newDueDateValue : editedDueDate;
      updatedData = { task: todoToUpdate.task, due_date: finalDueDate ? dayjs(finalDueDate).format('YYYY-MM-DD') : null };
      setEditingDueDateTodoId(null);
      setEditedDueDate(null);
      setOpenDatePickerId(null);
    }
    await updateTodo(id, updatedData);
    onTodoUpdated(id, updatedData.task, updatedData.due_date);
  };

  const handleKeyDown = (event, id, field) => {
    if (event.key === 'Enter') handleSaveClick(id, field);
  };

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    contentReveal: { opacity: 1, transition: { duration: 0.18, delay: 0.16, ease: 'easeOut' } }
  }), []);

  const isEmpty = !todos || todos.length === 0;
  if (isEmpty) return null;

  return (
    <Box
      sx={{
        // 🧽 컨테이너는 완전 투명: 배경/블러/보더 모두 제거
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
          // 네이티브 스크롤바 숨김(대칭 유지) — 커스텀 thumb만 표시
          scrollbarWidth: 'none',                     // Firefox
          '&::-webkit-scrollbar': { width: 0, height: 0 }, // WebKit
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
              {/* 생성 애니메이션 오버레이(원→수평확장→둥근사각형, 그대로 유지) */}
              {shouldAnimate && (
                <motion.div
                  initial={{ clipPath: 'circle(0% at 50% 50%)' }}
                  animate={{
                    clipPath: [
                      'circle(0% at 50% 50%)',
                      'circle(56% at 50% 50%)',
                      'inset(0% round 16px)'
                    ],
                    opacity: [1, 1, 0]
                  }}
                  transition={{ duration: 0.36, ease: [0.2, 0.8, 0.2, 1], times: [0, 0.45, 1] }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: theme.palette.background.paper,
                    zIndex: 0,
                    pointerEvents: 'none'
                  }}
                />
              )}

              {/* 실제 카드 */}
              <motion.div
                variants={itemVariants}
                initial={shouldAnimate ? 'hidden' : false}
                animate={shouldAnimate ? 'contentReveal' : { opacity: 1 }}
                style={{ position: 'relative', zIndex: 1 }}
              >
                <ListItem
                  sx={{
                    my: 1.25,
                    mx: 0,
                    px: 2,
                    py: 1.75,
                    borderRadius: 2,
                    position: 'relative',
                    overflow: 'hidden',
                    isolation: 'isolate', // 블렌딩 누수 방지
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    backgroundColor: isLight ? alpha('#ffffff', 0.65) : alpha('#0B253A', 0.9),
                    border: isLight
                      ? '1px solid rgba(255,255,255,0.45)'
                      : '1px solid rgba(255,255,255,0.10)',
                    boxShadow: '0 4px 18px rgba(0,0,0,0.12)',
                    // 🟡 카드 개별 radial 광원
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      inset: 0,
                      zIndex: 0,
                      pointerEvents: 'none',
                      background: isLight
                        ? 'radial-gradient(60% 40% at 18% 0%, rgba(255,255,255,0.18), rgba(255,255,255,0.08) 40%, transparent 70%)'
                        : 'radial-gradient(120% 40% at 20% 0%, rgba(255,255,255,0.04), rgba(255,255,255,0.01) 40%, transparent 70%)',
                      mixBlendMode: 'screen',
                    },
                  }}
                  secondaryAction={
                    <>
                      {editingTaskTodoId === todo.id && (
                        <IconButton edge="end" aria-label="save-task" onClick={() => handleSaveClick(todo.id, 'task')}>
                          <Save />
                        </IconButton>
                      )}
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
                        onBlur={() => handleSaveClick(todo.id, 'task')}
                        fullWidth
                        variant="standard"
                        autoFocus
                      />
                    ) : (
                      <ListItemText
                        primary={todo.task}
                        sx={{
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                          textDecoration: todo.is_done ? 'line-through' : 'none',
                        }}
                        onClick={() => {
                          setEditingTaskTodoId(todo.id);
                          setEditedTask(todo.task);
                        }}
                      />
                    )}

                    {/* Due Date */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          open={openDatePickerId === todo.id}
                          onOpen={() => setOpenDatePickerId(todo.id)}
                          onClose={() => setOpenDatePickerId(null)}
                          value={editedDueDate}
                          onChange={(newValue) => {
                            setEditedDueDate(newValue);
                            if (newValue && newValue.isValid()) {
                              handleSaveClick(todo.id, 'due_date', newValue);
                            } else if (newValue === null) {
                              handleSaveClick(todo.id, 'due_date', null);
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
                        <IconButton
                          ref={(el) => (datePickerAnchorRefs.current[todo.id] = el)}
                          onClick={() => {
                            setEditingDueDateTodoId(todo.id);
                            setEditedDueDate(
                              todo.due_date && dayjs(todo.due_date).isValid() ? dayjs(todo.due_date) : null
                            );
                            setOpenDatePickerId(todo.id);
                          }}
                          aria-label="Select due date"
                          sx={{ p: '8px' }}
                        >
                          <CalendarTodayIcon />
                        </IconButton>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ whiteSpace: 'nowrap', cursor: 'pointer' }}
                          onClick={() => {
                            setEditingDueDateTodoId(todo.id);
                            setEditedDueDate(
                              todo.due_date && dayjs(todo.due_date).isValid() ? dayjs(todo.due_date) : null
                            );
                            setOpenDatePickerId(todo.id);
                          }}
                        >
                          {todo.due_date && dayjs(todo.due_date).isValid()
                            ? `Due: ${dayjs(todo.due_date).format('YYYY-MM-DD')}`
                            : '마감 기한 입력하기'}
                        </Typography>
                      </LocalizationProvider>
                    </Box>
                  </Box>
                </ListItem>
              </motion.div>
            </motion.div>
          );
        })}
      </List>

      {/* 커스텀 오버레이 스크롤바 (페이드 인/아웃) */}
      <Box
        aria-hidden
        sx={{
          pointerEvents: 'none',
          position: 'absolute',
          right: 6,
          top: 8,
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

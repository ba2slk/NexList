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
import { useTheme } from '@mui/material/styles';

function TodoList({ todos, onTodoDeleted, onTodoToggled, onTodoUpdated, maxHeight }) {
  const [editingTaskTodoId, setEditingTaskTodoId] = useState(null);
  const [editingDueDateTodoId, setEditingDueDateTodoId] = useState(null);
  const [editedTask, setEditedTask] = useState('');
  const [editedDueDate, setEditedDueDate] = useState(null);
  const [openDatePickerId, setOpenDatePickerId] = useState(null);
  const datePickerAnchorRefs = useRef({});
  const theme = useTheme();

  const playedRef = useRef(new Set());
  const listRef = useRef(null);

  // 새 아이템 추가/삭제 시, 스크롤바가 활성화되어 있으면 맨 아래로 스무스 스크롤
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const hasScrollbar = el.scrollHeight > el.clientHeight;
    if (!hasScrollbar) return;

    // 레이아웃/애니메이션 반영 후 한 프레임 뒤 이동
    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    });
  }, [todos.length]);

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
    contentReveal: {
      opacity: 1,
      transition: { duration: 0.18, delay: 0.16, ease: 'easeOut' }
    }
  }), []);

  return (
    <Box
      sx={{
        maxWidth: 520,
        minWidth: 520,
        mx: 'auto',
        p: 2,
        borderRadius: 2,
        boxShadow: 3,
        mb: 2,
        bgcolor: 'background.paper',
        overflowX: 'hidden',
      }}
    >
      <List
        ref={listRef}
        sx={{
          maxHeight: maxHeight,
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarGutter: 'stable',
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-track': { background: 'rgba(0,0,0,0.1)', borderRadius: '10px' },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '10px',
            '&:hover': { background: 'rgba(0,0,0,0.5)' },
          },
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,0,0,0.3) rgba(0,0,0,0.1)',
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
              onAnimationComplete={() => { if (shouldAnimate) playedRef.current.add(key); }}
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 16,
                width: '100%',
                willChange: 'clip-path, opacity'
              }}
            >
              {shouldAnimate && (
                <motion.div
                  initial={{ clipPath: 'circle(0% at 50% 50%)' }}
                  animate={{
                    clipPath: [
                      'circle(0% at 50% 50%)',
                      'circle(56% at 50% 50%)',
                      'inset(0% round 16px)'
                    ]
                  }}
                  transition={{ duration: 0.36, ease: [0.2, 0.8, 0.2, 1], times: [0, 0.45, 1] }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: theme.palette.background.paper,
                    zIndex: 0,
                  }}
                />
              )}

              <motion.div
                variants={itemVariants}
                initial={shouldAnimate ? 'hidden' : false}
                animate={shouldAnimate ? 'contentReveal' : { opacity: 1 }}
                style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}
              >
                <ListItem
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
                        style={{ textDecoration: todo.is_done ? 'line-through' : 'none' }}
                        sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
                        onClick={() => {
                          setEditingTaskTodoId(todo.id);
                          setEditedTask(todo.task);
                        }}
                      />
                    )}

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
                            textField: {
                              inputProps: { readOnly: true },
                              sx: { display: 'none' },
                            },
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
                            : 'Add Due Date'}
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
    </Box>
  );
}

export default TodoList;

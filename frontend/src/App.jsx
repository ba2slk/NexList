// App.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

import Pomodoro from './components/Pomodoro';
import Memo from './components/Memo';
import TodoSection from './components/TodoSection';
import { login, logout, getLoginStatus, getTodosToday } from './api';
import { getAppTheme } from './theme';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isTodayTab, setIsTodayTab] = useState(true);
  const [todosToday, setTodosTodayState] = useState([]);
  const [todosStorage, setTodosStorageState] = useState([]);

  const appBarRef = useRef(null);
  const todoInputRef = useRef(null);

  const [mode, setMode] = useState('light');
  const theme = useMemo(() => getAppTheme(mode), [mode]);

  const todos = isTodayTab ? todosToday : todosStorage;

  useEffect(() => {
    const init = async () => {
      const status = await getLoginStatus();
      setIsLoggedIn(status);
      if (status) {
        const todayList = await getTodosToday(true);
        const storageList = await getTodosToday(false);
        setTodosTodayState(todayList);
        setTodosStorageState(storageList);
      } else {
        setTodosTodayState([]);
        setTodosStorageState([]);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter' && isLoggedIn) {
        const el = document.activeElement;
        const isInputFocused = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA');
        if (!isInputFocused && todoInputRef.current) {
          event.preventDefault();
          todoInputRef.current.focusTodoInput();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLoggedIn]);

  const handleLogin = () => login();

  const handleLogout = async () => {
    await logout();
    setIsLoggedIn(false);
    setTodosTodayState([]);
    setTodosStorageState([]);
  };

  const handleTabChange = async (nextIsToday) => {
    console.log('handleTabChange called with', nextIsToday);
    setIsTodayTab(nextIsToday);
    if (!isLoggedIn) return;

    if (nextIsToday && todosToday.length === 0) {
      const todayList = await getTodosToday(true);
      setTodosTodayState(todayList);
    }
    if (!nextIsToday && todosStorage.length === 0) {
      const storageList = await getTodosToday(false);
      setTodosStorageState(storageList);
    }
  };

  const handleTodoCreated = (newTodo) => {
    const bucket = newTodo?.today === true;
    const withFlag = { ...newTodo, isNew: true };
    if (bucket) {
      setTodosTodayState((prev) => [...prev, withFlag]);
    } else {
      setTodosStorageState((prev) => [...prev, withFlag]);
    }
  };

  const patchById = (list, id, updater) => list.map((t) => (t.id === id ? updater(t) : t));
  const removeById = (list, id) => list.filter((t) => t.id !== id);

  const handleTodoDeleted = (id) => {
    setTodosTodayState((prev) => removeById(prev, id));
    setTodosStorageState((prev) => removeById(prev, id));
  };

  const handleTodoToggled = (id) => {
    setTodosTodayState((prev) => patchById(prev, id, (t) => ({ ...t, is_done: !t.is_done })));
    setTodosStorageState((prev) => patchById(prev, id, (t) => ({ ...t, is_done: !t.is_done })));
  };

  const handleTodoUpdated = (id, updatedTask, updatedDueDate) => {
    setTodosTodayState((prev) =>
      patchById(prev, id, (t) => ({ ...t, task: updatedTask, due_date: updatedDueDate }))
    );
    setTodosStorageState((prev) =>
      patchById(prev, id, (t) => ({ ...t, task: updatedTask, due_date: updatedDueDate }))
    );
  };

  const toggleTheme = () => setMode((m) => (m === 'light' ? 'dark' : 'light'));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" ref={appBarRef} className="no-glow">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            NexList
          </Typography>
          <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          {isLoggedIn ? (
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Button color="inherit" onClick={handleLogin}>
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, height: 'calc(100vh - 64px - 32px)' }}>
        {isLoggedIn ? (
          <Grid container spacing={3} sx={{ height: '100%' }}>
            <Grid item xs={12} sm={6} md={4} container direction="column" spacing={3}>
              <Grid item>
                <Pomodoro />
              </Grid>
              <Grid item sx={{ flexGrow: 1 }}>
                <Memo />
              </Grid>
            </Grid>

            <Grid item xs={12} sm={6} md={8}>
              <TodoSection
                todos={todos}
                onTodoDeleted={handleTodoDeleted}
                onTodoToggled={handleTodoToggled}
                onTodoUpdated={handleTodoUpdated}
                onTodoCreated={handleTodoCreated}
                appBarRef={appBarRef}
                todoInputRef={todoInputRef}
                onTabChange={handleTabChange}
              />
            </Grid>
          </Grid>
        ) : (
          <Typography variant="h5" align="center" color="text.secondary" paragraph>
            Please login to continue.
          </Typography>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;

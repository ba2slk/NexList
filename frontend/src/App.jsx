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
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Moon icon for dark mode
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Sun icon for light mode

// Removed Box, TodoForm imports
import Pomodoro from './components/Pomodoro';
import Memo from './components/Memo';
import TodoSection from './components/TodoSection';
import { login, logout, getLoginStatus, getTodos } from './api';
import { getAppTheme } from './theme';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [todos, setTodos] = useState([]);
  const [mode, setMode] = useState('light'); // State for theme mode
  const appBarRef = useRef(null);

  const theme = useMemo(() => getAppTheme(mode), [mode]);

  useEffect(() => {
    const checkAndFetchTodos = async () => {
      const status = await getLoginStatus();
      console.log("Login Status:", status);
      setIsLoggedIn(status);
      if (status) {
        const fetchedTodos = await getTodos();
        console.log("Fetched Todos:", fetchedTodos);
        setTodos(fetchedTodos);
      } else {
        setTodos([]);
      }
    };

    checkAndFetchTodos();
  }, [isLoggedIn]);

  const handleLogin = () => {
    login();
  };

  const handleLogout = async () => {
    await logout();
    setIsLoggedIn(false);
  };

  const handleTodoCreated = (newTodo) => {
    setTodos([...todos, newTodo]);
  };

  const handleTodoDeleted = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const handleTodoToggled = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, is_done: !todo.is_done } : todo
      )
    );
  };

  const handleTodoUpdated = (id, updatedTask, updatedDueDate) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, task: updatedTask, due_date: updatedDueDate } : todo
      )
    );
  };

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" ref={appBarRef}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            NexList
          </Typography>
          <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          {isLoggedIn ? (
            <Button color="inherit" onClick={handleLogout}>Logout</Button>
          ) : (
            <Button color="inherit" onClick={handleLogin}>Login</Button>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, height: 'calc(100vh - 64px - 32px)' }}> {/* Set height for Container */}
        {isLoggedIn ? (
          <Grid container spacing={3} justifyContent="center" sx={{ height: '100%' }}> {/* Ensure Grid takes full height */}
            <Grid item xs={12} sm={6} md={4}>
              <Pomodoro />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TodoSection
                todos={todos}
                onTodoDeleted={handleTodoDeleted}
                onTodoToggled={handleTodoToggled}
                onTodoUpdated={handleTodoUpdated}
                onTodoCreated={handleTodoCreated}
                appBarRef={appBarRef}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Memo />
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
        
import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import TodoList from './components/TodoList';
import TodoForm from './components/TodoForm';
import Pomodoro from './components/Pomodoro';
import Memo from './components/Memo';
import { login, logout, getLoginStatus, getTodos } from './api';
import theme from './theme';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    const checkAndFetchTodos = async () => {
      const status = await getLoginStatus();
      console.log("Login Status:", status); // Log login status
      setIsLoggedIn(status);
      if (status) {
        const fetchedTodos = await getTodos();
        console.log("Fetched Todos:", fetchedTodos); // Log fetched todos
        setTodos(fetchedTodos);
      } else {
        setTodos([]); // Clear todos if logged out
      }
    };

    checkAndFetchTodos();
  }, [isLoggedIn]); // Add isLoggedIn to the dependency array

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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            NexList
          </Typography>
          {isLoggedIn ? (
            <Button color="inherit" onClick={handleLogout}>Logout</Button>
          ) : (
            <Button color="inherit" onClick={handleLogin}>Login</Button>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {isLoggedIn ? (
          <Grid container spacing={3}>
            <Grid xs={12} md={4}>
              <Pomodoro />
            </Grid>
            <Grid xs={12} md={4}>
              <TodoForm onTodoCreated={handleTodoCreated} />
              <TodoList todos={todos} onTodoDeleted={handleTodoDeleted} onTodoToggled={handleTodoToggled} />
            </Grid>
            <Grid xs={12} md={4}>
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
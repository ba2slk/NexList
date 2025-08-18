const API_URL = 'http://localhost:8000/todos';
const AUTH_URL = 'http://localhost:8000/auth';

export const getTodos = async () => {
  const response = await fetch(`${API_URL}/`, { credentials: 'include' });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
  }
  return await response.json();
};

export const getTodosToday = async (today) => {
  const response = await fetch(`${API_URL}/?today=${today}`, { credentials: 'include' });
  console.log(response);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
  }
  return await response.json();
};

export const createTodo = async (todo) => {
  const response = await fetch(`${API_URL}/`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(todo),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
  }
  return await response.json();
};

export const updateTodo = async (id, todo) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(todo),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
  }
  return await response.json();
};

export const deleteTodo = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, { 
    method: 'DELETE',
    credentials: 'include',
   });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
  }
};

export const toggleTodo = async (id, isDone) => {
  const response = await fetch(`${API_URL}/${id}/completed`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ "is_done": isDone })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
  }
};

export const deleteAllTodos = async () => {
  const response = await fetch(`${API_URL}/`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
  }
};

export const login = () => {
  window.location.href = `${AUTH_URL}/login/google`;
};

export const logout = async () => {
  const response = await fetch(`${AUTH_URL}/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  return response.ok;
};

export const getLoginStatus = async () => {
  const response = await fetch(`${AUTH_URL}/me`, { credentials: 'include' });
  return response.ok;
};
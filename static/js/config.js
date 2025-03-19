const API_URL =
  window.location.hostname === "localhost"
    ? "http://127.0.0.1:8000/todo"
    : "http://52.78.183.154/todo";

export { API_URL };

## 2025-08-18: Frontend Enhancements and Debugging

### 1. Tab-Switching Bug Fix

*   **Problem:** The todo list was not updating when switching between "Today" and "Storage" tabs, despite the backend correctly serving filtered data.
*   **Cause:** The `onTabChange` prop, intended to trigger data fetching in the parent component, was not being passed down from `App.jsx` to `TodoSection.jsx` and subsequently to `TodoList.jsx`.
*   **Solution:** Modified `App.jsx` to pass the `handleTabChange` function to `TodoSection.jsx`, and then modified `TodoSection.jsx` to pass this `onTabChange` prop down to `TodoList.jsx`.

### 2. Right-Click Context Menu for Todo Items

*   **Feature:** Implemented a right-click context menu on individual todo items to allow moving them between "Today" and "Storage" categories.
*   **API Integration:** Added a new `moveTodo` function to `frontend/src/api.js` to interact with the anticipated backend endpoint (`PUT /todos/{id}/move`).
*   **State Management:** Implemented a `handleTodoMoved` function in `frontend/src/App.jsx` to update the `todosToday` and `todosStorage` states after a successful move operation. This handler was passed down to `TodoSection.jsx` and `TodoList.jsx`.
*   **Context Menu Implementation (frontend/src/components/TodoList.jsx):**
    *   Added `Menu` and `MenuItem` imports.
    *   Introduced `contextMenu` state and `handleContextMenu`/`handleCloseContextMenu` functions to manage menu visibility and position.
    *   Added the `onContextMenu` prop to the `ListItem` component to trigger the custom context menu.
    *   **Persistent Issue:** Encountered significant and persistent technical limitations with the `replace` tool when attempting to programmatically insert the `<Menu>` component into the JSX and modify the `MenuItem`'s `onClick` handler. This required multiple attempts and debugging.
    *   **Current Status:** The `<Menu>` component has been successfully inserted into `TodoList.jsx` (confirmed by `read_file`). The `handleContextMenu` function is confirmed to be firing (via console logs). However, the menu is still not visually appearing, indicating a rendering or visibility issue with the Material-UI `Menu` component itself, which requires further manual debugging by the user. The `MenuItem`'s `onClick` still contains a `console.log` placeholder due to `replace` tool limitations.

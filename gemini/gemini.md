# Gemini Modifications Log

This file tracks all the modifications made to the codebase by Gemini.

## Frontend Refactoring: From Vanilla JS to React

### 1. Initial Setup and React Integration

*   **Environment Setup:** Initialized a Node.js environment with a `package.json` file.
*   **Dependencies:** Installed React, ReactDOM, and Vite for the frontend build process.
*   **Configuration:**
    *   Created a `vite.config.js` file to manage the build process and set up a proxy to the backend for local development.
    *   Added `dev` and `build` scripts to `package.json`.
*   **Project Structure:** Created a new `frontend` directory to house the React application.

### 2. UI/UX Overhaul with Material-UI

*   **Dependency Installation:** Added Material-UI (`@mui/material`, `@mui/icons-material`) and its required styling engine (`@emotion/react`, `@emotion/styled`).
*   **Theming:** Created a `theme.js` file to define a consistent and modern color palette for the application.
*   **Layout and Components:**
    *   Replaced the original HTML and vanilla JavaScript with React components.
    *   Structured the main application layout using Material-UI's `AppBar`, `Container`, and `Grid` components.
    *   Re-implemented all frontend components (`TodoList`, `TodoForm`, etc.) using Material-UI components like `Button`, `TextField`, `List`, `ListItem`, and `Checkbox` for a modern look and feel.

### 3. Feature Re-implementation in React

*   **Pomodoro Timer:** Re-created the Pomodoro timer as a new React component (`frontend/src/components/Pomodoro.jsx`), preserving its core functionality (start, pause, reset).
*   **Memo Pad:** Re-implemented the memo area as a new React component (`frontend/src/components/Memo.jsx`).
*   **API Integration:** Created a dedicated `api.js` file to centralize all API calls to the FastAPI backend, making the code more modular and easier to maintain.

### 4. Local Development Workflow (No Docker)

*   **Configuration:** Updated the project configuration to support a Docker-free local development workflow.
*   **Instructions:** Provided clear instructions on how to run the FastAPI backend and the React frontend development server separately for a smooth local development experience.

### 5. State Management

*   **Lifted State Up:** Refactored the application to manage the `todos` state in the main `App.jsx` component, instead of in the `TodoList.jsx` component. This solved a bug where the page would refresh every time a new todo was created.
*   **Prop Drilling:** The `todos` state and functions to modify it are now passed down to the `TodoList` and `TodoForm` components as props, ensuring that the UI updates correctly without a full page reload.

### 6. Bug Fixes

*   **Login Redirect:** Fixed a bug where the user was redirected to the old frontend URL (`/main`) after logging in. The redirect now points to the new React application running on `http://localhost:5173`.
*   **MUI Grid Warnings:** Updated the usage of Material-UI Grid components to align with the latest API, resolving console warnings related to `item`, `xs`, and `md` props.
*   **Controlled vs. Uncontrolled Component Warning:** Ensured that the `Checkbox` component in `TodoList.jsx` is always controlled by providing a default boolean value for its `checked` prop, preventing warnings about components switching between controlled and uncontrolled states.
*   **Incorrect API Endpoint for Todo Toggle:** Corrected the API endpoint used for toggling todo completion status from `/todos/{id}/toggle` to the correct `/todos/{id}/completed` in `api.js`. This resolved the `405 Method Not Allowed` error and related JSON parsing errors.
*   **Missing `key` Prop Warning:** Added a fallback for the `key` prop in `TodoList.jsx` to ensure each list item has a unique key, resolving React warnings.
*   **Trailing Slash in API URL:** Corrected the `API_URL` in `api.js` to include a trailing slash (`/todos/`) to match the backend's route definition, resolving a `405 Method Not Allowed` error when adding new todos.
*   **Todo List Not Showing After Login:** Modified the `useEffect` hook in `App.jsx` to correctly fetch and display the todo list when the user's login status changes.
*   **`401 Unauthorized` on `POST` Requests:** Resolved the `401 Unauthorized` error for `POST` requests by ensuring `credentials: 'include'` is added to all relevant `fetch` calls in `api.js`. This allows the browser to send authentication cookies with cross-origin requests, even with `SameSite=Lax`.
*   **Extra Closing Brace in `TodoList.jsx`:** Removed an extraneous closing curly brace at the end of `TodoList.jsx` that was causing a syntax error.
*   **`422` Error for `due_date` in `TodoForm.jsx`:** Corrected the handling of `dueDate` in `TodoForm.jsx` to ensure a valid date format is sent to the backend, preventing a `422` HTTP error when `dueDate` is null or invalid.
*   **Due Date Not Displaying in `TodoList.jsx`:** Added a `dayjs().isValid()` check before rendering the due date in `TodoList.jsx` to ensure only valid date strings are displayed, preventing display issues with malformed or empty date values.

## Dark Theme Implementation

### 1. Theme Definition (`frontend/src/theme.js`)

*   Modified `theme.js` to export a `getAppTheme` function that accepts a `mode` argument ('light' or 'dark').
*   Defined a new dark color palette inspired by the "Night Owl" theme, including primary, secondary, background, and text colors.
*   Adjusted `MuiCssBaseline`, `MuiPaper`, `MuiOutlinedInput` styles to adapt to the dark mode, maintaining glassmorphism effects where appropriate.

### 2. Theme Toggling (`frontend/src/App.jsx`)

*   Updated `App.jsx` to use `useState` for managing the current theme `mode`.
*   Implemented `useMemo` to efficiently create the theme object based on the current `mode`.
*   Added an `IconButton` to the `AppBar` with `Brightness4Icon` (moon) and `Brightness7Icon` (sun) to allow users to toggle between light and dark themes.
*   Installed `@mui/icons-material` package to use the icons.

## Resizable Memo Text Form

*   Modified `frontend/src/components/Memo.jsx` to make the `TextField` resizable vertically.
*   Applied `sx` prop to the `TextField` with `textarea: { resize: 'vertical', overflow: 'auto' }` to enable vertical resizing and ensure scrollbars appear when content overflows.

## Grid Layout Fix

*   Wrapped the `TodoSection` component in `frontend/src/App.jsx` with a `Grid item` to ensure proper Material-UI Grid layout behavior.

## Light Theme Update

*   Updated the light theme palette in `frontend/src/theme.js` to benchmark "Night Owl Light" colors, including primary, secondary, background, and text colors. The `paper` background was changed to solid white for a cleaner light theme appearance.

## Memo Save Button Position

*   Moved the "Save Memo" button to the right-hand side within the `Memo` component by wrapping it in a Material-UI `Box` component with `display: 'flex'` and `justifyContent: 'flex-end'`.

## Pomodoro Timer Enhancements

### 1. Scaling and Spacing

*   Increased the font size of the timer display by changing the `Typography` variant from `h2` to `h1` in `frontend/src/components/Pomodoro.jsx`.
*   Added padding to the `CardContent` in `frontend/src/components/Pomodoro.jsx` to provide more space around the timer elements.

### 2. Editable Timer Input

*   Implemented functionality to allow users to set the timer by clicking on the hour or minute sections in `frontend/src/components/Pomodoro.jsx`.
*   Introduced `isEditingMinutes` and `isEditingSeconds` states to control the editing mode.
*   Conditionally renders `TextField` components for input when in editing mode, and `Typography` components for display otherwise.
*   Added `onClick` handlers to `Typography` elements to toggle editing states.
*   Implemented `onChange` and `onBlur` handlers for `TextField`s to update timer states and exit editing mode.
*   Ensured input validation for minutes (0-59) and seconds (0-59).
*   **Fixed two-digit input for minutes and seconds:** Implemented temporary state variables (`editingMinutesValue`, `editingSecondsValue`) to hold raw string input from `TextField`s, allowing users to type two digits before validation. Validation and state updates now occur on `onBlur` events, ensuring correct parsing and clamping of values within the 0-59 range.

### 3. Pie-Shaped Visualization

*   Implemented a pie-shaped timer visualization using SVG within the `Pomodoro` component in `frontend/src/components/Pomodoro.jsx`.
*   Added helper functions (`polarToCartesian`, `describeArc`) to calculate SVG path data for arcs based on time passed and remaining.
*   Positioned the SVG element absolutely behind the time display to create the visual effect.
*   Used a `circle` for the background (remaining time) and a `path` for the elapsed time, with appropriate colors.
*   **Container Sizing and Themed Colors:** Sized up the `Card` container using `minWidth` and `minHeight` properties. Utilized the Material-UI theme's color palette (`theme.palette.primary.main` for passed time and `theme.palette.background.default` for remaining time) for the SVG pie chart elements to ensure consistency with the application's theme.

## Font Change

*   Applied the "Inter" font from Google Fonts to the entire application.
*   Added a `<link>` tag to `frontend/index.html` to import the Inter font with various weights (300, 400, 500, 700).
*   Configured the Material-UI theme in `frontend/src/theme.js` by setting `typography.fontFamily` to `'Inter', sans-serif`.

## Todo Date Input

*   Reverted the `readOnly` property from the `TextField` components within the `DatePicker`'s `renderInput` prop in both `frontend/src/components/TodoForm.jsx` and `frontend/src/components/TodoList.jsx`.
*   This allows users to edit or choose dates as before, with the calendar icon serving as the primary means of date selection.
*   **Removed `autoFocus` from `DatePicker`'s `TextField` in `TodoList.jsx`:** This was done to prevent premature closing of the editing mode for existing todo due dates.
*   **Implemented dedicated Save button for Due Date in `TodoList.jsx`:** Removed `handleSaveClick` from `DatePicker`'s `onChange` and `TextField`'s `onBlur`. Added a separate `IconButton` for saving the due date, which appears only when `editingDueDateTodoId` is active, giving users explicit control over saving.
*   **Fixed DatePicker popover position:** Anchored the `DatePicker` popover to the calendar icon in `frontend/src/components/TodoForm.jsx` and `frontend/src/components/TodoList.jsx` by using `useRef` to get a reference to the `IconButton` and passing it to `PopperProps.anchorEl`.
*   **Fixed DatePicker popover position in `TodoList.jsx` (re-attempt):** Changed `PopperProps.anchorEl` to accept a function `() => datePickerAnchorRefs.current[todo.id]` to ensure the anchor element is available when the popover opens.
*   **Fixed Due Date Not Reflecting Update in `TodoList.jsx`:** Modified `DatePicker`'s `onChange` to pass `newValue` directly to `handleSaveClick`. Adjusted `handleSaveClick` to accept and use this `newValue` for updating the due date, addressing the asynchronous state update issue.

## Layout Rearrangement

*   Modified `frontend/src/App.jsx` to rearrange the main application layout.
*   Moved the `Memo` component to be directly below the `Pomodoro` timer.
*   Restructured the `Grid container` to have two main columns: a left column (`md={4}`) containing `Pomodoro` and `Memo` (stacked vertically), and a right column (`md={8}`) containing `TodoSection`.

## DatePicker Popover Positioning Fix

*   Applied detailed `PopperProps` to the `DatePicker` components in `frontend/src/components/TodoForm.jsx` and `frontend/src/components/TodoList.jsx`.
*   Set `placement: 'bottom-end'` for right-aligned positioning under the icon.
*   Added `modifiers` for `offset` (`[0, 10]`), `flip` (`fallbackPlacements: ['top-end']`), and `preventOverflow` (`boundary: 'viewport', padding: 8`) to ensure proper spacing and prevent clipping.
*   Set `disablePortal: false` and `container: document.body` to ensure the popover is rendered directly to the body, avoiding clipping issues from parent containers with `overflow: hidden` or CSS transforms.

## Memo Container Sizing

*   Adjusted the `Memo` component's container sizing in `frontend/src/App.jsx`.
*   Set `sx={{ flexGrow: 1 }}` on the `Grid item` containing the `Memo` component to make it expand vertically and align its bottom with the bottom of the `TodoSection`'s container.

## Page-wide Scrollbar Removal

*   Disabled the page-wide scrollbar by adding `overflow: hidden` to the `body` style overrides within `MuiCssBaseline` in `frontend/src/theme.js`.
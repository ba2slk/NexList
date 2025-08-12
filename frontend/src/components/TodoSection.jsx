import React, { useState, useEffect, useRef } from 'react';
import { Grid, Box } from '@mui/material';
import TodoList from './TodoList';
import TodoForm from './TodoForm';

function TodoSection({ todos, onTodoDeleted, onTodoToggled, onTodoUpdated, onTodoCreated, appBarRef, todoInputRef }) {
  const todoFormRef = useRef(null);
  const todoListWrapperRef = useRef(null); // Ref for the TodoList's parent Box
  const [todoListMaxHeight, setTodoListMaxHeight] = useState(400); // Initial value

  useEffect(() => {
    const calculateHeights = () => {
      const appBarHeight = appBarRef.current ? appBarRef.current.offsetHeight : 0;
      const containerMt = 32; // sx={{ mt: 4 }} from App.jsx Container
      const todoListBoxPadding = 32; // p: 2 on TodoList's main Box

      // Height of the TodoForm (including its own padding/margin)
      const actualTodoFormHeight = todoFormRef.current ? todoFormRef.current.offsetHeight : 0;

      // Total available height for the content area (excluding AppBar and its top margin)
      const totalContentHeight = window.innerHeight - appBarHeight - containerMt;

      // Remaining height for TodoList (total content height - TodoForm height - TodoList's own padding)
      const calculatedListHeight = totalContentHeight - actualTodoFormHeight - todoListBoxPadding - 16; // Small buffer

      setTodoListMaxHeight(calculatedListHeight > 0 ? calculatedListHeight : 0);
    };

    calculateHeights();
    window.addEventListener('resize', calculateHeights);

    return () => {
      window.removeEventListener('resize', calculateHeights);
    };
  }, [appBarRef]);

  return (
    <Grid item xs={12} sm={6} md={4} container direction="column" justifyContent="flex-start"
      sx={{
        height: '100%', // Ensure Grid item takes full height of its parent (Container)
        position: 'relative', // For absolute positioning of TodoForm
      }}
    >
      <Box
        ref={todoListWrapperRef}
        sx={{
          flexGrow: 1, // Allow TodoList to take available space
          overflow: 'hidden', // Hide overflow from TodoList's internal scroll
          display: 'flex',
          flexDirection: 'column',
          // The glassmorphism styles are now applied via MuiPaper in theme.js
          // The padding is handled by TodoList's internal Box
        }}
      >
        <TodoList
          todos={todos}
          onTodoDeleted={onTodoDeleted}
          onTodoToggled={onTodoToggled}
          onTodoUpdated={onTodoUpdated}
          maxHeight={todoListMaxHeight} // Pass calculated maxHeight to TodoList
        />
      </Box>
      <Box
        ref={todoFormRef}
        sx={{
          position: 'sticky', // Stick to the bottom of the parent Box
          bottom: 0,
          width: '100%', // Ensure it takes full width
          display: 'flex',
          justifyContent: 'center',
          zIndex: 100, // Ensure it's above TodoList
          // Glassmorphism styles are handled by theme.js
        }}
      >
        <TodoForm onTodoCreated={onTodoCreated} ref={todoInputRef} />
      </Box>
    </Grid>
  );
}

export default TodoSection;

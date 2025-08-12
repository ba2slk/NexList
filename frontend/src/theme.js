import { createTheme } from '@mui/material/styles';

export const getAppTheme = (mode) => {
  return createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            // Light mode palette (existing pastel glassmorphism)
            primary: {
              main: '#5E81AC', // Night Owl Light Blue
            },
            secondary: {
              main: '#B48EAD', // Night Owl Light Purple
            },
            background: {
              default: '#FBFBFB', // Night Owl Light very light grey/white
              paper: '#FFFFFF', // Solid white for paper elements
            },
            text: {
              primary: '#3B4252', // Night Owl Light dark grey/blue
              secondary: '#4C566A', // Slightly lighter secondary text
            },
            info: {
              main: '#88C0D0', // Night Owl Light Cyan
            },
            success: {
              main: '#A3BE8C', // Night Owl Light Green
            },
            warning: {
              main: '#D08770', // Night Owl Light Orange
            },
            error: {
              main: '#BF616A', // Night Owl Light Red
            },
          }
        : {
            // Dark mode palette (Night Owl inspired)
            primary: {
              main: '#82AAFF', // Night Owl Blue
            },
            secondary: {
              main: '#c792ea', // Night Owl Purple
            },
            background: {
              default: '#011627', // Night Owl very dark blue/black
              paper: '#0B253A', // Slightly lighter dark background for paper elements
            },
            text: {
              primary: '#d6deeb', // Night Owl light grey/blue
              secondary: '#8f9eaf', // Slightly darker secondary text
            },
            info: {
              main: '#B3E5FC', // Pastel Blue (can be adjusted for dark mode if needed)
            },
            success: {
              main: '#addb67', // Night Owl Green
            },
            warning: {
              main: '#ffcb8b', // Night Owl Orange
            },
            error: {
              main: '#FFCDD2', // Pastel Pink (can be adjusted for dark mode if needed)
            },
          }),
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: mode === 'light' ? '#E0F2F7' : '#011627', // Ensure body background matches theme
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(10px)',
            border: mode === 'light' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            borderRadius: '16px',
            backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(11, 37, 58, 0.7)', // Adjust paper background for dark mode
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            borderRadius: '0px',
          },
        },
      },
      MuiButton: { // Assuming this was intended for MuiButton based on the original content
        styleOverrides: {
          root: {
            transition: 'background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 6px 40px rgba(0, 0, 0, 0.15)',
            },
            '&:active': {
              transform: 'scale(0.95)',
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)', // Adjust input background for dark mode
            '& fieldset': {
              borderColor: mode === 'light' ? 'rgba(255, 255, 255, 0.3) !important' : 'rgba(255, 255, 255, 0.2) !important',
            },
            '&:hover fieldset': {
              borderColor: mode === 'light' ? 'rgba(255, 255, 255, 0.5) !important' : 'rgba(255, 255, 255, 0.3) !important',
            },
            '&.Mui-focused fieldset': {
              borderColor: mode === 'light' ? '#A5D6A7 !important' : '#82AAFF !important', // Primary color on focus
            },
          },
        },
      },
    },
  });
};

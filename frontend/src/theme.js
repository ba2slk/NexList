import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light', // Changed to light mode for pastel glassmorphism
    primary: {
      main: '#A5D6A7', // Pastel Green
    },
    secondary: {
      main: '#FFCDD2', // Pastel Pink
    },
    background: {
      default: '#E0F2F7', // A very light, subtle blue/grey background to make glass stand out
      paper: 'rgba(255, 255, 255, 0.2)', // Transparent white for glass elements
    },
    text: {
      primary: '#424242', // Darker text for readability on light backgrounds
      secondary: '#757575', // Slightly lighter secondary text
    },
    // Adding more pastel colors to the palette for potential use
    info: {
      main: '#B3E5FC', // Pastel Blue
    },
    success: {
      main: '#A5D6A7', // Pastel Green (same as primary for now)
    },
    warning: {
      main: '#FFD180', // Pastel Orange
    },
    error: {
      main: '#FFCDD2', // Pastel Pink (same as secondary for now)
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#E0F2F7', // Ensure body background matches
        },
      },
    },
    // Apply glassmorphism styles to MuiPaper, which is used by Box, Card, etc.
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          borderRadius: '16px', // Slightly larger border radius for glass effect
        },
      },
    },
    MuiAppBar: { // Added MuiAppBar override
      styleOverrides: {
        root: {
          borderRadius: '0px', // Make AppBar unrounded
        },
      },
    },
    MuiAppBar: { // Added MuiAppBar override
      styleOverrides: {
        root: {
          borderRadius: '0px', // Make AppBar unrounded
        },
      },
    },
      styleOverrides: {
        root: {
          transition: 'background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)', // Subtle scale on hover
            boxShadow: '0 6px 40px rgba(0, 0, 0, 0.15)', // More pronounced shadow on hover
          },
          '&:active': {
            transform: 'scale(0.95)', // Subtle press effect
          },
        },
      },
    },
    // Refine TextField and DatePicker input styles
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.1)', // Slightly transparent input background
          '& fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.3) !important', // Subtle border for inputs
          },
          '&:hover fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.5) !important',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#A5D6A7 !important', // Primary color on focus
          },
        },
      },
    },
  },
);

export default theme;

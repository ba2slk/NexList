import { createTheme } from '@mui/material/styles';

export const getAppTheme = (mode) => {
  return createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            primary: { main: '#5E81AC' },
            secondary: { main: '#B48EAD' },
            background: { default: '#FBFBFB', paper: '#FFFFFF' },
            text: { primary: '#3B4252', secondary: '#4C566A' },
            info: { main: '#88C0D0' },
            success: { main: '#A3BE8C' },
            warning: { main: '#D08770' },
            error: { main: '#BF616A' },
          }
        : {
            primary: { main: '#82AAFF' },
            secondary: { main: '#c792ea' },
            background: { default: '#011627', paper: '#0B253A' },
            text: { primary: '#d6deeb', secondary: '#8f9eaf' },
            info: { main: '#B3E5FC' },
            success: { main: '#addb67' },
            warning: { main: '#ffcb8b' },
            error: { main: '#FFCDD2' },
          }),
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: mode === 'light' ? '#E0F2F7' : '#011627',
            overflow: 'hidden', // Disable page-wide scrollbar
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            position: 'relative',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: mode === 'light'
              ? '1px solid rgba(255, 255, 255, 0.3)'
              : '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            borderRadius: '16px',
            backgroundColor:
              mode === 'light'
                ? 'rgba(255, 255, 255, 0.2)'
                : 'rgba(11, 37, 58, 0.7)',
            
            // 🔹 얇은 유리 질감 노이즈
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              pointerEvents: 'none',
              opacity: 0.12,
              backgroundImage: `url("data:image/svg+xml;utf8,
                <svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'>
                  <filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/></filter>
                  <rect width='100%' height='100%' filter='url(%23n)'/>
                </svg>")`,
              backgroundRepeat: 'repeat',
              backgroundSize: '200px 200px',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: { borderRadius: 0 },
        },
      },
      MuiButton: {
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
            backgroundColor: mode === 'light'
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(255, 255, 255, 0.05)',
            '& fieldset': {
              borderColor: mode === 'light'
                ? 'rgba(255, 255, 255, 0.3) !important'
                : 'rgba(255, 255, 255, 0.2) !important',
            },
            '&:hover fieldset': {
              borderColor: mode === 'light'
                ? 'rgba(255, 255, 255, 0.5) !important'
                : 'rgba(255, 255, 255, 0.3) !important',
            },
            '&.Mui-focused fieldset': {
              borderColor: mode === 'light'
                ? '#A5D6A7 !important'
                : '#82AAFF !important',
            },
          },
        },
      },
    },
  });
};

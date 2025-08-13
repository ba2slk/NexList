// theme.js
import { createTheme, alpha } from '@mui/material/styles';

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
          // 전역 트랜지션: 색/배경/보더/그림자/필터
          '*, *::before, *::after': {
            transition:
              'background-color 220ms ease, color 220ms ease, border-color 220ms ease, box-shadow 220ms ease, filter 220ms ease',
          },

          // 모션 축소 환경 존중
          '@media (prefers-reduced-motion: reduce)': {
            '*, *::before, *::after': { transition: 'none !important' },
            body: { transition: 'none !important' },
            'body::after': { animation: 'none !important' },
          },

          // 부드러운 전환 + 크로스페이드 오버레이
          body: {
            backgroundColor: mode === 'light' ? '#E0F2F7' : '#011627',
            scrollbarGutter: 'stable both-edges',
            overflow: 'hidden',
            transition: 'background-color 220ms ease',
            // 현재 배경값을 CSS 변수로 노출(오버레이 색에 사용)
            '--bg-now': mode === 'light' ? '#E0F2F7' : '#011627',
          },

          // 짧은 페이드 아웃 오버레이: 모드가 바뀔 때 animation-name이 바뀌어 항상 재생됨
          'body::after': {
            content: '""',
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            background: 'var(--bg-now)',
            opacity: 0,
            willChange: 'opacity',
            zIndex: 2147483647, // 제일 위
            animation: `${mode === 'light' ? 'themeFadeLight' : 'themeFadeDark'} 260ms ease`,
          },

          // 라이트/다크 각각 별도 이름으로 정의(이름이 바뀌면 항상 재생)
          '@keyframes themeFadeLight': {
            from: { opacity: 0.10 },
            to: { opacity: 0 },
          },
          '@keyframes themeFadeDark': {
            from: { opacity: 0.10 },
            to: { opacity: 0 },
          },
        },
      },

      // 트랜지션 추가
      MuiPaper: {
        styleOverrides: {
          root: {
            position: 'relative',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border:
              mode === 'light'
                ? '1px solid rgba(255, 255, 255, 0.3)'
                : '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            borderRadius: '16px',
            backgroundColor:
              mode === 'light'
                ? 'rgba(255, 255, 255, 0.2)'
                : 'rgba(11, 37, 58, 0.7)',

            // 전환 부드럽게
            transition:
              'background-color 220ms ease, border-color 220ms ease, box-shadow 220ms ease, backdrop-filter 220ms ease',

            // 얇은 유리 질감 노이즈
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

            // glow 효과 (배너 등에서 no-glow로 끌 수 있음)
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              pointerEvents: 'none',
              background:
                'radial-gradient(120% 60% at 20% 0%, rgba(255,255,255,0.08), rgba(255,255,255,0.04) 40%, transparent 70%)',
              mixBlendMode: 'screen',
            },
            '&.no-glow::after': {
              display: 'none',
            },
          },
        },
      },

      MuiAppBar: { styleOverrides: { root: { borderRadius: 0 } } },

      // 버튼은 기존 hover/active 유지 + 색 전환만 더 매끄럽게
      MuiButton: {
        styleOverrides: {
          root: {
            transition:
              'background-color .3s ease, color .3s ease, border-color .3s ease, box-shadow .3s ease, transform .3s ease',
            '&:hover': { transform: 'scale(1.05)', boxShadow: '0 8px 26px rgba(0,0,0,0.12)' },
            '&:active': { transform: 'scale(0.96)' },
          },
        },
      },

      // 입력 필드도 색/보더 전환 부드럽게(기존 색상 유지)
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor:
              mode === 'light'
                ? 'rgba(255,255,255,0.24)'
                : 'rgba(255,255,255,0.06)',
            transition: 'background-color 220ms ease, border-color 220ms ease',
            '& fieldset': {
              borderColor:
                mode === 'light'
                  ? 'rgba(255,255,255,0.45) !important'
                  : 'rgba(255,255,255,0.18) !important',
              transition: 'border-color 220ms ease',
            },
            '&:hover fieldset': {
              borderColor:
                mode === 'light'
                  ? 'rgba(255,255,255,0.65) !important'
                  : 'rgba(255,255,255,0.30) !important',
            },
            '&.Mui-focused fieldset': {
              borderColor: mode === 'light' ? '#A5D6A7 !important' : '#82AAFF !important',
            },
          },
        },
      },
    },
  });
};

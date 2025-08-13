import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, Typography, Button, Grid, TextField, Box } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';

const DIAL_SIZE = 260;

// ------- SVG utils -------
function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
function describeSector(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
  return ['M', cx, cy, 'L', start.x, start.y, 'A', r, r, 0, largeArc, 1, end.x, end.y, 'Z'].join(' ');
}

function Pomodoro() {
  const theme = useTheme();

  // 공통 글래스/광원 값 (다른 카드들과 동일 규칙)
  const surfaceBg = theme.palette.mode === 'dark'
    ? 'rgba(255,255,255,0.06)'
    : 'rgba(255,255,255,0.45)';

  const glowColor = theme.palette.mode === 'dark'
    ? 'rgba(255,255,255,0.12)'
    : 'rgba(255,255,255,0.35)';

  const dialBg = theme.palette.mode === 'dark'
    ? alpha('#FFFFFF', 0.06)
    : alpha('#FFFFFF', 0.85);

  // 목표/남은 시간
  const [targetMinutes, setTargetMinutes] = useState(25);
  const [targetSeconds, setTargetSeconds] = useState(0);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);

  const [isActive, setIsActive] = useState(false);
  const [isEditingMinutes, setIsEditingMinutes] = useState(false);
  const [isEditingSeconds, setIsEditingSeconds] = useState(false);
  const [editingMinutesValue, setEditingMinutesValue] = useState('');
  const [editingSecondsValue, setEditingSecondsValue] = useState('');

  const timerRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;
    timerRef.current = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 59));
      setMinutes((m) => {
        if (seconds > 0) return m;
        if (m > 0) return m - 1;
        clearInterval(timerRef.current);
        setIsActive(false);
        return 0;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isActive, seconds]);

  const toggle = () => setIsActive((v) => !v);
  const reset = () => {
    setMinutes(targetMinutes);
    setSeconds(targetSeconds);
    setIsActive(false);
  };

  const handleMinutesClick = () => {
    setIsEditingMinutes(true);
    setEditingMinutesValue(minutes.toString().padStart(2, '0'));
  };
  const handleSecondsClick = () => {
    setIsEditingSeconds(true);
    setEditingSecondsValue(seconds.toString().padStart(2, '0'));
  };
  const handleMinutesBlur = () => {
    let v = parseInt(editingMinutesValue, 10);
    if (isNaN(v) || v < 0 || v > 59) v = targetMinutes;
    setMinutes(v);
    setTargetMinutes(v);
    setIsEditingMinutes(false);
  };
  const handleSecondsBlur = () => {
    let v = parseInt(editingSecondsValue, 10);
    if (isNaN(v) || v < 0 || v > 59) v = targetSeconds;
    setSeconds(v);
    setTargetSeconds(v);
    setIsEditingSeconds(false);
  };

  // 진행도
  let total = targetMinutes * 60 + targetSeconds;
  if (total <= 0) total = 1;
  const remaining = minutes * 60 + seconds;
  const elapsed = Math.min(total, Math.max(0, total - remaining));
  const angle = (elapsed / total) * 360;

  return (
    <Card
      sx={{
        minWidth: 320,
        minHeight: 440,
        position: 'relative',
        overflow: 'hidden',        // ← 광원이 카드 밖으로 번지지 않도록
        borderRadius: 2,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        backgroundColor: surfaceBg, // ← 카드 표면 투명도 통일
        boxShadow:
          theme.palette.mode === 'dark'
            ? '0 10px 30px rgba(0,0,0,0.12)'
            : '0 10px 30px rgba(0,0,0,0.04)',
        // ★ 광원: 카드마다 1회, 좌상단 고정. 모든 카드 동일 값 사용
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `radial-gradient(
            700px 380px at 12% 0%,
            ${glowColor},
            transparent 60%
          )`,
          // z-index는 내용 뒤(=배경 위)로, but 카드 내부에만 존재
          zIndex: 0,
        },
      }}
    >
      <Typography
        variant="h5"
        align="center"
        sx={{ pt: 2, letterSpacing: '0.5px', position: 'relative', zIndex: 1 }}
      >
        Pomodoro Timer
      </Typography>

      <CardContent
        sx={{
          p: 4,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1, // 내용을 광원 위로
        }}
      >
        {/* Dial */}
        <Box sx={{ position: 'relative', width: DIAL_SIZE, height: DIAL_SIZE }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            <circle cx="50" cy="50" r="45" fill={dialBg} />
            {elapsed > 0 && angle < 360 && (
              <path d={describeSector(50, 50, 45, 0, angle)} fill={theme.palette.primary.main} />
            )}
            {elapsed >= total && <circle cx="50" cy="50" r="45" fill={theme.palette.primary.main} />}
          </svg>

          {/* 중앙 시간 표시 */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, pointerEvents: 'auto' }}>
              {isEditingMinutes ? (
                <TextField
                  value={editingMinutesValue}
                  onChange={(e) => setEditingMinutesValue(e.target.value)}
                  onBlur={handleMinutesBlur}
                  type="number"
                  inputProps={{ style: { fontSize: '3rem', textAlign: 'center', padding: 0 } }}
                  sx={{ width: 120 }}
                  autoFocus
                />
              ) : (
                <Typography variant="h3" onClick={handleMinutesClick} sx={{ cursor: 'pointer' }}>
                  {minutes.toString().padStart(2, '0')}
                </Typography>
              )}
              <Typography variant="h3">:</Typography>
              {isEditingSeconds ? (
                <TextField
                  value={editingSecondsValue}
                  onChange={(e) => setEditingSecondsValue(e.target.value)}
                  onBlur={handleSecondsBlur}
                  type="number"
                  inputProps={{ style: { fontSize: '3rem', textAlign: 'center', padding: 0 } }}
                  sx={{ width: 120 }}
                  autoFocus
                />
              ) : (
                <Typography variant="h3" onClick={handleSecondsClick} sx={{ cursor: 'pointer' }}>
                  {seconds.toString().padStart(2, '0')}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Grid container spacing={2} justifyContent="center" sx={{ mt: 3, mb: 1 }}>
          <Grid item>
            <Button variant="contained" color="primary" onClick={toggle}>
              {isActive ? 'Pause' : 'Start'}
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="secondary" onClick={reset}>
              Reset
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default Pomodoro;

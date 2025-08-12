import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, Typography, Button, Grid, TextField, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const DIAL_SIZE = 260; // 파이 크기(px) — 필요시 조정

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeSector(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end   = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
  return ['M', cx, cy, 'L', start.x, start.y, 'A', r, r, 0, largeArc, 1, end.x, end.y, 'Z'].join(' ');
}

function Pomodoro() {
  const theme = useTheme();

  // 목표(세그먼트 기준) 시간
  const [targetMinutes, setTargetMinutes] = useState(25);
  const [targetSeconds, setTargetSeconds] = useState(0);

  // 남은 시간
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
      setSeconds((s) => {
        if (s > 0) return s - 1;
        // s == 0
        return 59;
      });
      setMinutes((m) => {
        // 이전 setSeconds가 아직 반영 전이므로 seconds 값으로 분 감소 판단
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
  const reset = () => { setMinutes(targetMinutes); setSeconds(targetSeconds); setIsActive(false); };

  const handleMinutesClick = () => { setIsEditingMinutes(true); setEditingMinutesValue(minutes.toString().padStart(2,'0')); };
  const handleSecondsClick = () => { setIsEditingSeconds(true); setEditingSecondsValue(seconds.toString().padStart(2,'0')); };

  const handleMinutesBlur = () => {
    let v = parseInt(editingMinutesValue, 10);
    if (isNaN(v) || v < 0 || v > 59) v = targetMinutes;
    setMinutes(v); setTargetMinutes(v); setIsEditingMinutes(false);
  };
  const handleSecondsBlur = () => {
    let v = parseInt(editingSecondsValue, 10);
    if (isNaN(v) || v < 0 || v > 59) v = targetSeconds;
    setSeconds(v); setTargetSeconds(v); setIsEditingSeconds(false);
  };

  // 게이지 진행(사용자 설정값 기준)
  let total = targetMinutes * 60 + targetSeconds;
  if (total <= 0) total = 1;
  const remaining = minutes * 60 + seconds;
  const elapsed = Math.min(total, Math.max(0, total - remaining));
  const angle = (elapsed / total) * 360;

  return (
    <Card sx={{ minWidth: 320, minHeight: 440 }}>
      <Typography
        variant="h5"
        align="center"
        sx={{
          pt: 2, // padding-top: theme.spacing(2) → 기본 16px
          letterSpacing: '0.5px',
        }}
      >Pomodoro Timer</Typography>
      <CardContent
        sx={{
          p: 4,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* 다이얼 컨테이너: 고정 크기 */}
        <Box sx={{ position: 'relative', width: DIAL_SIZE, height: DIAL_SIZE }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            {/* 배경 원 */}
            <circle cx="50" cy="50" r="45" fill={theme.palette.background.paper} />
            {/* 진행 부채꼴 (시계 방향) */}
            {elapsed > 0 && angle < 360 && (
              <path d={describeSector(50, 50, 45, 0, angle)} fill={theme.palette.primary.main} />
            )}
            {elapsed >= total && <circle cx="50" cy="50" r="45" fill={theme.palette.primary.main} />}
          </svg>

          {/* 중앙 시간 표시 (다이얼 위 오버레이) */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none', // 버튼 클릭 영역 간섭 방지
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

        {/* 스페이서: 버튼을 아래로 밀기 */}
        <Box sx={{ flexGrow: 1 }} />

        {/* 버튼: 아래쪽에 배치 */}
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

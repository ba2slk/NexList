import React, { useState, useLayoutEffect, useRef } from 'react';
import { Grid, Box, Typography } from '@mui/material';
import TodoList from './TodoList';
import TodoForm from './TodoForm';

function TodoSection({
  todos,
  onTodoDeleted,
  onTodoToggled,
  onTodoUpdated,
  onTodoCreated,
  appBarRef,
  todoInputRef,
}) {
  const listWrapperRef = useRef(null);
  const formOuterRef  = useRef(null);

  const [listMaxHeight, setListMaxHeight] = useState(400);
  const [formHeight, setFormHeight] = useState(0);
  const [sbw, setSbw] = useState(0);
  const [lockedWidth, setLockedWidth] = useState(null);

  const isEmpty = !todos || todos.length === 0;

  const SAFE_GAP = 24;   // 리스트와 폼 사이 최소 시각 간격
  const STICKY_GAP = 16; // 화면 하단에서 띄우는 값

  const measure = () => {
    // 1) 스크롤바 폭
    const w = window.innerWidth - document.documentElement.clientWidth;
    setSbw(w > 0 ? w : 0);

    // 2) 리스트 래퍼 폭: 처음 한 번 고정
    const lw = listWrapperRef.current?.offsetWidth ?? 0;
    if (!lockedWidth && lw) setLockedWidth(lw);

    // 3) 폼 "실" 높이 (내부 Box 기준) + sticky 여백 포함
    const innerFormEl = formOuterRef.current?.firstElementChild;
    const formContentH = innerFormEl ? innerFormEl.getBoundingClientRect().height : 0;
    setFormHeight(formContentH + STICKY_GAP);

    // 4) 리스트 최대 높이
    const appBarH = appBarRef?.current ? appBarRef.current.offsetHeight : 0;
    const containerMt = 32;     // Container sx={{ mt: 4 }}
    const listCardPadding = 32; // TodoList 카드 p:2 의 상하 합
    const total = window.innerHeight - appBarH - containerMt;
    const available = total - (formContentH + STICKY_GAP) - listCardPadding;
    setListMaxHeight(Math.max(0, available));
  };

  // 레이아웃이 그려진 "직후"에 측정 + 한 프레임 지연으로 값 안정화
  useLayoutEffect(() => {
    const run = () => {
      measure();
      requestAnimationFrame(measure);
    };
    run();

    window.addEventListener('resize', run);
    window.addEventListener('scroll', run, { passive: true });

    const ro = 'ResizeObserver' in window ? new ResizeObserver(run) : null;
    if (ro) {
      if (listWrapperRef.current) ro.observe(listWrapperRef.current);
      if (formOuterRef.current) ro.observe(formOuterRef.current);
    }
    return () => {
      window.removeEventListener('resize', run);
      window.removeEventListener('scroll', run);
      ro?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appBarRef]);

  return (
    <Grid
      item
      xs={12}
      sm={6}
      md={4}
      container
      direction="column"
      justifyContent="flex-start"
      sx={{ position: 'relative', height: '100%' }}
    >
      {/* 리스트 영역 */}
      <Box
        ref={listWrapperRef}
        sx={{
          flexGrow: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          // 폼 높이 + 추가 간격 + iOS 안전영역
          pb: `calc(${formHeight}px + ${SAFE_GAP}px + env(safe-area-inset-bottom, 0px))`,
          zIndex: 1,
        }}
      >
        {isEmpty && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            <Typography
              aria-live="polite"
              sx={{
                fontWeight: 600,
                letterSpacing: 0.5,
                color: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'rgba(60,72,90,0.15)'
                    : 'rgba(214,222,235,0.12)',
                fontSize: { xs: '24px', sm: '28px', md: '32px' },
                textAlign: 'center',
              }}
            >
              할 일이 없습니다.
            </Typography>
          </Box>
        )}

        <TodoList
          todos={todos}
          onTodoDeleted={onTodoDeleted}
          onTodoToggled={onTodoToggled}
          onTodoUpdated={onTodoUpdated}
          maxHeight={listMaxHeight}
        />

        {/* 추가 안전 간격 (그림자/광원 여유) */}
        <Box sx={{ height: `${SAFE_GAP}px`, flex: '0 0 auto' }} />
      </Box>

      {/* 하단 입력 폼 */}
      <Box
        ref={formOuterRef}
        sx={{
          position: 'sticky',
          bottom: STICKY_GAP,
          // 🔑 항상 최소 간격 확보 — 측정 실패해도 붙지 않게
          mt: `${SAFE_GAP}px`,
          display: 'flex',
          justifyContent: 'center',
          zIndex: 10,
          px: `${sbw / 2}px`,       // 스크롤바 대칭 보정
          width: '100%',
          pointerEvents: 'none',    // 래퍼는 통과
        }}
      >
        <Box
          sx={{
            width: lockedWidth ? `${lockedWidth}px` : '100%',
            pointerEvents: 'auto',  // 실제 폼만 상호작용
          }}
        >
          <TodoForm onTodoCreated={onTodoCreated} ref={todoInputRef} />
        </Box>
      </Box>
    </Grid>
  );
}

export default TodoSection;

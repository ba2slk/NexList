import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, TextField, Button, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { getMemo, createMemo, updateMemo } from '../api';

function Memo() {
  const theme = useTheme();
  const [memo, setMemo] = useState({ content: '' });
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    const fetchMemo = async () => {
      try {
        const memoData = await getMemo();
        setMemo(memoData);
        setSavedAt(memoData.updated_at);
      } catch (error) {
        if (error.message.includes('404')) {
          try {
            const newMemo = await createMemo({ content: '' });
            setMemo(newMemo);
            setSavedAt(newMemo.updated_at);
          } catch (createError) {
            console.error('Failed to create memo:', createError);
          }
        } else {
          console.error('Failed to fetch memo:', error);
        }
      }
    };
    fetchMemo();
  }, []);

  const handleSave = async () => {
    try {
      const updatedMemo = await updateMemo({ content: memo.content });
      setSavedAt(updatedMemo.updated_at);
    } catch (error) {
      console.error('Failed to save memo:', error);
    }
  };

  // 공통 카드 표면/광원 값
  const surfaceBg = theme.palette.mode === 'dark'
    ? 'rgba(255,255,255,0.06)'
    : 'rgba(255,255,255,0.45)';

  const glowColor = theme.palette.mode === 'dark'
    ? 'rgba(255,255,255,0.12)'
    : 'rgba(255,255,255,0.35)';

  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 2,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        backgroundColor: surfaceBg,
        boxShadow:
          theme.palette.mode === 'dark'
            ? '0 10px 30px rgba(0,0,0,0.12)'
            : '0 10px 30px rgba(0,0,0,0.04)',
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
          zIndex: 0,
        },
      }}
    >
      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        <Typography variant="h6" align="center">Memo</Typography>
        <TextField
          multiline
          rows={6}
          fullWidth
          variant="outlined"
          value={memo.content}
          onChange={(e) => setMemo({ ...memo, content: e.target.value })}
          sx={{ mb: 1 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="caption">
            {savedAt ? `Saved at: ${new Date(savedAt).toLocaleString()}` : ''}
          </Typography>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default Memo;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, TextField, Button } from '@mui/material';

function Memo() {
  const [memo, setMemo] = useState('');

  useEffect(() => {
    // Load memo from localStorage on component mount
    const savedMemo = localStorage.getItem('memoContent');
    if (savedMemo) {
      setMemo(savedMemo);
    }
  }, []);

  const handleSave = () => {
    // Save memo to localStorage
    localStorage.setItem('memoContent', memo);
    alert('Memo saved!'); // Simple feedback
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" align="center">Memo</Typography>
        <TextField
          multiline
          rows={15} // Increased rows for taller memo
          fullWidth
          variant="outlined"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          sx={{ mb: 2 }} // Add margin bottom for the button
        />
        <Button variant="contained" color="primary" onClick={handleSave}>
          Save Memo
        </Button>
      </CardContent>
    </Card>
  );
}

export default Memo;

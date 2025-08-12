import React, { useState } from 'react';
import { Card, CardContent, Typography, TextField } from '@mui/material';

function Memo() {
  const [memo, setMemo] = useState('');

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" align="center">Memo</Typography>
        <TextField
          multiline
          rows={10}
          fullWidth
          variant="outlined"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </CardContent>
    </Card>
  );
}

export default Memo;

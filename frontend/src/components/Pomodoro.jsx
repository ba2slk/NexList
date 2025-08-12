import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, Grid } from '@mui/material';

function Pomodoro() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          // Timer finished
          setIsActive(false);
        }
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, minutes]);

  const toggle = () => {
    setIsActive(!isActive);
  };

  const reset = () => {
    setMinutes(25);
    setSeconds(0);
    setIsActive(false);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" align="center">Pomodoro Timer</Typography>
        <Typography variant="h2" align="center">
          {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </Typography>
        <Grid container spacing={2} justifyContent="center">
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

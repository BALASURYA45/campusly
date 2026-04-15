import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
  Chip,
  Alert,
} from '@mui/material';
import API from '../utils/api';

const pad2 = (n) => String(n).padStart(2, '0');

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${pad2(m)}:${pad2(s)}`;
};

const StudyHub = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('pomodoro'); // pomodoro | deep | custom
  const [customMinutes, setCustomMinutes] = useState(30);
  const [weeklyGoalMinutes, setWeeklyGoalMinutes] = useState(300);
  const [message, setMessage] = useState('');

  const defaultMinutes = useMemo(() => {
    if (mode === 'pomodoro') return 25;
    if (mode === 'deep') return 50;
    return customMinutes;
  }, [mode, customMinutes]);

  const [secondsLeft, setSecondsLeft] = useState(defaultMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const startedAtRef = useRef(null);
  const tickRef = useRef(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/study/me/summary');
      setSummary(data.data);
      setWeeklyGoalMinutes(data.data.weeklyGoalMinutes || 300);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    setSecondsLeft(defaultMinutes * 60);
  }, [defaultMinutes]);

  useEffect(() => {
    if (!isRunning) return;
    tickRef.current = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) return;
    if (secondsLeft !== 0) return;
    // auto-complete session
    setIsRunning(false);
    completeSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, isRunning]);

  const start = () => {
    setMessage('');
    startedAtRef.current = new Date();
    setIsRunning(true);
  };

  const pause = () => {
    setIsRunning(false);
  };

  const reset = () => {
    setIsRunning(false);
    startedAtRef.current = null;
    setSecondsLeft(defaultMinutes * 60);
  };

  const completeSession = async () => {
    try {
      const totalMinutes = defaultMinutes;
      const startedAt = startedAtRef.current;
      const endedAt = new Date();
      await API.post('/study/me/sessions', {
        durationMinutes: totalMinutes,
        mode,
        startedAt,
        endedAt,
      });
      setMessage(`Logged ${totalMinutes} minutes. Nice work.`);
      startedAtRef.current = null;
      setSecondsLeft(defaultMinutes * 60);
      await fetchSummary();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to log session');
    }
  };

  const saveGoal = async () => {
    try {
      setMessage('');
      await API.put('/study/me/goal', { weeklyGoalMinutes: Number(weeklyGoalMinutes) });
      setMessage('Weekly goal updated.');
      await fetchSummary();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update goal');
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h5">Loading Study Hub...</Typography>
      </Container>
    );
  }

  const progressPercent = summary?.progressPercent ?? 0;
  const minutesThisWeek = summary?.minutesThisWeek ?? 0;
  const goal = summary?.weeklyGoalMinutes ?? weeklyGoalMinutes;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={900}>Study Hub</Typography>
        <Typography variant="body2" color="text.secondary">
          Focus timer, streaks, and weekly goals. Sessions are tracked in your account.
        </Typography>
      </Stack>

      {message && <Alert severity="info" sx={{ mb: 2 }}>{message}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={800}>Focus Timer</Typography>
                <Box sx={{ flex: 1 }} />
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip label="Pomodoro 25" color={mode === 'pomodoro' ? 'primary' : 'default'} onClick={() => setMode('pomodoro')} />
                  <Chip label="Deep 50" color={mode === 'deep' ? 'primary' : 'default'} onClick={() => setMode('deep')} />
                  <Chip label="Custom" color={mode === 'custom' ? 'primary' : 'default'} onClick={() => setMode('custom')} />
                </Stack>
              </Stack>

              {mode === 'custom' && (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
                  <TextField
                    label="Minutes"
                    type="number"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(Math.max(5, Number(e.target.value)))}
                    inputProps={{ min: 5, max: 180 }}
                    sx={{ width: 160 }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                    Custom sessions are logged as the chosen minutes when completed.
                  </Typography>
                </Stack>
              )}

              <Paper sx={{ p: 3, borderRadius: 4, bgcolor: '#0b1220', color: '#e5e7eb' }}>
                <Typography variant="overline" sx={{ opacity: 0.7 }}>Time Remaining</Typography>
                <Typography variant="h2" fontWeight={900} sx={{ letterSpacing: 1 }}>
                  {formatTime(secondsLeft)}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.round(((defaultMinutes * 60 - secondsLeft) / (defaultMinutes * 60)) * 100)}
                  sx={{ mt: 2, height: 10, borderRadius: 999, bgcolor: 'rgba(255,255,255,0.12)', '& .MuiLinearProgress-bar': { bgcolor: '#22c55e' } }}
                />

                <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
                  {!isRunning ? (
                    <Button variant="contained" onClick={start} sx={{ bgcolor: '#22c55e', color: '#081018', '&:hover': { bgcolor: '#16a34a' } }}>
                      Start
                    </Button>
                  ) : (
                    <Button variant="outlined" onClick={pause} sx={{ borderColor: 'rgba(255,255,255,0.4)', color: '#e5e7eb' }}>
                      Pause
                    </Button>
                  )}
                  <Button variant="outlined" onClick={reset} sx={{ borderColor: 'rgba(255,255,255,0.2)', color: '#e5e7eb' }}>
                    Reset
                  </Button>
                  <Button variant="text" onClick={completeSession} disabled={secondsLeft === defaultMinutes * 60} sx={{ color: '#93c5fd' }}>
                    Log Now
                  </Button>
                </Stack>
              </Paper>

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                “Log Now” lets you record a finished session even if you didn’t run the full timer.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Stack spacing={2}>
            <Card sx={{ borderRadius: 4 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>Streak</Typography>
                <Typography variant="h3" fontWeight={900}>{summary?.streakDays ?? 0} days</Typography>
                <Typography variant="body2" color="text.secondary">
                  Count of consecutive days with at least one study session.
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 4 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>Weekly Goal</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {minutesThisWeek} / {goal} minutes ({progressPercent}%)
                </Typography>
                <LinearProgress variant="determinate" value={progressPercent} sx={{ height: 10, borderRadius: 999 }} />
                <Divider sx={{ my: 2 }} />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
                  <TextField
                    label="Weekly Goal (minutes)"
                    type="number"
                    value={weeklyGoalMinutes}
                    onChange={(e) => setWeeklyGoalMinutes(Math.max(30, Number(e.target.value)))}
                    inputProps={{ min: 30, max: 10080 }}
                    sx={{ flex: 1 }}
                  />
                  <Button variant="contained" onClick={saveGoal}>Save</Button>
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 4 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>Recent Sessions</Typography>
                {(summary?.sessionsThisWeek || []).length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No sessions logged this week yet.</Typography>
                ) : (
                  <Stack spacing={1}>
                    {summary.sessionsThisWeek.slice().reverse().map((s) => (
                      <Paper key={s._id} sx={{ p: 1.5, borderRadius: 3, bgcolor: '#f8fafc' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle2" fontWeight={800}>
                            {s.durationMinutes} min
                          </Typography>
                          <Chip size="small" label={s.mode} />
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(s.createdAt).toLocaleString()}
                        </Typography>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};

export default StudyHub;


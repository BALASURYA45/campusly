import React, { useState, useEffect, useMemo } from 'react';
import { Container, Typography, Paper, Button, TextField, Box, Chip, Divider, Alert, Tabs, Tab, Grid, Stack, CircularProgress } from '@mui/material';
import API from '../utils/api';
import { useSelector } from 'react-redux';

const StudentAssignmentView = () => {
  const [assignments, setAssignments] = useState([]);
  const [submissionUrl, setSubmissionUrl] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [filter, setFilter] = useState('All');
  const [reminderMsg, setReminderMsg] = useState('');
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchAssignments();
  }, [user]);

  const fetchAssignments = async () => {
    if (!user) return;
    try {
      const { data: asgnRes } = await API.get('/assignments/me/planner');
      setAssignments(asgnRes.data || []);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const runReminders = async () => {
    try {
      setReminderMsg('');
      const { data } = await API.post('/assignments/me/reminders/run?windowHours=24');
      const created = data?.data?.created ?? 0;
      setReminderMsg(created > 0 ? `Created ${created} reminder(s) for due-soon assignments.` : 'No new reminders needed right now.');
    } catch (err) {
      setReminderMsg(err.response?.data?.message || 'Failed to create reminders');
    }
  };

  const handleUrlChange = (id, val) => setSubmissionUrl({ ...submissionUrl, [id]: val });

  const handleSubmit = async (id) => {
    if (!submissionUrl[id]) return alert('Please provide a submission link');
    try {
      await API.post(`/assignments/${id}/submit`, { fileUrl: submissionUrl[id] });
      alert('Assignment submitted successfully!');
      fetchAssignments(); // Refresh to show submitted state
    } catch (err) {
      alert('Error submitting assignment');
    }
  };

  const getSubmissionStatus = (assignment) => {
    return assignment?.planner || null;
  };

  const filtered = useMemo(() => {
    const now = new Date();
    return (assignments || []).filter((a) => {
      const p = a.planner;
      const due = new Date(a.dueDate);
      if (!p) return true;
      if (filter === 'Pending') return !p.isSubmitted && due >= now;
      if (filter === 'Overdue') return !p.isSubmitted && due < now;
      if (filter === 'Submitted') return p.isSubmitted;
      return true;
    });
  }, [assignments, filter]);

  const groupedByDay = useMemo(() => {
    const map = new Map();
    for (const a of filtered) {
      const key = new Date(a.dueDate).toLocaleDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(a);
    }
    return Array.from(map.entries()).sort((a, b) => new Date(a[0]) - new Date(b[0]));
  }, [filtered]);

  const riskColor = (risk) => {
    if (risk === 'Overdue') return 'error';
    if (risk === 'Critical') return 'error';
    if (risk === 'High') return 'warning';
    if (risk === 'Medium') return 'info';
    if (risk === 'Safe') return 'success';
    if (risk === 'Late Submission') return 'warning';
    return 'default';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4">My Assignments</Typography>
        <Button variant="outlined" onClick={runReminders}>Create Due-Soon Reminders (24h)</Button>
      </Stack>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Planner" />
        <Tab label="Submit & Feedback" />
      </Tabs>

      {reminderMsg && <Alert severity="info" sx={{ mb: 2 }}>{reminderMsg}</Alert>}

      {tab === 0 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
            <Typography variant="subtitle1" fontWeight={700}>Filter</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {['All', 'Pending', 'Overdue', 'Submitted'].map((k) => (
                <Chip key={k} label={k} onClick={() => setFilter(k)} color={filter === k ? 'primary' : 'default'} />
              ))}
            </Stack>
            <Box sx={{ flex: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Tip: open this page daily; reminders will appear in-app.
            </Typography>
          </Stack>
        </Paper>
      )}
      
      {assignments.length === 0 && (
        <Alert severity="info">No assignments found for your class.</Alert>
      )}

      {tab === 0 && groupedByDay.map(([day, items]) => (
        <Box key={day} sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>{day}</Typography>
          <Grid container spacing={2}>
            {items.map((assignment) => {
              const p = getSubmissionStatus(assignment);
              return (
                <Grid item xs={12} md={6} key={assignment._id}>
                  <Paper sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={800}>{assignment.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {assignment.subject?.name || 'Subject'} | {assignment.class?.name || 'Class'}
                        </Typography>
                        {assignment.description && (
                          <Typography variant="body2" sx={{ mt: 1 }}>{assignment.description}</Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          Due: {new Date(assignment.dueDate).toLocaleString()} | Days left: {p?.daysLeft ?? '-'}
                        </Typography>
                      </Box>
                      <Stack spacing={1} alignItems="flex-end">
                        <Chip label={p?.submissionStatus || 'Unknown'} color={p?.isSubmitted ? 'success' : 'warning'} />
                        <Chip label={p?.risk || 'Low'} color={riskColor(p?.risk)} size="small" />
                      </Stack>
                    </Stack>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      ))}

      {tab === 1 && assignments.map((assignment) => {
        const submission = getSubmissionStatus(assignment);
        const isPastDue = new Date(assignment.dueDate) < new Date();
        const my = assignment.mySubmission;

        return (
          <Paper key={assignment._id} sx={{ p: 3, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h6">{assignment.title}</Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Subject: {assignment.subject?.name} | Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>{assignment.description}</Typography>
              </Box>
              <Box>
                {submission ? (
                  <Chip 
                    label={submission.grade ? `Graded: ${submission.grade}` : (submission.isLate ? 'Late Submitted' : "Submitted")} 
                    color={submission.grade ? "success" : "primary"}
                  />
                ) : (
                  <Chip 
                    label={isPastDue ? "Overdue" : "Pending"} 
                    color={isPastDue ? "error" : "warning"} 
                  />
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {my ? (
              <Box>
                <Typography variant="subtitle2" color="primary">Your Submission:</Typography>
                {my.submittedAt && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Submitted at: {new Date(my.submittedAt).toLocaleString()}
                  </Typography>
                )}
                {my.fileUrl && (
                  <Typography variant="body2" component="a" href={my.fileUrl} target="_blank" rel="noopener noreferrer">
                    View submission
                  </Typography>
                )}
                {my.feedback && (
                  <Box sx={{ mt: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="caption" color="textSecondary">Teacher Feedback:</Typography>
                    <Typography variant="body2">{my.feedback}</Typography>
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField 
                  size="small" 
                  placeholder="Link to your work (e.g., Google Drive, GitHub)" 
                  fullWidth 
                  value={submissionUrl[assignment._id] || ''} 
                  onChange={(e) => handleUrlChange(assignment._id, e.target.value)}
                  disabled={isPastDue}
                />
                <Button 
                  variant="contained" 
                  onClick={() => handleSubmit(assignment._id)} 
                  disabled={isPastDue}
                >
                  Submit
                </Button>
              </Box>
            )}
          </Paper>
        );
      })}
    </Container>
  );
};

export default StudentAssignmentView;

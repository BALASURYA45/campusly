import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Container, Typography, Grid, Card, CardContent, 
  Avatar, TextField, Button, MenuItem, Select, FormControl, 
  InputLabel, Alert, Divider, Stack, Chip, List, ListItem, 
  ListItemText, ListItemIcon, Paper, CircularProgress
} from '@mui/material';
import { 
  Person, TrendingUp, History, AddCircleOutline, 
  Psychology, HealthAndSafety, Save
} from '@mui/icons-material';
import API from '../utils/api';

const TeacherIntervention = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [newIntervention, setNewIntervention] = useState({
    type: 'Remedial Class',
    description: '',
    notes: ''
  });

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  const fetchStudentData = async () => {
    try {
      const { data } = await API.get(`/users/${studentId}`);
      setStudent(data.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Error fetching student data' });
    } finally {
      setLoading(false);
    }
  };

  const handleInterventionSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post(`/early-warning/intervention/${studentId}`, newIntervention);
      setMessage({ type: 'success', text: 'Intervention logged successfully!' });
      setNewIntervention({ type: 'Remedial Class', description: '', notes: '' });
      fetchStudentData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error logging intervention' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>;
  if (!student) return <Container sx={{ py: 4 }}><Alert severity="error">Student not found</Alert></Container>;

  const twin = student.digitalTwin || {};
  const interventions = twin.interventions || [];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button variant="outlined" onClick={() => navigate('/dashboard')} sx={{ borderRadius: 2 }}>Back</Button>
        <Typography variant="h4" fontWeight={800}>Intervention Management</Typography>
      </Box>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3, borderRadius: 2 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Student Profile & Twin Snapshot */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 4, mb: 4, position: 'relative', overflow: 'visible' }}>
            <Box sx={{ 
              position: 'absolute', top: -15, right: 20, 
              bgcolor: 'primary.main', color: 'white', px: 2, py: 0.5, 
              borderRadius: 2, fontSize: '0.75rem', fontWeight: 700,
              boxShadow: '0 4px 12px rgba(0,98,255,0.3)', display: 'flex', alignItems: 'center', gap: 0.5
            }}>
              <Psychology sx={{ fontSize: 14 }} /> DIGITAL TWIN SNAPSHOT
            </Box>
            <CardContent sx={{ pt: 4 }}>
              <Stack alignItems="center" spacing={2} sx={{ mb: 4 }}>
                <Avatar 
                  src={student.profileImage ? `http://localhost:5000${student.profileImage}` : ''}
                  sx={{ width: 100, height: 100, border: '4px solid #F0F6FF' }}
                >
                  {student.name.charAt(0)}
                </Avatar>
                <Box textAlign="center">
                  <Typography variant="h5" fontWeight={800}>{student.name}</Typography>
                  <Typography variant="body2" color="text.secondary">Roll: {student.rollNumber}</Typography>
                </Box>
                <Chip 
                  label={twin.earlyWarning?.status || 'Normal'} 
                  color={twin.earlyWarning?.status === 'Critical' ? 'error' : 'warning'} 
                  sx={{ fontWeight: 800 }}
                />
              </Stack>
              
              <Divider sx={{ mb: 3 }} />
              
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} color="text.secondary">Current Engagement Score</Typography>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1 }}>
                    <CircularProgress variant="determinate" value={twin.engagementScore} size={50} thickness={6} />
                    <Typography variant="h4" fontWeight={800}>{twin.engagementScore}%</Typography>
                  </Stack>
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} color="text.secondary">Predicted Performance</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ color: 'primary.main' }}>{twin.predictedPerformance}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 4, bgcolor: '#F8FAFC' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp color="primary" /> Metrics Trend
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This student has shown a {twin.engagementScore < 60 ? 'significant decline' : 'recent fluctuation'} in activity and completion rates over the last 7 days.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Action Center & History */}
        <Grid item xs={12} md={8}>
          <Typography variant="h5" fontWeight={800} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AddCircleOutline color="primary" /> Log New Intervention
          </Typography>
          <Card sx={{ borderRadius: 4, mb: 5 }}>
            <CardContent sx={{ p: 4 }}>
              <Box component="form" onSubmit={handleInterventionSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Intervention Type</InputLabel>
                      <Select
                        value={newIntervention.type}
                        label="Intervention Type"
                        onChange={(e) => setNewIntervention({ ...newIntervention, type: e.target.value })}
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="Counseling">Counseling Session</MenuItem>
                        <MenuItem value="Remedial Class">Remedial Class</MenuItem>
                        <MenuItem value="Parent Meeting">Parent Meeting</MenuItem>
                        <MenuItem value="Peer Mentoring">Peer Mentoring</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField 
                      fullWidth label="Primary Reason / Description" multiline rows={2}
                      placeholder="Why is this intervention being initiated?"
                      value={newIntervention.description}
                      onChange={(e) => setNewIntervention({ ...newIntervention, description: e.target.value })}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField 
                      fullWidth label="Specific Action Plan / Notes" multiline rows={3}
                      placeholder="What are the specific steps to be taken?"
                      value={newIntervention.notes}
                      onChange={(e) => setNewIntervention({ ...newIntervention, notes: e.target.value })}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sx={{ textAlign: 'right' }}>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      size="large" 
                      startIcon={<Save />}
                      disabled={submitting}
                      sx={{ borderRadius: 2, px: 4, py: 1.2, fontWeight: 700 }}
                    >
                      {submitting ? 'Saving...' : 'Deploy Intervention'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>

          <Typography variant="h5" fontWeight={800} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <History color="primary" /> Intervention History
          </Typography>
          <Card sx={{ borderRadius: 4 }}>
            <List sx={{ p: 0 }}>
              {interventions.length > 0 ? interventions.slice().reverse().map((inv, idx) => (
                <React.Fragment key={idx}>
                  <ListItem alignItems="flex-start" sx={{ py: 3, px: 4 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
                        <HealthAndSafety />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Typography variant="h6" fontWeight={800}>{inv.type}</Typography>
                          <Chip 
                            label={inv.status} 
                            size="small" 
                            color={inv.status === 'Completed' ? 'success' : 'primary'} 
                            variant="outlined"
                            sx={{ fontWeight: 800, fontSize: '0.65rem' }}
                          />
                        </Stack>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.primary" fontWeight={600} gutterBottom>
                            {inv.description}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {inv.notes}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Initiated on {new Date(inv.startDate).toLocaleDateString()} by Teacher
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {idx < interventions.length - 1 && <Divider />}
                </React.Fragment>
              )) : (
                <Box sx={{ p: 6, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">No interventions recorded for this student yet.</Typography>
                </Box>
              )}
            </List>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TeacherIntervention;

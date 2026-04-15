import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Grid, Box, Button, Card, CardContent, 
  Avatar, Stack, Divider, Chip, LinearProgress, Paper, Tooltip,
  List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import API from '../utils/api';
import DigitalTwinWidget from '../components/DigitalTwinWidget';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarsIcon from '@mui/icons-material/Stars';
import TimerIcon from '@mui/icons-material/Timer';
import DownloadIcon from '@mui/icons-material/Download';

const QuickAction = ({ title, icon, onClick, color }) => (
  <Paper 
    onClick={onClick}
    sx={{ 
      p: 2, 
      display: 'flex', 
      alignItems: 'center', 
      gap: 2, 
      cursor: 'pointer',
      transition: 'all 0.2s',
      '&:hover': { 
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        borderColor: color
      },
      border: '1px solid transparent',
      borderRadius: 4
    }}
  >
    <Avatar sx={{ bgcolor: `${color}15`, color: color, width: 48, height: 48 }}>
      {icon}
    </Avatar>
    <Box sx={{ flex: 1 }}>
      <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>
      <Typography variant="caption" color="text.secondary">View and manage {title.toLowerCase()}</Typography>
    </Box>
    <ArrowForwardIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
  </Paper>
);

const StudentDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    attendance: 0,
    pendingAssignments: 0,
    upcomingActivities: 0
  });
  const [twinData, setTwinData] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    fetchStudentStats();
    fetchTwinData();
    fetchSubjects();
    fetchRecommendations();
  }, [user]);

  const fetchStudentStats = async () => {
    try {
      const { data: attRes } = await API.get('/attendance/me');
      if (attRes.data && attRes.data.length > 0) {
        const present = attRes.data.filter(record => record.status === 'Present').length;
        const late = attRes.data.filter(record => record.status === 'Late').length;
        const onDuty = attRes.data.filter(record => record.status === 'On-Duty').length;
        const halfDay = attRes.data.filter(record => record.status === 'Half-Day').length;
        const total = attRes.data.length;
        setStats(prev => ({ ...prev, attendance: Math.round((present/total)*100) || 0 }));
        if (total > 0) {
          const weightedAttendance = ((present + late + onDuty + (halfDay * 0.5)) / total) * 100;
          setStats(prev => ({ ...prev, attendance: Math.round(weightedAttendance) || 0 }));
        }
      }
      
      const { data: assignRes } = await API.get('/assignments');
      const pending = assignRes.data.filter(a => 
        !a.submissions.find(s => {
          const submissionStudentId = s.student?._id || s.student;
          return submissionStudentId?.toString() === (user.id || user.user?.id);
        })
      ).length;
      setStats(prev => ({ ...prev, pendingAssignments: pending }));

    } catch (err) {
      console.error(err);
    }
  };

  const fetchTwinData = async () => {
    const studentId = user.id || user.user?.id;
    try {
      const { data } = await API.get(`/digital-twin/${studentId}`);
      setTwinData(data.data?.twin || null);
    } catch (err) {
      console.error('Error fetching twin data:', err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data } = await API.get('/subjects');
      setSubjects(data.data.slice(0, 3));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const { data } = await API.get('/recommendations/me');
      setRecommendations(data.data?.recommendedContent?.slice(0, 4) || []);
    } catch (err) {
      // recommendations depend on quiz/grade data; safe to ignore if empty
      setRecommendations([]);
    }
  };

  const downloadMyProgressReport = async (format) => {
    try {
      const { data } = await API.get(`/reports/me/performance?format=${format}`);
      const url = data?.data?.report?.fileUrl || data?.data?.fileUrl;
      if (url) window.open(`http://localhost:5000${url}`, '_blank');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate report');
    }
  };

  const getAIGuidance = () => {
    if (!twinData) return [];
    const guidance = [];
    if (twinData.engagementScore < 70) guidance.push("Boost your engagement by participating in campus activities.");
    if (stats.attendance < 85) guidance.push("Aim for higher attendance to improve your predictive score.");
    if (stats.pendingAssignments > 0) guidance.push("Submit your pending assignments to avoid falling behind.");
    if (guidance.length === 0) guidance.push("Excellent work! You're currently a top performer in your class.");
    return guidance;
  };

  const name = user?.user?.name || user?.name;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Welcome Banner */}
      <Box sx={{ 
        mb: 4, p: 4, borderRadius: 6, 
        background: 'linear-gradient(135deg, #0062ff 0%, #7c4dff 100%)',
        color: 'white',
        boxShadow: '0 10px 30px rgba(0, 98, 255, 0.2)'
      }}>
        <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" spacing={3}>
          <Avatar 
            sx={{ 
              width: 80, height: 80, 
              bgcolor: 'rgba(255,255,255,0.2)', 
              fontSize: '2rem', fontWeight: 800,
              border: '4px solid rgba(255,255,255,0.3)'
            }}
          >
            {name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="h3" fontWeight={800}>
              Welcome back, {name}!
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500 }}>
              You're doing great! Keep up the momentum in your studies.
            </Typography>
          </Box>
          <Chip 
            label="STUDENT" 
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700, 
              px: 2, py: 2.5, fontSize: '0.9rem', backdropFilter: 'blur(10px)'
            }} 
          />
        </Stack>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>My Academic Progress</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Card sx={{ height: '100%', borderRadius: 4 }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight={700}>Overall Attendance</Typography>
                    <SchoolIcon color="primary" />
                  </Stack>
                  <Typography variant="h3" fontWeight={800} color="primary.main">{stats.attendance}%</Typography>
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress variant="determinate" value={stats.attendance} sx={{ height: 8, borderRadius: 5 }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Requirement: 75% | Status: {stats.attendance >= 75 ? 'Excellent' : 'Action Required'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card sx={{ height: '100%', borderRadius: 4 }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight={700}>Pending Tasks</Typography>
                    <AssignmentIcon color="secondary" />
                  </Stack>
                  <Typography variant="h3" fontWeight={800} color="secondary.main">{stats.pendingAssignments}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Assignments awaiting your submission</Typography>
                  <Button variant="text" color="secondary" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/my-assignments')} sx={{ mt: 1, p: 0 }}>
                    Go to Assignments
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Typography variant="h5" fontWeight={800} sx={{ mt: 5, mb: 3 }}>AI Student Guidance</Typography>
          <Card sx={{ borderRadius: 4, bgcolor: 'background.paper', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}>
              <AutoFixHighIcon sx={{ fontSize: 120, color: 'primary.main' }} />
            </Box>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TrendingUpIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight={700}>Improvement Roadmap</Typography>
                </Stack>
                <List sx={{ py: 0 }}>
                  {getAIGuidance().map((text, i) => (
                    <ListItem key={i} sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <StarsIcon sx={{ fontSize: 18, color: 'amber.main' }} />
                      </ListItemIcon>
                      <ListItemText primary={text} primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }} />
                    </ListItem>
                  ))}
                </List>
              </Stack>
            </CardContent>
          </Card>

          <Typography variant="h5" fontWeight={800} sx={{ mt: 5, mb: 3 }}>Quick Access</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><QuickAction title="My Schedule" icon={<DateRangeIcon />} color="#0062ff" onClick={() => navigate('/timetable')} /></Grid>
            <Grid item xs={12} sm={6}><QuickAction title="Digital Library" icon={<MenuBookIcon />} color="#ffb547" onClick={() => navigate('/library')} /></Grid>
            <Grid item xs={12} sm={6}><QuickAction title="Quiz Hub" icon={<AssignmentIcon />} color="#01b574" onClick={() => navigate('/quizzes')} /></Grid>
            <Grid item xs={12} sm={6}><QuickAction title="Study Hub" icon={<TimerIcon />} color="#0ea5e9" onClick={() => navigate('/study')} /></Grid>
            <Grid item xs={12} sm={6}><QuickAction title="Activities" icon={<NotificationsActiveIcon />} color="#7c4dff" onClick={() => navigate('/activities')} /></Grid>
          </Grid>

          <Typography variant="h5" fontWeight={800} sx={{ mt: 5, mb: 2 }}>Recommended For You</Typography>
          {recommendations.length === 0 ? (
            <Typography variant="body2" color="text.secondary">Take a quiz or get assignments graded to unlock recommendations.</Typography>
          ) : (
            <Grid container spacing={2}>
              {recommendations.map((c) => (
                <Grid item xs={12} sm={6} key={c._id}>
                  <Card sx={{ borderRadius: 4 }}>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" fontWeight={800} noWrap>{c.title}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {c.subject?.name} • {c.contentType}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrientation: 'vertical', overflow: 'hidden' }}>
                            {c.description}
                          </Typography>
                        </Box>
                        <Button variant="outlined" size="small" onClick={() => navigate('/library')}>Open</Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          <Typography variant="h5" fontWeight={800} sx={{ mt: 5, mb: 2 }}>Progress Report</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button variant="contained" startIcon={<DownloadIcon />} onClick={() => downloadMyProgressReport('pdf')}>
              Download PDF
            </Button>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => downloadMyProgressReport('csv')}>
              Download CSV
            </Button>
          </Stack>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>Digital Twin Analysis</Typography>
          <DigitalTwinWidget data={twinData} type="student" />

          <Typography variant="h5" fontWeight={800} sx={{ mt: 5, mb: 3 }}>Engagement Heatmap</Typography>
          <Card sx={{ borderRadius: 4, p: 2 }}>
            <Typography variant="caption" color="text.secondary">Daily Activity Score (Last 30 Days)</Typography>
            <Box sx={{ mt: 2, height: 100, display: 'flex', alignItems: 'flex-end', gap: 0.5 }}>
              {twinData?.activityHeatmap?.slice(-30).map((h, i) => (
                <Tooltip key={i} title={`${new Date(h.date).toLocaleDateString()}: ${h.score}%`}>
                  <Box 
                    sx={{ 
                      flex: 1, 
                      height: `${h.score}%`, 
                      bgcolor: h.score > 70 ? 'success.main' : (h.score > 40 ? 'warning.main' : 'error.main'),
                      borderRadius: 1,
                      opacity: 0.8,
                      '&:hover': { opacity: 1 }
                    }} 
                  />
                </Tooltip>
              ))}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default StudentDashboard;

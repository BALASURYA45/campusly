import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Grid, Box, Button, Card, CardContent, 
  Avatar, Stack, Divider, Chip, LinearProgress, Paper, IconButton,
  List, ListItem, ListItemAvatar, ListItemText, Tooltip
} from '@mui/material';
import API from '../utils/api';
import DigitalTwinWidget from '../components/DigitalTwinWidget';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import GroupIcon from '@mui/icons-material/Group';
import EventIcon from '@mui/icons-material/Event';
import WarningIcon from '@mui/icons-material/Warning';
import FeedbackIcon from '@mui/icons-material/Feedback';

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

const TeacherDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [atRiskStudents, setAtRiskStudents] = useState([]);
  const [twinData, setTwinData] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    avgAttendance: 0,
    pendingGrading: 0
  });

  useEffect(() => {
    fetchTeacherStats();
    fetchAtRiskStudents();
  }, [user]);

  const fetchTeacherStats = async () => {
    try {
      const { data: classRes } = await API.get('/classes');
      const teacherClasses = classRes.data.filter(c => c.teacher && (c.teacher._id === user.id || c.teacher === user.id));
      setClasses(teacherClasses);
      
      const studentsCount = teacherClasses.reduce((acc, curr) => acc + (curr.students?.length || 0), 0);
      setStats(prev => ({ ...prev, totalStudents: studentsCount }));

      const { data: assignRes } = await API.get('/assignments');
      const teacherAssignments = assignRes.data.filter(a => a.teacher._id === user.id || a.teacher === user.id);
      setAssignments(teacherAssignments);
      
      let pending = 0;
      teacherAssignments.forEach(a => {
        pending += a.submissions.filter(s => s.status === 'Submitted').length;
      });
      setStats(prev => ({ ...prev, pendingGrading: pending }));

      if (teacherClasses.length > 0) {
        const { data: twinRes } = await API.get(`/digital-twin/class/${teacherClasses[0]._id}`);
        setTwinData(twinRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAtRiskStudents = async () => {
    try {
      const { data } = await API.get('/early-warning/at-risk');
      setAtRiskStudents(data.data);
    } catch (err) {
      console.error('Error fetching at-risk students:', err);
    }
  };

  const name = user?.user?.name || user?.name;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Welcome Banner */}
      <Box sx={{ 
        mb: 4, p: 4, borderRadius: 6, 
        background: 'linear-gradient(135deg, #01b574 0%, #33c38f 100%)',
        color: 'white',
        boxShadow: '0 10px 30px rgba(1, 181, 116, 0.2)'
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
              Hello, {name}!
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500 }}>
              Inspire. Teach. Lead. Managing {classes.length} active classes today.
            </Typography>
          </Box>
          <Chip 
            label="TEACHER" 
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700, 
              px: 2, py: 2.5, fontSize: '0.9rem', backdropFilter: 'blur(10px)'
            }} 
          />
        </Stack>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>Classroom Metrics</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Card sx={{ height: '100%', borderRadius: 4 }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight={700}>Students Managed</Typography>
                    <GroupIcon color="primary" />
                  </Stack>
                  <Typography variant="h3" fontWeight={800} color="primary.main">{stats.totalStudents}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Across your assigned classes</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card sx={{ height: '100%', borderRadius: 4 }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight={700}>Pending Grading</Typography>
                    <AssignmentIcon color="secondary" />
                  </Stack>
                  <Typography variant="h3" fontWeight={800} color="secondary.main">{stats.pendingGrading}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Submissions waiting for review</Typography>
                  <Button variant="text" color="secondary" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/teacher/assignments')} sx={{ mt: 1, p: 0 }}>
                    Grade Now
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Typography variant="h5" fontWeight={800} sx={{ mt: 5, mb: 3 }}>AI Early Warning System (At-Risk Students)</Typography>
          <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
            <List sx={{ p: 0 }}>
              {atRiskStudents.length > 0 ? atRiskStudents.map((student, idx) => (
                <React.Fragment key={student._id}>
                  <ListItem 
                    secondaryAction={
                      <Button 
                        variant="outlined" 
                        size="small" 
                        startIcon={<FeedbackIcon />}
                        onClick={() => navigate(`/teacher/intervention/${student._id}`)}
                      >
                        Intervene
                      </Button>
                    }
                    sx={{ py: 2 }}
                  >
                    <ListItemAvatar>
                      <Avatar src={student.profileImage ? `http://localhost:5000${student.profileImage}` : ''}>
                        {student.name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="subtitle1" fontWeight={700}>{student.name}</Typography>
                          <Chip 
                            label={student.digitalTwin?.earlyWarning?.status} 
                            color={student.digitalTwin?.earlyWarning?.status === 'Critical' ? 'error' : 'warning'} 
                            size="small" 
                            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }}
                          />
                        </Stack>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          Engagement: {student.digitalTwin?.engagementScore}% | Roll: {student.rollNumber}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {idx < atRiskStudents.length - 1 && <Divider />}
                </React.Fragment>
              )) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <CheckCircleIcon sx={{ color: 'success.main', fontSize: 40, mb: 1 }} />
                  <Typography variant="subtitle1" fontWeight={700}>All Students are on Track</Typography>
                  <Typography variant="body2" color="text.secondary">No students currently flagged by the AI warning system.</Typography>
                </Box>
              )}
            </List>
          </Card>

          <Typography variant="h5" fontWeight={800} sx={{ mt: 5, mb: 3 }}>Faculty Toolkit</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><QuickAction title="Mark Attendance" icon={<CheckCircleIcon />} color="#01b574" onClick={() => navigate('/attendance')} /></Grid>
            <Grid item xs={12} sm={6}><QuickAction title="Digital Repository" icon={<SchoolIcon />} color="#0062ff" onClick={() => navigate('/library')} /></Grid>
            <Grid item xs={12} sm={6}><QuickAction title="Manage Quizzes" icon={<AssignmentIcon />} color="#7c4dff" onClick={() => navigate('/teacher/quizzes')} /></Grid>
            <Grid item xs={12} sm={6}><QuickAction title="Assign Activities" icon={<EventIcon />} color="#ffb547" onClick={() => navigate('/activities')} /></Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>Classroom Twin Analytics</Typography>
          <DigitalTwinWidget data={twinData} type="class" />

          <Typography variant="h5" fontWeight={800} sx={{ mt: 5, mb: 3 }}>Teacher Alerts</Typography>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Stack spacing={3}>
                <Box>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'error.light' }}><NotificationsActiveIcon sx={{ fontSize: 20 }} /></Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>Attendance Alert</Typography>
                      <Typography variant="caption" color="text.secondary">3 students in Class 10A below 75%</Typography>
                    </Box>
                  </Stack>
                </Box>
                <Divider />
                <Button fullWidth variant="outlined" onClick={() => navigate('/reports')}>
                  Generate Class Reports
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TeacherDashboard;

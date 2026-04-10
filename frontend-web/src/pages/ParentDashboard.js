import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Grid, Box, Button, Card, CardContent, 
  Avatar, Stack, Divider, Chip, Paper, List, ListItem, ListItemAvatar, ListItemText
} from '@mui/material';
import API from '../utils/api';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MessageIcon from '@mui/icons-material/Message';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import GroupIcon from '@mui/icons-material/Group';

const ChildSummary = ({ child, onClick }) => (
  <Paper 
    onClick={onClick}
    sx={{ 
      p: 2, mb: 2, borderRadius: 4, cursor: 'pointer',
      '&:hover': { bgcolor: 'action.hover' }
    }}
  >
    <Stack direction="row" spacing={2} alignItems="center">
      <Avatar src={child.profileImage ? `http://localhost:5000${child.profileImage}` : ''}>
        {child.name.charAt(0)}
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1" fontWeight={700}>{child.name}</Typography>
        <Typography variant="caption" color="text.secondary">Roll: {child.rollNumber}</Typography>
      </Box>
      <Box sx={{ textAlign: 'right' }}>
        <Typography variant="subtitle2" color="primary.main" fontWeight={700}>
          {child.digitalTwin?.engagementScore || 0}%
        </Typography>
        <Typography variant="caption" color="text.secondary">Engagement</Typography>
      </Box>
    </Stack>
  </Paper>
);

const ParentDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childStats, setChildStats] = useState(null);

  const fetchChildInsights = useCallback(async (childId) => {
    try {
      const { data } = await API.post('/reports/performance', { studentId: childId, format: 'json' });
      setChildStats(data.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchChildren = useCallback(async () => {
    try {
      const { data } = await API.get('/auth/me'); 
      const childrenList = data.data.children || [];
      setChildren(childrenList);
      if (childrenList.length > 0) {
        setSelectedChild(childrenList[0]);
        fetchChildInsights(childrenList[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  }, [fetchChildInsights]);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren, user]);

  const name = user?.user?.name || user?.name;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Welcome Banner */}
      <Box sx={{ 
        mb: 4, p: 4, borderRadius: 6, 
        background: 'linear-gradient(135deg, #7c4dff 0%, #9c27b0 100%)',
        color: 'white',
        boxShadow: '0 10px 30px rgba(124, 77, 255, 0.2)'
      }}>
        <Typography variant="h3" fontWeight={800}>Hello, {name}!</Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>Monitoring your children's academic journey and growth.</Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>My Children</Typography>
          {children.length > 0 ? children.map(child => (
            <ChildSummary 
              key={child._id} 
              child={child} 
              onClick={() => {
                setSelectedChild(child);
                fetchChildInsights(child._id);
              }}
            />
          )) : (
            <Typography variant="body1" color="text.secondary">No children linked to this account.</Typography>
          )}
          
          <Button 
            fullWidth variant="outlined" 
            startIcon={<MessageIcon />}
            sx={{ mt: 2, borderRadius: 3 }}
            onClick={() => selectedChild && navigate(`/parent/child/${selectedChild._id}/messages`)}
            disabled={!selectedChild}
          >
            Message Teachers
          </Button>
        </Grid>

        <Grid item xs={12} md={8}>
          {selectedChild ? (
            <>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={800}>Insights for {selectedChild.name}</Typography>
                <Chip label={selectedChild.digitalTwin?.predictedPerformance || 'Average'} color="primary" variant="outlined" />
              </Stack>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6}>
                  <Card sx={{ borderRadius: 4 }}>
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: 'primary.light' }}><TrendingUpIcon /></Avatar>
                        <Box>
                          <Typography variant="h4" fontWeight={800}>{selectedChild.digitalTwin?.engagementScore || 0}%</Typography>
                          <Typography variant="body2" color="text.secondary">Digital Twin Engagement</Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card sx={{ borderRadius: 4 }}>
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: 'secondary.light' }}><SchoolIcon /></Avatar>
                        <Box>
                          <Typography variant="h4" fontWeight={800}>{childStats?.statistics?.attendancePercentage || '0%'}</Typography>
                          <Typography variant="body2" color="text.secondary">Current Attendance</Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Recent Academic Activity</Typography>
              <Card sx={{ borderRadius: 4, mb: 4 }}>
                <List>
                  {childStats?.details?.slice(0, 3).map((item, i) => (
                    <React.Fragment key={i}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'action.hover' }}><AssignmentIcon sx={{ color: 'text.secondary' }} /></Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={item.title} 
                          secondary={`Status: ${item.status} | Grade: ${item.grade}`}
                        />
                        <Chip label={item.marks || 'N/A'} size="small" />
                      </ListItem>
                      {i < 2 && <Divider variant="inset" />}
                    </React.Fragment>
                  ))}
                  {(!childStats?.details || childStats.details.length === 0) && (
                    <ListItem>
                      <ListItemText primary="No recent assignments found." />
                    </ListItem>
                  )}
                </List>
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Button endIcon={<ArrowForwardIcon />} onClick={() => navigate(`/parent/child/${selectedChild._id}/performance`)}>
                    View Full Performance Report
                  </Button>
                </Box>
              </Card>

              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Teacher Observations (Interventions)</Typography>
              <Card sx={{ borderRadius: 4 }}>
                <List>
                  {selectedChild.digitalTwin?.interventions?.length > 0 ? selectedChild.digitalTwin.interventions.slice(-2).map((inv, i) => (
                    <ListItem key={i}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'warning.light' }}><GroupIcon /></Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={inv.type} 
                        secondary={`${inv.description} - ${new Date(inv.startDate).toLocaleDateString()}`}
                      />
                    </ListItem>
                  )) : (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">No special observations or interventions logged.</Typography>
                    </Box>
                  )}
                </List>
              </Card>
            </>
          ) : (
            <Box sx={{ p: 10, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">Select a child to view insights</Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ParentDashboard;

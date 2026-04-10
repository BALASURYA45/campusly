import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useSelector } from 'react-redux';
import API from '../utils/api';

const ActivityManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, [user]);

  const fetchActivities = async () => {
    try {
      const { data } = await API.get('/activities');
      setActivities(data.data);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load activities' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterActivity = async (activityId) => {
    try {
      await API.post(`/activities/${activityId}/register`);
      setMessage({ type: 'success', text: 'Successfully registered for activity!' });
      fetchActivities();
      setOpenDialog(false);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to register' });
    }
  };

  const handleWithdrawActivity = async (activityId) => {
    try {
      await API.post(`/activities/${activityId}/withdraw`);
      setMessage({ type: 'success', text: 'Successfully withdrew from activity!' });
      fetchActivities();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to withdraw from activity' });
    }
  };

  const isUserRegistered = (activity) => {
    return activity.participants.some(p => p.student._id === user.id || p.student === user.id);
  };

  const getUserParticipationStatus = (activity) => {
    const participant = activity.participants.find(p => p.student._id === user.id || p.student === user.id);
    return participant?.status || null;
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'Ongoing': return 'warning';
      case 'Upcoming': return 'info';
      default: return 'default';
    }
  };

  const getParticipationColor = (status) => {
    switch (status) {
      case 'Participated': return 'success';
      case 'Registered': return 'info';
      case 'Absent': return 'error';
      case 'Withdrew': return 'default';
      default: return 'default';
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>Available Activities</Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        {activities.map((activity) => {
          const isRegistered = isUserRegistered(activity);
          const participationStatus = getUserParticipationStatus(activity);

          return (
            <Grid item xs={12} md={6} lg={4} key={activity._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{activity.title}</Typography>
                      <Typography variant="caption" color="textSecondary">{activity.type}</Typography>
                    </Box>
                    <Chip 
                      label={activity.status} 
                      color={getStatusColor(activity.status)}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" paragraph color="textSecondary">
                    {activity.description}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                      📅 {formatDate(activity.startDate)}
                      {activity.endDate && ` - ${formatDate(activity.endDate)}`}
                    </Typography>
                    {activity.location && (
                      <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                        📍 {activity.location}
                      </Typography>
                    )}
                    <Typography variant="caption" display="block">
                      👥 {activity.participants.length} / {activity.maxParticipants || '∞'} participants
                    </Typography>
                  </Box>

                  {isRegistered && (
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={`Status: ${participationStatus}`}
                        color={getParticipationColor(participationStatus)}
                        size="small"
                      />
                    </Box>
                  )}
                </CardContent>

                <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                  {!isRegistered ? (
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => {
                        setSelectedActivity(activity);
                        setOpenDialog(true);
                      }}
                      disabled={
                        activity.maxParticipants && 
                        activity.participants.length >= activity.maxParticipants
                      }
                    >
                      Register
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      fullWidth
                      color="error"
                      onClick={() => handleWithdrawActivity(activity._id)}
                      disabled={participationStatus === 'Participated'}
                    >
                      Withdraw
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                      setSelectedActivity(activity);
                      setOpenDialog(true);
                    }}
                  >
                    Details
                  </Button>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {activities.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="textSecondary">No activities available</Typography>
        </Paper>
      )}

      {/* Activity Details Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedActivity && (
          <>
            <DialogTitle>{selectedActivity.title}</DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Description</Typography>
                <Typography variant="body2" paragraph>{selectedActivity.description}</Typography>

                <Typography variant="subtitle2" gutterBottom>Details</Typography>
                <Typography variant="body2">Type: {selectedActivity.type}</Typography>
                <Typography variant="body2">
                  Start Date: {formatDate(selectedActivity.startDate)}
                </Typography>
                {selectedActivity.endDate && (
                  <Typography variant="body2">
                    End Date: {formatDate(selectedActivity.endDate)}
                  </Typography>
                )}
                {selectedActivity.location && (
                  <Typography variant="body2">Location: {selectedActivity.location}</Typography>
                )}
                <Typography variant="body2">
                  Participants: {selectedActivity.participants.length}/{selectedActivity.maxParticipants || '∞'}
                </Typography>

                {isUserRegistered(selectedActivity) && (
                  <>
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Your Status</Typography>
                    <Chip
                      label={getUserParticipationStatus(selectedActivity)}
                      color={getParticipationColor(getUserParticipationStatus(selectedActivity))}
                    />
                  </>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
              {!isUserRegistered(selectedActivity) && (
                <Button
                  variant="contained"
                  onClick={() => handleRegisterActivity(selectedActivity._id)}
                  disabled={
                    selectedActivity.maxParticipants && 
                    selectedActivity.participants.length >= selectedActivity.maxParticipants
                  }
                >
                  Register
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default ActivityManagement;

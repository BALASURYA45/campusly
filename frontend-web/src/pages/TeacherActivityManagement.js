import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  CircularProgress,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import API from '../utils/api';
import { useSelector } from 'react-redux';

const TeacherActivityManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [activities, setActivities] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openParticipantsDialog, setOpenParticipantsDialog] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);

  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    type: 'Academic',
    class: '',
    startDate: '',
    endDate: '',
    location: '',
    maxParticipants: '',
  });

  useEffect(() => {
    fetchActivities();
    fetchClasses();
  }, [user]);

  const fetchActivities = async () => {
    try {
      const { data } = await API.get('/activities');
      const teacherActivities = data.data.filter(a => a.teacher._id === user.id);
      setActivities(teacherActivities);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load activities' });
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const { data } = await API.get('/classes');
      const teacherClasses = data.data.filter(c => c.teacher && (c.teacher._id === user.id || c.teacher === user.id));
      setClasses(teacherClasses);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateActivity = async () => {
    if (!newActivity.title || !newActivity.startDate) {
      return alert('Please fill in required fields');
    }

    try {
      await API.post('/activities', {
        ...newActivity,
        maxParticipants: newActivity.maxParticipants ? parseInt(newActivity.maxParticipants) : null,
      });
      setMessage({ type: 'success', text: 'Activity created successfully!' });
      setOpenDialog(false);
      setNewActivity({ title: '', description: '', type: 'Academic', class: '', startDate: '', endDate: '', location: '', maxParticipants: '' });
      fetchActivities();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to create activity' });
    }
  };

  const handleDeleteActivity = async (id) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await API.delete(`/activities/${id}`);
        setMessage({ type: 'success', text: 'Activity deleted successfully!' });
        fetchActivities();
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to delete activity' });
      }
    }
  };

  const handleIssueCertificates = async () => {
    if (!selectedActivity) return;

    const participantIds = selectedActivity.participants
      .filter(p => p.status === 'Participated')
      .map(p => p._id);

    if (participantIds.length === 0) {
      return alert('No participated students to issue certificates to');
    }

    try {
      await API.post(`/activities/${selectedActivity._id}/issue-certificate`, {
        participantIds,
      });
      setMessage({ type: 'success', text: `Certificates issued to ${participantIds.length} students!` });
      fetchActivities();
      setOpenParticipantsDialog(false);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to issue certificates' });
    }
  };

  const handleUpdateParticipantStatus = async (activityId, participantId, newStatus) => {
    try {
      await API.put(`/activities/${activityId}/participants/${participantId}`, {
        status: newStatus,
      });
      setMessage({ type: 'success', text: 'Participant status updated!' });
      fetchActivities();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update status' });
    }
  };

  const getActivityStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'Ongoing': return 'warning';
      case 'Upcoming': return 'info';
      default: return 'default';
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  };

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Activity Management</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Create Activity
        </Button>
      </Box>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      {/* Activities Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {activities.map((activity) => (
          <Grid item xs={12} md={6} key={activity._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6">{activity.title}</Typography>
                    <Typography variant="caption" color="textSecondary">{activity.type}</Typography>
                  </Box>
                  <Chip 
                    label={activity.status} 
                    color={getActivityStatusColor(activity.status)}
                  />
                </Box>

                <Typography variant="body2" paragraph>
                  {activity.description}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" display="block">
                    📅 {formatDate(activity.startDate)} {activity.endDate ? `- ${formatDate(activity.endDate)}` : ''}
                  </Typography>
                  {activity.location && (
                    <Typography variant="caption" display="block">
                      📍 {activity.location}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                  <Chip 
                    label={`${activity.participants.length} Participants`} 
                    size="small" 
                    variant="outlined"
                  />
                  {activity.maxParticipants && (
                    <Chip 
                      label={`Capacity: ${activity.maxParticipants}`} 
                      size="small" 
                      variant="outlined"
                    />
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => {
                      setSelectedActivity(activity);
                      setOpenParticipantsDialog(true);
                    }}
                  >
                    Participants
                  </Button>
                  <Button 
                    size="small"
                    color="error"
                    onClick={() => handleDeleteActivity(activity._id)}
                  >
                    <DeleteIcon />
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create Activity Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Activity</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Activity Title"
              value={newActivity.title}
              onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={newActivity.description}
              onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
            />
            <FormControl fullWidth>
              <InputLabel>Activity Type</InputLabel>
              <Select
                value={newActivity.type}
                label="Activity Type"
                onChange={(e) => setNewActivity({...newActivity, type: e.target.value})}
              >
                <MenuItem value="Sports">Sports</MenuItem>
                <MenuItem value="Cultural">Cultural</MenuItem>
                <MenuItem value="Academic">Academic</MenuItem>
                <MenuItem value="Skill Development">Skill Development</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Class (Optional)</InputLabel>
              <Select
                value={newActivity.class}
                label="Class"
                onChange={(e) => setNewActivity({...newActivity, class: e.target.value})}
              >
                <MenuItem value="">Select a class</MenuItem>
                {classes.map(c => (
                  <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Start Date"
              type="datetime-local"
              value={newActivity.startDate}
              onChange={(e) => setNewActivity({...newActivity, startDate: e.target.value})}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="End Date"
              type="datetime-local"
              value={newActivity.endDate}
              onChange={(e) => setNewActivity({...newActivity, endDate: e.target.value})}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Location"
              value={newActivity.location}
              onChange={(e) => setNewActivity({...newActivity, location: e.target.value})}
            />
            <TextField
              fullWidth
              label="Max Participants (Optional)"
              type="number"
              value={newActivity.maxParticipants}
              onChange={(e) => setNewActivity({...newActivity, maxParticipants: e.target.value})}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateActivity}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Participants Dialog */}
      <Dialog 
        open={openParticipantsDialog} 
        onClose={() => setOpenParticipantsDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {selectedActivity?.title} - Participants
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Roll No</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Certificate</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedActivity?.participants.map((participant) => (
                    <TableRow key={participant._id}>
                      <TableCell>{participant.student?.name}</TableCell>
                      <TableCell>{participant.student?.rollNumber}</TableCell>
                      <TableCell>
                        <Select
                          size="small"
                          value={participant.status}
                          onChange={(e) => handleUpdateParticipantStatus(selectedActivity._id, participant._id, e.target.value)}
                        >
                          <MenuItem value="Registered">Registered</MenuItem>
                          <MenuItem value="Participated">Participated</MenuItem>
                          <MenuItem value="Absent">Absent</MenuItem>
                          <MenuItem value="Withdrew">Withdrew</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {participant.certificateEarned ? (
                          <Chip label="Earned" color="success" size="small" />
                        ) : (
                          <Chip label="Not Earned" size="small" />
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small"
                          title="View Certificate"
                          disabled={!participant.certificateEarned}
                        >
                          <EmojiEventsIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenParticipantsDialog(false)}>Close</Button>
          <Button 
            variant="contained" 
            startIcon={<EmojiEventsIcon />}
            onClick={handleIssueCertificates}
          >
            Issue Certificates
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TeacherActivityManagement;

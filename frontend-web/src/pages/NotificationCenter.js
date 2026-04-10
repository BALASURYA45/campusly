import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import MailIcon from '@mui/icons-material/Mail';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import SettingsIcon from '@mui/icons-material/Settings';
import API from '../utils/api';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [preferences, setPreferences] = useState({
    email: true,
    push: true,
    inApp: true,
  });
  const [openPrefs, setOpenPrefs] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();
  }, [filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const isRead = filter === 'unread' ? 'false' : filter === 'read' ? 'true' : undefined;
      const params = new URLSearchParams();
      if (isRead !== undefined) params.append('isRead', isRead);
      params.append('limit', 50);

      const { data } = await API.get(`/notifications?${params.toString()}`);
      setNotifications(data.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const { data } = await API.get('/notifications/preferences');
      setPreferences(data.data);
    } catch (err) {
      console.error('Error fetching preferences:', err);
    }
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      await API.put(`/notifications/${notifId}/read`);
      fetchNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await API.put('/notifications/mark-all-read');
      fetchNotifications();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleDelete = async (notifId) => {
    try {
      await API.delete(`/notifications/${notifId}`);
      fetchNotifications();
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      try {
        await API.delete('/notifications');
        fetchNotifications();
      } catch (err) {
        console.error('Error clearing notifications:', err);
      }
    }
  };

  const handleSavePreferences = async () => {
    try {
      await API.put('/notifications/preferences', preferences);
      setOpenPrefs(false);
      alert('Preferences updated successfully!');
    } catch (err) {
      console.error('Error updating preferences:', err);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'attendance':
        return 'primary';
      case 'assignment':
        return 'secondary';
      case 'activity':
        return 'info';
      case 'message':
        return 'success';
      case 'alert':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Notification Center</Typography>
        <Box>
          <IconButton onClick={() => setOpenPrefs(true)} title="Preferences">
            <SettingsIcon />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <FormControl fullWidth size="small">
            <InputLabel>Filter</InputLabel>
            <Select
              value={filter}
              label="Filter"
              onChange={(e) => setFilter(e.target.value)}
            >
              <MenuItem value="all">All Notifications</MenuItem>
              <MenuItem value="unread">Unread Only</MenuItem>
              <MenuItem value="read">Read Only</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleMarkAllAsRead}
              startIcon={<MarkEmailReadIcon />}
            >
              Mark All Read
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={handleClearAll}
            >
              Clear All
            </Button>
          </Box>
        </Grid>
      </Grid>

      {notifications.length === 0 ? (
        <Alert severity="info">No notifications found</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notifications.map((notif) => (
                <TableRow
                  key={notif._id}
                  sx={{
                    bgcolor: notif.isRead ? 'transparent' : '#f9f9f9',
                    '&:hover': { bgcolor: '#f5f5f5' },
                  }}
                >
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={notif.isRead ? 'normal' : 'bold'}>
                      {notif.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={notif.type}
                      color={getTypeColor(notif.type)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={notif.priority}
                      color={getPriorityColor(notif.priority)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {notif.message}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {new Date(notif.createdAt).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={notif.isRead ? 'Read' : 'Unread'}
                      color={notif.isRead ? 'default' : 'primary'}
                      size="small"
                      variant={notif.isRead ? 'outlined' : 'filled'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {!notif.isRead && (
                      <IconButton
                        size="small"
                        onClick={() => handleMarkAsRead(notif._id)}
                        title="Mark as read"
                      >
                        <MailIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(notif._id)}
                      title="Delete"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openPrefs} onClose={() => setOpenPrefs(false)}>
        <DialogTitle>Notification Preferences</DialogTitle>
        <DialogContent sx={{ minWidth: 400, mt: 2 }}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MailIcon sx={{ mr: 2 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2">Email Notifications</Typography>
                  <Typography variant="caption" color="textSecondary">
                    Receive notifications via email
                  </Typography>
                </Box>
                <Select
                  value={preferences.email ? 'on' : 'off'}
                  onChange={(e) =>
                    setPreferences({ ...preferences, email: e.target.value === 'on' })
                  }
                  size="small"
                >
                  <MenuItem value="on">On</MenuItem>
                  <MenuItem value="off">Off</MenuItem>
                </Select>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ mr: 2 }}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      bgcolor: 'primary.main',
                      borderRadius: '50%',
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2">Push Notifications</Typography>
                  <Typography variant="caption" color="textSecondary">
                    Receive browser push notifications
                  </Typography>
                </Box>
                <Select
                  value={preferences.push ? 'on' : 'off'}
                  onChange={(e) =>
                    setPreferences({ ...preferences, push: e.target.value === 'on' })
                  }
                  size="small"
                >
                  <MenuItem value="on">On</MenuItem>
                  <MenuItem value="off">Off</MenuItem>
                </Select>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ mr: 2 }}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      bgcolor: 'secondary.main',
                      borderRadius: '50%',
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2">In-App Notifications</Typography>
                  <Typography variant="caption" color="textSecondary">
                    Receive notifications within the app
                  </Typography>
                </Box>
                <Select
                  value={preferences.inApp ? 'on' : 'off'}
                  onChange={(e) =>
                    setPreferences({ ...preferences, inApp: e.target.value === 'on' })
                  }
                  size="small"
                >
                  <MenuItem value="on">On</MenuItem>
                  <MenuItem value="off">Off</MenuItem>
                </Select>
              </Box>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPrefs(false)}>Cancel</Button>
          <Button onClick={handleSavePreferences} variant="contained">
            Save Preferences
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NotificationCenter;

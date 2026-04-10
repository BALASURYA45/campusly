import React, { useState, useEffect } from 'react';
import { Container, Tabs, Tab, Box, Typography, Paper, Grid, Button, IconButton, TextField, MenuItem, Select, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormControlLabel } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import API from '../utils/api';

const AdminManagement = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [data, setData] = useState({ users: [], classes: [], subjects: [] });
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentEntity, setCurrentEntity] = useState(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchData();
  }, [tabIndex]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tabIndex === 0) {
        const { data: res } = await API.get('/users');
        setData(prev => ({ ...prev, users: res.data }));
      } else if (tabIndex === 1) {
        const { data: res } = await API.get('/classes');
        setData(prev => ({ ...prev, classes: res.data }));
      } else if (tabIndex === 2) {
        const { data: res } = await API.get('/subjects');
        setData(prev => ({ ...prev, subjects: res.data }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, entity) => {
    if (window.confirm(`Are you sure you want to delete this ${entity}?`)) {
      try {
        await API.delete(`/${entity === 'users' ? 'users' : entity === 'classes' ? 'classes' : 'subjects'}/${id}`);
        fetchData();
      } catch (err) {
        alert('Error deleting item');
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Admin Management</Typography>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs value={tabIndex} onChange={handleTabChange} indicatorColor="primary" textColor="primary" centered>
          <Tab label="Users" />
          <Tab label="Classes" />
          <Tab label="Subjects" />
          <Tab label="Notifications" />
        </Tabs>
      </Paper>

      <Box sx={{ p: 2 }}>
        {tabIndex === 0 && <UserTable users={data.users} onDelete={(id) => handleDelete(id, 'users')} />}
        {tabIndex === 1 && <ClassTable classes={data.classes} onDelete={(id) => handleDelete(id, 'classes')} />}
        {tabIndex === 2 && <SubjectTable subjects={data.subjects} onDelete={(id) => handleDelete(id, 'subjects')} />}
        {tabIndex === 3 && <NotificationCenter />}
      </Box>
    </Container>
  );
};

const UserTable = ({ users, onDelete }) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Role</TableCell>
          <TableCell>Roll Number</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user._id}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role.toUpperCase()}</TableCell>
            <TableCell>{user.rollNumber || '-'}</TableCell>
            <TableCell align="right">
              <IconButton color="error" onClick={() => onDelete(user._id)}><DeleteIcon /></IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const ClassTable = ({ classes, onDelete }) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Class Name</TableCell>
          <TableCell>Section</TableCell>
          <TableCell>Students Count</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {classes.map((cls) => (
          <TableRow key={cls._id}>
            <TableCell>{cls.name}</TableCell>
            <TableCell>{cls.section || '-'}</TableCell>
            <TableCell>{cls.students?.length || 0}</TableCell>
            <TableCell align="right">
              <IconButton color="error" onClick={() => onDelete(cls._id)}><DeleteIcon /></IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const SubjectTable = ({ subjects, onDelete }) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Subject Name</TableCell>
          <TableCell>Class</TableCell>
          <TableCell>Teacher</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {subjects.map((sub) => (
          <TableRow key={sub._id}>
            <TableCell>{sub.name}</TableCell>
            <TableCell>{sub.class?.name || '-'}</TableCell>
            <TableCell>{sub.teacher?.name || '-'}</TableCell>
            <TableCell align="right">
              <IconButton color="error" onClick={() => onDelete(sub._id)}><DeleteIcon /></IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const NotificationCenter = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('system');
  const [priority, setPriority] = useState('medium');
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [notifyPush, setNotifyPush] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await API.get('/users');
      setUsers(data.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleUserSelect = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u._id));
    }
  };

  const sendNotification = async () => {
    if (!title || !message) {
      alert('Please fill in title and message');
      return;
    }

    if (selectedUsers.length === 0) {
      alert('Please select at least one recipient');
      return;
    }

    setLoading(true);
    try {
      await API.post('/notifications/send', {
        recipientIds: selectedUsers,
        title,
        message,
        type,
        priority,
        notificationMethods: {
          inApp: true,
          email: notifyEmail,
          push: notifyPush,
        },
      });

      alert(`Notification sent to ${selectedUsers.length} users!`);
      setTitle('');
      setMessage('');
      setSelectedUsers([]);
      setType('system');
      setPriority('medium');
      setNotifyEmail(false);
      setNotifyPush(false);
    } catch (err) {
      alert('Failed to send notification: ' + err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const sendBroadcast = async () => {
    if (!title || !message) {
      alert('Please fill in title and message');
      return;
    }

    setLoading(true);
    try {
      await API.post('/notifications/broadcast', {
        title,
        message,
        type,
        notificationMethods: {
          inApp: true,
          email: notifyEmail,
          push: notifyPush,
        },
      });

      alert('Broadcast notification sent to all users!');
      setTitle('');
      setMessage('');
      setType('system');
      setPriority('medium');
      setNotifyEmail(false);
      setNotifyPush(false);
    } catch (err) {
      alert('Failed to send broadcast: ' + err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Send Notification</Typography>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select value={type} label="Type" onChange={(e) => setType(e.target.value)}>
                <MenuItem value="system">System</MenuItem>
                <MenuItem value="attendance">Attendance</MenuItem>
                <MenuItem value="assignment">Assignment</MenuItem>
                <MenuItem value="activity">Activity</MenuItem>
                <MenuItem value="message">Message</MenuItem>
                <MenuItem value="alert">Alert</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select value={priority} label="Priority" onChange={(e) => setPriority(e.target.value)}>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Checkbox checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} />}
              label="Send Email"
            />
            <FormControlLabel
              control={<Checkbox checked={notifyPush} onChange={(e) => setNotifyPush(e.target.checked)} />}
              label="Send Push Notification"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Notification message"
            />
          </Grid>
        </Grid>

        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={sendBroadcast}
            disabled={loading}
            sx={{ mr: 1 }}
          >
            Send Broadcast
          </Button>
          <Button
            variant="outlined"
            onClick={() => setSelectedUsers([])}
          >
            Clear Selection
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Send to Specific Users</Typography>
        
        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedUsers.length === users.length && users.length > 0}
                indeterminate={selectedUsers.length > 0 && selectedUsers.length < users.length}
                onChange={handleSelectAll}
              />
            }
            label={`Select All (${selectedUsers.length}/${users.length})`}
          />
        </Box>

        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2, maxHeight: 400 }}>
          <Table stickyHeader>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedUsers.length === users.length && users.length > 0}
                    indeterminate={selectedUsers.length > 0 && selectedUsers.length < users.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => handleUserSelect(user._id)}
                    />
                  </TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role.toUpperCase()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Button
          variant="contained"
          color="success"
          onClick={sendNotification}
          disabled={loading || selectedUsers.length === 0}
        >
          Send to Selected Users ({selectedUsers.length})
        </Button>
      </Paper>
    </Box>
  );
};

export default AdminManagement;

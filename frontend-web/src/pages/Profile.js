import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Grid,
  Alert,
  Avatar,
  IconButton,
  Stack,
  CircularProgress
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import api from '../utils/api';
import { updateAuthUser } from '../store/authSlice';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [uploading, setUploading] = useState(false);

  const baseUrl = 'http://localhost:5000'; // Should ideally be in env

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.user?.name || user.name,
        email: user.user?.email || user.email,
      });
    }
  }, [user]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setUploading(true);
    try {
      const { data } = await api.put('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Update local storage/state with new avatar path
      const updatedUser = { ...(user.user || user), profileImage: data.data };
      dispatch(updateAuthUser(updatedUser));
      
      setMessage({ type: 'success', text: 'Avatar updated successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const onDetailsSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/updatedetails', formData);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    }
  };

  const onPasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      return setMessage({ type: 'error', text: 'New passwords do not match' });
    }
    try {
      await api.put('/auth/updatepassword', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setMessage({ type: 'success', text: 'Password updated successfully' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Password update failed' });
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Profile Management
      </Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      {/* Avatar Section */}
      <Paper sx={{ p: 4, mb: 4, borderRadius: 4, textAlign: 'center' }}>
        <Stack alignItems="center" spacing={2}>
          <Box sx={{ position: 'relative' }}>
            <Avatar 
              src={user?.user?.profileImage ? `${baseUrl}${user.user.profileImage}` : (user?.profileImage ? `${baseUrl}${user.profileImage}` : '')}
              sx={{ width: 120, height: 120, border: '4px solid #fff', boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}
            >
              {(user?.user?.name || user?.name || 'U').charAt(0)}
            </Avatar>
            <IconButton 
              color="primary" 
              component="label"
              disabled={uploading}
              sx={{ 
                position: 'absolute', bottom: 0, right: 0, 
                bgcolor: 'white', '&:hover': { bgcolor: '#f5f5f5' },
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
            >
              <input hidden accept="image/*" type="file" onChange={handleAvatarUpload} />
              {uploading ? <CircularProgress size={20} /> : <PhotoCamera />}
            </IconButton>
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800}>{user?.user?.name || user?.name}</Typography>
            <Typography variant="body2" color="text.secondary">{(user?.user?.role || user?.role)?.toUpperCase()}</Typography>
          </Box>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Update Details
            </Typography>
            <Box component="form" onSubmit={onDetailsSubmit}>
              <TextField
                margin="normal"
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled
              />
              <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                Update Details
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>
            <Box component="form" onSubmit={onPasswordSubmit}>
              <TextField
                margin="normal"
                fullWidth
                label="Current Password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />
              <TextField
                margin="normal"
                fullWidth
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Confirm New Password"
                type="password"
                value={passwordData.confirmNewPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
              />
              <Button type="submit" variant="contained" color="secondary" sx={{ mt: 2 }}>
                Change Password
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;

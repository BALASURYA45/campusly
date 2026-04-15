import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Paper, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ForgotPassword = () => {
  const [identifier, setIdentifier] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [resetUrl, setResetUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlRole = searchParams.get('role');

  const roleConfig = {
    student: { label: 'Roll Number', payloadKey: 'rollNumber', loginPath: '/login/student' },
    teacher: { label: 'Employee ID', payloadKey: 'employeeId', loginPath: '/login/teacher' },
    parent: { label: 'Parent ID', payloadKey: 'parentId', loginPath: '/login/parent' },
    admin: { label: 'Admin Email', payloadKey: 'email', loginPath: '/login/admin' },
  };

  const [selectedRole, setSelectedRole] = useState(roleConfig[urlRole] ? urlRole : 'auto');

  const activeConfig = roleConfig[selectedRole] || {
    label: 'Email or User ID',
    payloadKey: 'auto',
    loginPath: '/login/student',
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    setResetUrl('');

    try {
      const payload = {};
      const value = identifier.trim();
      payload.identifier = value;
      if (activeConfig.payloadKey === 'email') {
        payload.email = value.toLowerCase();
      } else if (activeConfig.payloadKey === 'rollNumber') {
        payload.rollNumber = value.toUpperCase();
      } else if (activeConfig.payloadKey === 'employeeId') {
        payload.employeeId = value.toUpperCase();
      } else if (activeConfig.payloadKey === 'parentId') {
        payload.parentId = value.toUpperCase();
      } else {
        if (value.includes('@')) {
          payload.email = value.toLowerCase();
        } else if (value.toUpperCase().startsWith('T')) {
          payload.employeeId = value.toUpperCase();
        } else if (value.toUpperCase().startsWith('P')) {
          payload.parentId = value.toUpperCase();
        } else {
          payload.rollNumber = value.toUpperCase();
        }
      }

      const response = await axios.post('http://localhost:5000/api/v1/auth/forgotpassword', payload);

      setMessage({
        type: 'success',
        text: response.data.message || 'Reset link generated successfully.',
      });

      if (response.data.resetUrl) {
        setResetUrl(response.data.resetUrl);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Forgot Password
          </Typography>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>User Type</InputLabel>
            <Select
              label="User Type"
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setIdentifier('');
              }}
            >
              <MenuItem value="auto">Auto Detect</MenuItem>
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="teacher">Teacher</MenuItem>
              <MenuItem value="parent">Parent</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="body2" align="center" sx={{ mb: 2 }}>
            Enter your {activeConfig.label.toLowerCase()}. We will generate a reset link so you can set a new password.
          </Typography>
          
          {message.text && (
            <Alert severity={message.type} sx={{ mb: 2 }}>
              {message.text}
            </Alert>
          )}

          {resetUrl && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  try {
                    const url = new URL(resetUrl);
                    navigate(url.pathname);
                  } catch {
                    navigate(resetUrl);
                  }
                }}
              >
                Open Reset Page
              </Button>
            </Alert>
          )}

          <Box component="form" onSubmit={onSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="identifier"
              label={activeConfig.label}
              name="identifier"
              autoFocus
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Reset Link'}
            </Button>
            <Button
              fullWidth
              onClick={() => navigate(activeConfig.loginPath)}
            >
              Back to Login
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword;

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, reset } from '../store/authSlice';
import { Container, Box, Typography, TextField, Button, Paper, Alert, CircularProgress } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';

const StudentLogin = () => {
  const [formData, setFormData] = useState({
    rollNumber: '',
    password: '',
  });

  const { rollNumber, password } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isSuccess || user) {
      navigate('/dashboard');
    }

    if (isError && message) {
      const timer = setTimeout(() => {
        dispatch(reset());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!rollNumber || !password) {
      alert('Please fill in all fields');
      return;
    }
    dispatch(login({ rollNumber, password, role: 'student' }));
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <SchoolIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h5" fontWeight="bold">
            Student Login
          </Typography>
        </Box>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box component="form" onSubmit={onSubmit} sx={{ mt: 1 }}>
            {isError && message && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {message}
              </Alert>
            )}
            {isSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Login successful! Redirecting...
              </Alert>
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              id="rollNumber"
              label="Roll Number (e.g., 23CS001)"
              name="rollNumber"
              autoComplete="off"
              autoFocus
              value={rollNumber}
              onChange={onChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={onChange}
            />
            <Button
              fullWidth
              onClick={() => navigate('/forgot-password')}
              sx={{ mt: 1, textTransform: 'none' }}
            >
              Forgot Password?
            </Button>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            <Button
              fullWidth
              onClick={() => navigate('/')}
              sx={{ mt: 1 }}
            >
              Back to Home
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default StudentLogin;

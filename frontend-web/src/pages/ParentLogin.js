import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, reset } from '../store/authSlice';
import { Container, Box, Typography, TextField, Button, Paper, Alert, CircularProgress } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';

const ParentLogin = () => {
  const [formData, setFormData] = useState({
    parentId: '',
    password: '',
  });

  const { parentId, password } = formData;
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
    if (!parentId || !password) {
      alert('Please fill in all fields');
      return;
    }
    dispatch(login({ parentId, password, role: 'parent' }));
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <PeopleIcon sx={{ fontSize: 40, color: '#ff9800' }} />
          <Typography variant="h5" fontWeight="bold">
            Parent Login
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
              id="parentId"
              label="Parent ID"
              name="parentId"
              autoComplete="off"
              autoFocus
              value={parentId}
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
              variant="text"
              onClick={() => navigate('/forgot-password?role=parent')}
              sx={{ mt: 1 }}
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

export default ParentLogin;

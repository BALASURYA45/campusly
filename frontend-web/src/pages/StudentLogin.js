import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, reset } from '../store/authSlice';
import { Container, Box, Typography, TextField, Button, Paper, Alert, CircularProgress } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';

const validateRollNumber = (rollNumber) => {
  const rollNumberPattern = /^[A-Z0-9]+$/; // Supports alphanumeric roll numbers
  return rollNumberPattern.test(rollNumber);
};

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
    const normalizedRollNumber = rollNumber.trim().toUpperCase();

    if (!rollNumber || !password) {
      alert('Please fill in all fields');
      return;
    }

    if (!validateRollNumber(normalizedRollNumber)) {
      alert('Invalid roll number format');
      return;
    }

    dispatch(login({ rollNumber: normalizedRollNumber, password, role: 'student' }));
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 3, marginTop: 5 }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <SchoolIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h5" gutterBottom>
            Student Login
          </Typography>
        </Box>
        {isError && message && (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {message}
          </Alert>
        )}
        <form onSubmit={onSubmit}>
          <TextField
            label="Roll Number"
            name="rollNumber"
            value={rollNumber}
            onChange={(e) => setFormData((prev) => ({ ...prev, rollNumber: e.target.value.toUpperCase() }))}
            fullWidth
            margin="normal"
            required
          />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={password}
              onChange={onChange}
              fullWidth
              margin="normal"
              required
            />
            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/forgot-password?role=student')}
              sx={{ mt: 1 }}
            >
              Forgot Password?
            </Button>
            <Box display="flex" justifyContent="center" marginTop={2}>
              {isLoading ? (
                <CircularProgress />
              ) : (
              <Button type="submit" variant="contained" color="primary">
                Login
              </Button>
            )}
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default StudentLogin;

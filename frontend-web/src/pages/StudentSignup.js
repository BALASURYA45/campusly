import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, reset } from '../store/authSlice';
import { 
  Container, Box, Typography, TextField, Button, Paper, Alert, 
  CircularProgress, Grid, Card, CardContent, Stepper, Step, StepLabel 
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';

const StudentSignup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    rollNumber: '',
    password: '',
    name: '',
    email: 'balasuryad13062006@gmail.com',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userExists, setUserExists] = useState(false);
  const [existingUserData, setExistingUserData] = useState(null);

  const { rollNumber, password, name, email } = formData;
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

  const verifyCredentials = async (e) => {
    e.preventDefault();
    if (!rollNumber || !password) {
      setError('Please enter both Roll Number and Password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/auth/verify-student-credentials`,
        { rollNumber, password }
      );

      if (response.data.success) {
        setUserExists(true);
        setExistingUserData(response.data.data);
        setFormData((prevState) => ({
          ...prevState,
          name: response.data.data.name || '',
          email: response.data.data.email || '',
        }));
        setSuccess('Credentials verified! Complete your profile.');
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Roll Number or Password');
    } finally {
      setLoading(false);
    }
  };

  const completeSignup = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/students/${existingUserData._id}/complete-signup`,
        { name, email }
      );

      if (response.data.success) {
        setSuccess('Signup completed! Logging you in...');
        setTimeout(() => {
          dispatch(login({ rollNumber, password }));
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error completing signup');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setStep(1);
    setUserExists(false);
    setExistingUserData(null);
    setError('');
    setSuccess('');
    setFormData({ rollNumber: '', password: '', name: '', email: '' });
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <SchoolIcon sx={{ fontSize: 40, color: 'success.main' }} />
          <Typography variant="h5" fontWeight="bold">
            Student Signup
          </Typography>
        </Box>

        <Stepper activeStep={step - 1} sx={{ width: '100%', mb: 3 }}>
          <Step>
            <StepLabel>Verify Credentials</StepLabel>
          </Step>
          <Step>
            <StepLabel>Complete Profile</StepLabel>
          </Step>
        </Stepper>

        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          {step === 1 && (
            <Box component="form" onSubmit={verifyCredentials}>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                Use your Roll Number and Password from the enrollment list to sign up.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}

              <TextField
                margin="normal"
                required
                fullWidth
                id="rollNumber"
                label="Roll Number (e.g., 23CS001)"
                name="rollNumber"
                placeholder="e.g., 23CS001"
                autoComplete="off"
                autoFocus
                value={rollNumber}
                onChange={onChange}
                disabled={loading}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={onChange}
                disabled={loading}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="success"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify & Continue'}
              </Button>

              <Button
                fullWidth
                onClick={() => navigate('/')}
                sx={{ mt: 1 }}
              >
                Back to Home
              </Button>
            </Box>
          )}

          {step === 2 && userExists && (
            <Box component="form" onSubmit={completeSignup}>
              <Card sx={{ mb: 3, bgcolor: 'success.light' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Credentials Verified!
                    </Typography>
                    <Typography variant="body2">
                      Roll No: {rollNumber}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Complete your profile with your name and email address.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}

              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                autoComplete="name"
                value={name}
                onChange={onChange}
                disabled={loading}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={onChange}
                disabled
              />

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={goBack}
                    disabled={loading}
                  >
                    Back
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="success"
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Complete Signup'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default StudentSignup;

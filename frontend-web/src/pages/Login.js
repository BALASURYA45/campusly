import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { login, reset } from '../store/authSlice';
import { 
  Container, Box, Typography, TextField, Button, Paper, Alert, 
  Avatar, IconButton, InputAdornment, Stack, Fade, Divider
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Login = () => {
  const { role } = useParams();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rollNumber: '',
    employeeId: '',
    parentId: ''
  });

  const { email, password, rollNumber, employeeId, parentId } = formData;

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
    const loginData = { password };
    
    if (role === 'student') loginData.rollNumber = rollNumber;
    else if (role === 'teacher') loginData.employeeId = employeeId;
    else if (role === 'parent') loginData.parentId = parentId;
    else loginData.email = email;

    dispatch(login(loginData));
  };

  const getRoleConfig = () => {
    switch(role) {
      case 'student': return { label: 'Student Portal', icon: SchoolIcon, color: '#3B82F6', idField: 'rollNumber', idLabel: 'Roll Number (e.g. 23CS001)' };
      case 'teacher': return { label: 'Teacher Portal', icon: PersonIcon, color: '#10B981', idField: 'employeeId', idLabel: 'Employee ID' };
      case 'parent': return { label: 'Parent Portal', icon: PeopleIcon, color: '#F59E0B', idField: 'parentId', idLabel: 'Parent ID' };
      case 'admin': return { label: 'Admin Portal', icon: AdminPanelSettingsIcon, color: '#8B5CF6', idField: 'email', idLabel: 'Admin Email' };
      default: return { label: 'Secure Login', icon: LockOutlinedIcon, color: '#1E293B', idField: 'email', idLabel: 'Email Address' };
    }
  };

  const config = getRoleConfig();

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
      py: 4
    }}>
      <Container maxWidth="sm">
        <Fade in timeout={800}>
          <Paper elevation={0} sx={{ 
            p: { xs: 4, md: 6 }, 
            borderRadius: 6, 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <IconButton 
              onClick={() => navigate('/')} 
              sx={{ position: 'absolute', top: 20, left: 20 }}
            >
              <ArrowBackIcon />
            </IconButton>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
              <Avatar sx={{ 
                m: 1, 
                bgcolor: config.color, 
                width: 64, height: 64,
                boxShadow: `0 8px 16px ${config.color}40`
              }}>
                <config.icon sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h4" fontWeight={900} sx={{ mt: 2 }}>
                {config.label}
              </Typography>
              <Typography color="text.secondary" fontWeight={500}>
                Enter your credentials to continue
              </Typography>
            </Box>

            {isError && message && (
              <Alert severity="error" variant="filled" sx={{ mb: 3, borderRadius: 3 }}>
                {message}
              </Alert>
            )}

            <Box component="form" onSubmit={onSubmit}>
              <Stack spacing={3}>
                <TextField
                  required
                  fullWidth
                  label={config.idLabel}
                  name={config.idField}
                  autoComplete={config.idField}
                  autoFocus
                  value={formData[config.idField]}
                  onChange={onChange}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
                
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={onChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />

                <Box sx={{ textAlign: 'right' }}>
                  <Button 
                    variant="text" 
                    color="primary" 
                    onClick={() => navigate('/forgot-password')}
                    sx={{ fontWeight: 700 }}
                  >
                    Forgot Password?
                  </Button>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  sx={{ 
                    py: 2, 
                    borderRadius: 3, 
                    fontSize: '1.1rem', 
                    fontWeight: 800,
                    boxShadow: `0 12px 24px ${config.color}40`,
                    bgcolor: config.color,
                    '&:hover': { bgcolor: config.color, filter: 'brightness(0.9)' }
                  }}
                >
                  {isLoading ? 'Processing...' : 'Secure Sign In'}
                </Button>
              </Stack>
            </Box>

            <Box sx={{ mt: 5, textAlign: 'center' }}>
              <Divider sx={{ mb: 3 }}>
                <Typography variant="caption" color="text.secondary" sx={{ px: 2, fontWeight: 700, textTransform: 'uppercase' }}>
                  Smart Curriculum Ecosystem
                </Typography>
              </Divider>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Authentication powered by Enterprise JWT security
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default Login;

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer, 
  List, ListItem, ListItemText, Divider, useMediaQuery, useTheme, ListItemIcon,
  Avatar, Tooltip, Menu, MenuItem
} from '@mui/material';
import { logout, reset } from '../store/authSlice';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import SchoolIcon from '@mui/icons-material/School';
import GroupIcon from '@mui/icons-material/Group';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationBell from './NotificationBell';

const Header = ({ toggleColorMode, mode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/');
    setMobileOpen(false);
    handleProfileMenuClose();
  };

  const navigationItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon />, show: !!user },
    { 
      label: 'Classes', 
      path: '/classes', 
      icon: <GroupIcon />, 
      show: user?.role === 'teacher' || user?.role === 'admin' || user?.role === 'superadmin' 
    },
    { 
      label: 'Attendance', 
      path: user?.role === 'student' ? '/my-attendance' : '/attendance', 
      icon: <SchoolIcon />, 
      show: user && (user.role === 'student' || user.role === 'teacher' || user.role === 'admin') 
    },
    { 
      label: 'Assignments', 
      path: user?.role === 'student' ? '/my-assignments' : '/teacher/assignments', 
      icon: <AssessmentIcon />, 
      show: user && (user.role === 'student' || user.role === 'teacher') 
    },
    { 
      label: 'Curriculum', 
      path: '/curriculum', 
      icon: <SchoolIcon />, 
      show: user?.role === 'teacher' || user?.role === 'admin' 
    },
    { 
      label: 'Reports', 
      path: '/reports', 
      icon: <AssessmentIcon />, 
      show: user?.role === 'teacher' || user?.role === 'admin' 
    },
  ];

  const handleNavClick = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          bgcolor: mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(11, 20, 55, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: 'text.primary',
          px: { md: 4 }
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', height: 70 }}>
          <Box 
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 800, 
                background: 'linear-gradient(135deg, #0062ff 0%, #7c4dff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em'
              }}
            >
              Campusly
            </Typography>
          </Box>

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {user && navigationItems.filter(i => i.show).map((item) => (
                <Button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  sx={{
                    color: isActive(item.path) ? 'primary.main' : 'text.secondary',
                    fontWeight: isActive(item.path) ? 700 : 600,
                    px: 2,
                    '&:hover': {
                      color: 'primary.main',
                      bgcolor: 'rgba(0, 98, 255, 0.05)',
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}
              
              <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                {user && <NotificationBell />}
                <IconButton onClick={toggleColorMode} color="inherit">
                  {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>

                {user ? (
                  <>
                    <Tooltip title="Account settings">
                      <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0, ml: 1 }}>
                        <Avatar 
                          sx={{ 
                            width: 35, 
                            height: 35, 
                            bgcolor: 'primary.main',
                            fontSize: '0.9rem',
                            fontWeight: 700
                          }}
                        >
                          {(user.name || user.user?.name || 'U').charAt(0).toUpperCase()}
                        </Avatar>
                      </IconButton>
                    </Tooltip>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleProfileMenuClose}
                      PaperProps={{
                        sx: { mt: 1.5, minWidth: 180, borderRadius: 3, boxShadow: theme.shadows[4] }
                      }}
                    >
                      <MenuItem onClick={() => { navigate('/profile'); handleProfileMenuClose(); }}>
                        <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                        Profile
                      </MenuItem>
                      {user.role === 'admin' && (
                        <MenuItem onClick={() => { navigate('/admin/manage'); handleProfileMenuClose(); }}>
                          <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                          Management
                        </MenuItem>
                      )}
                      <Divider />
                      <MenuItem onClick={onLogout} sx={{ color: 'error.main' }}>
                        <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                        Logout
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  <Button 
                    variant="contained" 
                    onClick={() => navigate('/')}
                    sx={{ borderRadius: '10px' }}
                  >
                    Login
                  </Button>
                )}
              </Box>
            </Box>
          )}

          {isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {user && <NotificationBell />}
              <IconButton onClick={() => setMobileOpen(true)} color="inherit">
                <MenuIcon />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{ sx: { width: 280, borderRadius: '20px 0 0 20px' } }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={800}>Menu</Typography>
            <IconButton onClick={() => setMobileOpen(false)}><CloseIcon /></IconButton>
          </Box>
          
          <List sx={{ gap: 1, display: 'flex', flexDirection: 'column' }}>
            {user ? (
              <>
                {navigationItems.filter(i => i.show).map((item) => (
                  <ListItem 
                    button 
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    sx={{ 
                      borderRadius: 2,
                      bgcolor: isActive(item.path) ? 'rgba(0, 98, 255, 0.08)' : 'transparent',
                      color: isActive(item.path) ? 'primary.main' : 'text.primary'
                    }}
                  >
                    <ListItemIcon sx={{ color: isActive(item.path) ? 'primary.main' : 'inherit' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600 }} />
                  </ListItem>
                ))}
                <Divider sx={{ my: 2 }} />
                <ListItem button onClick={onLogout} sx={{ color: 'error.main', borderRadius: 2 }}>
                  <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
                  <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600 }} />
                </ListItem>
              </>
            ) : (
              <Button fullWidth variant="contained" onClick={() => navigate('/')}>Login</Button>
            )}
            <Divider sx={{ my: 2 }} />
            <ListItem button onClick={toggleColorMode} sx={{ borderRadius: 2 }}>
              <ListItemIcon>{mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}</ListItemIcon>
              <ListItemText primary={`${mode === 'dark' ? 'Light' : 'Dark'} Mode`} />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Header;

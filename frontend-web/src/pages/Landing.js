import React from 'react';
import { 
  Container, Typography, Box, Button, Grid, Paper, Card, CardContent, 
  Chip, Stack, useMediaQuery, useTheme, List, ListItem, ListItemIcon, ListItemText, Dialog,
  DialogTitle, DialogContent, Avatar, Fade
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import GroupsIcon from '@mui/icons-material/Groups';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleIcon from '@mui/icons-material/People';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

const Landing = () => {
  const [openDialog, setOpenDialog] = React.useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const loginRoles = [
    { 
      role: 'student', 
      label: 'Student Portal', 
      icon: SchoolIcon,
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      description: 'Access assignments, attendance, and performance'
    },
    { 
      role: 'teacher', 
      label: 'Teacher Portal', 
      icon: PersonIcon,
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      description: 'Manage classes, marking, and curriculum'
    },
    { 
      role: 'parent', 
      label: 'Parent Portal', 
      icon: PeopleIcon,
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      description: 'Monitor child progress and notifications'
    },
    { 
      role: 'admin', 
      label: 'Admin Portal', 
      icon: AdminPanelSettingsIcon,
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      description: 'System control and user management'
    }
  ];

  const features = [
    {
      icon: QrCodeScannerIcon,
      title: 'Smart Attendance',
      description: 'High-speed QR code tracking with location-based verification and manual overrides.'
    },
    {
      icon: AssignmentIcon,
      title: 'Course Management',
      description: 'Seamless assignment workflows with automated grading support and rich feedback.'
    },
    {
      icon: BarChartIcon,
      title: 'Predictive Analytics',
      description: 'Insightful performance forecasting and detailed student behavior analytics.'
    },
    {
      icon: SecurityIcon,
      title: 'Bank-Grade Security',
      description: 'Advanced JWT protocols and multi-layered RBAC protection for all sensitive data.'
    },
    {
      icon: NotificationsActiveIcon,
      title: 'Instant Alerts',
      description: 'Omnichannel notifications via Email, SMS, and Push for critical updates.'
    },
    {
      icon: GroupsIcon,
      title: 'Universal Access',
      description: 'Native experience for all stakeholders with personalized, role-specific interfaces.'
    }
  ];

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      {/* Premium Hero Section */}
      <Box sx={{ 
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        overflow: 'hidden',
        color: 'white'
      }}>
        <Container maxWidth="xl">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} lg={7}>
              <Fade in timeout={1000}>
                <Box>
                  <Chip 
                    label="Smart Curriculum V2.0" 
                    sx={{ 
                      mb: 3, 
                      fontWeight: 700, 
                      borderRadius: 2,
                      bgcolor: 'rgba(59, 130, 246, 0.9)',
                      color: 'white'
                    }}
                  />
                  <Typography variant="h1" fontWeight={900} sx={{ 
                    fontSize: { xs: '3rem', md: '5rem' },
                    lineHeight: 1.1,
                    mb: 3,
                    textShadow: '0 4px 10px rgba(0,0,0,0.3)'
                  }}>
                    Empowering <br />
                    Future-Ready <br />
                    Education.
                  </Typography>
                  <Typography variant="h5" sx={{ mb: 5, maxWidth: 600, fontWeight: 500, lineHeight: 1.6, opacity: 0.9 }}>
                    A centralized digital platform for students, teachers, parents, and admins. 
                    Manage attendance, curriculum, and activities with unmatched efficiency.
                  </Typography>
                  
                  {/* Direct Login Buttons Section */}
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>
                      Select Your Portal to Login
                    </Typography>
                    <Grid container spacing={2}>
                      {loginRoles.map((role) => (
                        <Grid item xs={6} sm={3} key={role.role}>
                          <Paper
                            onClick={() => navigate(`/login/${role.role}`)}
                            sx={{
                              p: 2,
                              borderRadius: 4,
                              cursor: 'pointer',
                              textAlign: 'center',
                              bgcolor: 'rgba(255, 255, 255, 0.1)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              color: 'white',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-10px)',
                                bgcolor: 'rgba(255, 255, 255, 0.2)',
                                borderColor: 'white',
                                boxShadow: '0 15px 30px rgba(0,0,0,0.2)'
                              }
                            }}
                          >
                            <Avatar sx={{ 
                              background: role.gradient, 
                              width: 50, 
                              height: 50, 
                              mx: 'auto',
                              mb: 2,
                              boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                            }}>
                              <role.icon />
                            </Avatar>
                            <Typography variant="subtitle1" fontWeight={800}>
                              {role.label.split(' ')[0]}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Box>
              </Fade>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Feature Grid */}
      <Container maxWidth="xl" sx={{ py: 15 }}>
        <Box sx={{ textAlign: 'center', mb: 10 }}>
          <Typography variant="h2" fontWeight={800} gutterBottom>Powerful Capabilities</Typography>
          <Typography variant="h6" color="text.secondary">Everything you need to manage a modern campus</Typography>
        </Box>
        <Grid container spacing={4}>
          {features.map((feature, idx) => (
            <Grid item xs={12} md={4} key={idx}>
              <Card sx={{ 
                p: 4, height: '100%', borderRadius: 6,
                border: '1px solid transparent',
                '&:hover': {
                  borderColor: 'primary.light',
                  transform: 'translateY(-10px)',
                  boxShadow: '0 30px 60px rgba(0,0,0,0.05)'
                }
              }}>
                <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', mb: 3, width: 60, height: 60 }}>
                  <feature.icon fontSize="large" />
                </Avatar>
                <Typography variant="h5" fontWeight={800} gutterBottom>{feature.title}</Typography>
                <Typography variant="body1" color="text.secondary" lineHeight={1.8}>
                  {feature.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Role Selection Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 6, p: 2, bgcolor: 'background.paper' }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
          <Typography variant="h4" fontWeight={900}>Choose Portal</Typography>
          <Typography color="text.secondary">Select your role to access your dashboard</Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 4 }}>
          <Grid container spacing={2}>
            {loginRoles.map((item) => (
              <Grid item xs={12} key={item.role}>
                <Paper
                  onClick={() => navigate(`/login/${item.role}`)}
                  sx={{
                    p: 3, borderRadius: 4, cursor: 'pointer',
                    display: 'flex', alignItems: 'center',
                    transition: 'all 0.2s',
                    border: '2px solid transparent',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'action.hover',
                      transform: 'scale(1.02)'
                    }
                  }}
                >
                  <Avatar sx={{ 
                    background: item.gradient, width: 56, height: 56, mr: 3,
                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                  }}>
                    <item.icon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={800}>{item.label}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.description}</Typography>
                  </Box>
                  <ArrowForwardIcon sx={{ ml: 'auto', color: 'text.disabled' }} />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <Box sx={{ bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider', py: 6 }}>
        <Container maxWidth="xl">
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Typography variant="h6" fontWeight={900} color="primary">Smart Curriculum</Typography>
              <Typography variant="body2" color="text.secondary">Industry-standard MERN Education Solution</Typography>
            </Grid>
            <Grid item>
              <Typography variant="body2" color="text.secondary">© 2025 Smart Curriculum. Built for Excellence.</Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing;
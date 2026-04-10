import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography } from '@mui/material';
import AdminDashboard from './AdminDashboard';
import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';
import ParentDashboard from './ParentDashboard';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const role = user?.user?.role || user?.role;

  if (role === 'admin' || role === 'superadmin') {
    return <AdminDashboard />;
  }

  if (role === 'teacher') {
    return <TeacherDashboard />;
  }

  if (role === 'student') {
    return <StudentDashboard />;
  }

  if (role === 'parent') {
    return <ParentDashboard />;
  }

  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h4">Role Not Identified</Typography>
      <Typography variant="body1">Please contact support if you are seeing this message.</Typography>
    </Box>
  );
};

export default Dashboard;

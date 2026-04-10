import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography, Box, Button, Card, CardContent, Avatar, Stack } from '@mui/material';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import API from '../utils/api';
import { downloadCSV } from '../utils/csvExport';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import ClassIcon from '@mui/icons-material/Class';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import DownloadIcon from '@mui/icons-material/Download';
import SettingsIcon from '@mui/icons-material/Settings';
import SyncIcon from '@mui/icons-material/Sync';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const StatCard = ({ title, count, icon, color, gradient }) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', mb: 1 }}>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={800} color="text.primary">
            {count}
          </Typography>
        </Box>
        <Avatar 
          sx={{ 
            bgcolor: color, 
            background: gradient,
            width: 56, 
            height: 56,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await API.get('/reports/stats');
      setStats(data.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleSyncTwins = async () => {
    setSyncing(true);
    try {
      await API.post('/digital-twin/sync');
      alert('Digital Twins synchronized successfully!');
      fetchStats();
    } catch (err) {
      console.error('Sync failed:', err);
      alert('Failed to sync digital twins');
    } finally {
      setSyncing(false);
    }
  };

  if (!stats) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <Typography variant="h6" color="text.secondary">Loading Statistics...</Typography>
    </Box>
  );

  const attendanceData = {
    labels: stats.attendanceStats.map(s => s._id),
    datasets: [
      {
        label: 'Attendance Status',
        data: stats.attendanceStats.map(s => s.count),
        backgroundColor: [
          '#01b574',
          '#ee5d50',
          '#ffb547',
        ],
        borderRadius: 8,
      },
    ],
  };

  const userDistData = {
    labels: stats.roleStats?.map(s => s._id.toUpperCase()) || ['Students', 'Teachers'],
    datasets: [
      {
        data: stats.roleStats?.map(s => s.count) || [stats.totalStudents, stats.totalTeachers],
        backgroundColor: ['#0062ff', '#7c4dff', '#01b574', '#ffb547'],
        borderWidth: 0,
      },
    ],
  };

  const activityData = {
    labels: stats.activityStats?.map(s => s._id) || [],
    datasets: [
      {
        label: 'Activities',
        data: stats.activityStats?.map(s => s.count) || [],
        backgroundColor: '#7c4dff',
        borderRadius: 8,
      },
    ],
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ 
        mb: 4, 
        p: 4, 
        borderRadius: 6, 
        background: 'linear-gradient(135deg, #0062ff 0%, #7c4dff 100%)',
        color: 'white',
        boxShadow: '0 10px 30px rgba(0, 98, 255, 0.2)'
      }}>
        <Grid container alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h3" fontWeight={800} gutterBottom>
              Admin Dashboard
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500 }}>
              Institution Analytics and Real-time Monitoring Overview
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' }, mt: { xs: 3, md: 0 } }}>
            <Stack direction="row" spacing={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
              <Button 
                variant="contained"
                disabled={syncing}
                startIcon={<SyncIcon />}
                onClick={handleSyncTwins}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}
              >
                {syncing ? 'Syncing...' : 'Sync Twins'}
              </Button>
              <Button 
                variant="contained" 
                startIcon={<SettingsIcon />}
                onClick={() => window.location.href='/admin/manage'}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}
              >
                Manage System
              </Button>
              <Button 
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => downloadCSV(stats.attendanceStats, 'attendance_report.csv')}
                sx={{ 
                  bgcolor: 'white', 
                  color: 'primary.main',
                  '&:hover': { bgcolor: '#f0f0f0' }
                }}
              >
                Export CSV
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Students" 
            count={stats.totalStudents} 
            icon={<SchoolIcon />} 
            color="#0062ff"
            gradient="linear-gradient(135deg, #0062ff 0%, #3381ff 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Teachers" 
            count={stats.totalTeachers} 
            icon={<PersonIcon />} 
            color="#7c4dff"
            gradient="linear-gradient(135deg, #7c4dff 0%, #9670ff 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Active Classes" 
            count={stats.totalClasses} 
            icon={<ClassIcon />} 
            color="#01b574"
            gradient="linear-gradient(135deg, #01b574 0%, #33c38f 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Activities" 
            count={stats.totalActivities} 
            icon={<LocalActivityIcon />} 
            color="#ffb547"
            gradient="linear-gradient(135deg, #ffb547 0%, #ffc670 100%)"
          />
        </Grid>

        {/* Main Analytics */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                Attendance Trends Overview
              </Typography>
              <Box sx={{ height: 350 }}>
                <Bar 
                  data={attendanceData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: { beginAtZero: true, grid: { display: false } },
                      x: { grid: { display: false } }
                    }
                  }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                User Composition
              </Typography>
              <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Pie 
                  data={userDistData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                Activity Participation by Status
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar 
                  data={activityData} 
                  options={{ 
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { beginAtZero: true, grid: { display: false } },
                      y: { grid: { display: false } }
                    }
                  }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;

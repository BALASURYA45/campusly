import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Grid, Paper, Box, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Divider } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import API from '../utils/api';
import { useSelector } from 'react-redux';

const StudentAttendanceView = () => {
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);

  const fetchAttendance = useCallback(async () => {
    try {
      const { data: recordsRes } = await API.get('/attendance/me');
      const studentRecords = recordsRes.data || [];
      setAttendance(studentRecords.sort((a, b) => new Date(b.date) - new Date(a.date)));

      const groupedStats = studentRecords.reduce((acc, record) => {
        acc[record.status] = (acc[record.status] || 0) + 1;
        return acc;
      }, {});

      setStats(
        Object.entries(groupedStats).map(([status, count]) => ({
          _id: status,
          count,
        }))
      );
    } catch (err) {
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const pieData = stats ? {
    labels: stats.map(s => s._id),
    datasets: [{
      data: stats.map(s => s.count),
      backgroundColor: ['#4caf50', '#f44336', '#ff9800', '#2196f3'],
    }]
  } : null;

  const calculatePercentage = () => {
    if (!stats || stats.length === 0) return 0;
    const present = stats.find(s => s._id === 'Present')?.count || 0;
    const late = stats.find(s => s._id === 'Late')?.count || 0;
    const od = stats.find(s => s._id === 'On-Duty')?.count || 0;
    const half = stats.find(s => s._id === 'Half-Day')?.count || 0;
    
    const total = stats.reduce((acc, curr) => acc + curr.count, 0);
    return (((present + late + od + (half * 0.5)) / total) * 100).toFixed(1);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>My Attendance Report</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <Typography variant="h6" gutterBottom>Attendance Percentage</Typography>
            <Box sx={{ position: 'relative', display: 'inline-flex', my: 2 }}>
              <CircularProgress variant="determinate" value={parseFloat(calculatePercentage())} size={120} thickness={5} />
              <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h4" component="div" color="textSecondary">{`${calculatePercentage()}%`}</Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="textSecondary">Keep it above 75%!</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Distribution</Typography>
            {pieData ? <Pie data={pieData} /> : <Typography>No data available</Typography>}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Summary</Typography>
            {stats?.map(s => (
              <Box key={s._id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>{s._id}:</Typography>
                <Typography fontWeight="bold">{s.count}</Typography>
              </Box>
            ))}
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Typography fontWeight={700}>Engagement Score:</Typography>
              <Typography fontWeight={700} color="primary">{user?.digitalTwin?.engagementScore || 0}%</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendance.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                    <TableCell>{record.class?.name || 'General'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={record.status} 
                        size="small"
                        color={
                          record.status === 'Present' ? 'success' : 
                          record.status === 'Absent' ? 'error' : 
                          record.status === 'Late' ? 'warning' : 
                          record.status === 'On-Duty' ? 'secondary' : 'info'
                        } 
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {attendance.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">No attendance records found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Container>
  );
};

export default StudentAttendanceView;

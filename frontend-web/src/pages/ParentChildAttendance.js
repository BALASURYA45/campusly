import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  CircularProgress,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import API from '../utils/api';

const ParentChildAttendance = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchChildAttendance = useCallback(async () => {
    if (!childId) return;

    try {
      const { data: meRes } = await API.get('/auth/me');
      const linkedChild = (meRes.data.children || []).find((c) => c._id === childId);
      setChild(linkedChild || null);

      const { data: attendanceRes } = await API.get(`/reports/attendance/${childId}`);
      setStats(attendanceRes.data);

      const { data: recordsRes } = await API.get(`/attendance/student/${childId}`);
      const childRecords = recordsRes.data || [];
      setAttendance(childRecords.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (err) {
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    fetchChildAttendance();
  }, [fetchChildAttendance]);

  const pieData = stats
    ? {
        labels: stats.map((status) => status._id),
        datasets: [
          {
            data: stats.map((status) => status.count),
            backgroundColor: ['#4caf50', '#f44336', '#ff9800', '#2196f3'],
          },
        ],
      }
    : null;

  const calculatePercentage = () => {
    if (!stats || stats.length === 0) return 0;

    const present = stats.find((status) => status._id === 'Present')?.count || 0;
    const late = stats.find((status) => status._id === 'Late')?.count || 0;
    const onDuty = stats.find((status) => status._id === 'On-Duty')?.count || 0;
    const halfDay = stats.find((status) => status._id === 'Half-Day')?.count || 0;
    const total = stats.reduce((sum, status) => sum + status.count, 0);

    return (((present + late + onDuty + halfDay * 0.5) / total) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button onClick={() => navigate('/parent')} sx={{ mb: 2 }}>
        Back to Dashboard
      </Button>

      <Typography variant="h4" gutterBottom>
        {child?.name}'s Attendance Report
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Attendance Percentage
              </Typography>
              <Box sx={{ position: 'relative', display: 'inline-flex', my: 2 }}>
                <CircularProgress
                  variant="determinate"
                  value={parseFloat(calculatePercentage())}
                  size={120}
                  thickness={5}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h4" component="div">
                    {`${calculatePercentage()}%`}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Distribution
              </Typography>
              {pieData ? <Pie data={pieData} /> : <Typography>No data available</Typography>}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Summary
              </Typography>
              {stats?.map((status) => (
                <Box
                  key={status._id}
                  sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
                >
                  <Typography variant="body2">{status._id}:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {status.count}
                  </Typography>
                </Box>
              ))}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Typography variant="body2" fontWeight={700}>
                  Engagement Score:
                </Typography>
                <Typography variant="body2" fontWeight={700} color="primary">
                  {child?.digitalTwin?.engagementScore || 0}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
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
                          record.status === 'Present'
                            ? 'success'
                            : record.status === 'Absent'
                              ? 'error'
                              : record.status === 'Late'
                                ? 'warning'
                                : record.status === 'On-Duty'
                                  ? 'secondary'
                                  : 'info'
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {attendance.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No attendance records found.
                    </TableCell>
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

export default ParentChildAttendance;

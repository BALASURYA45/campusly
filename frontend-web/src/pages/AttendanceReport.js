import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Grid, Card, CardContent, Select, MenuItem,
  TextField, Button, Table, TableBody, TableCell, TableHead, TableRow,
  Chip, Box, Alert, FormControl, InputLabel, Avatar, Stack, Divider, IconButton
} from '@mui/material';
import { Bar, Pie } from 'react-chartjs-2';
import API from '../utils/api';
import { useSelector } from 'react-redux';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FilterListIcon from '@mui/icons-material/FilterList';

const AttendanceReport = () => {
  const { user } = useSelector((state) => state.auth);
  const [reportType, setReportType] = useState('monthly');
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, [user]);

  const fetchClasses = async () => {
    try {
      const { data } = await API.get('/classes');
      const teacherClasses = user.role === 'teacher' 
        ? data.data.filter(c => c.teacher && (c.teacher._id === user.id || c.teacher === user.id))
        : data.data;
      setClasses(teacherClasses);
      if (teacherClasses.length > 0) {
        setSelectedClass(teacherClasses[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const generateMonthlyReport = async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      const [year, monthNum] = month.split('-');
      const startDate = new Date(year, parseInt(monthNum) - 1, 1);
      const endDate = new Date(year, parseInt(monthNum), 0);

      const { data: attRes } = await API.get('/attendance');
      const classAttendance = attRes.data.filter(a => a.class === selectedClass || a.class?._id === selectedClass);
      
      const monthlyAttendance = classAttendance.filter(a => {
        const attDate = new Date(a.date);
        return attDate >= startDate && attDate <= endDate;
      });

      setAttendance(monthlyAttendance);

      const statusCounts = {};
      monthlyAttendance.forEach(a => {
        statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
      });

      setStats(statusCounts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = (status) => {
    if (!stats || Object.keys(stats).length === 0) return 0;
    const total = Object.values(stats).reduce((a, b) => a + b, 0);
    return ((stats[status] || 0) / total * 100).toFixed(1);
  };

  const chartData = stats ? {
    labels: Object.keys(stats),
    datasets: [{
      label: 'Attendance Count',
      data: Object.values(stats),
      backgroundColor: ['#10B981', '#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6'],
      borderWidth: 0,
      borderRadius: 4
    }]
  } : null;

  const getStudentStats = () => {
    const studentStats = {};
    attendance.forEach(a => {
      const sId = a.student?._id || a.student;
      if (!studentStats[sId]) {
        const studentObj = typeof a.student === 'object' ? a.student : {};
        studentStats[sId] = { 
          name: studentObj.name || 'Unknown', 
          present: 0, 
          absent: 0, 
          late: 0, 
          onDuty: 0, 
          halfDay: 0,
          total: 0,
          engagementScore: studentObj.digitalTwin?.engagementScore || 0
        };
      }
      studentStats[sId].total++;
      if (a.status === 'Present') studentStats[sId].present++;
      else if (a.status === 'Absent') studentStats[sId].absent++;
      else if (a.status === 'Late') studentStats[sId].late++;
      else if (a.status === 'On-Duty') studentStats[sId].onDuty++;
      else if (a.status === 'Half-Day') studentStats[sId].halfDay++;
    });
    return Object.entries(studentStats).map(([id, data]) => ({
      id,
      ...data,
      percentage: (( (data.present + data.late + data.onDuty + (data.halfDay * 0.5)) / data.total) * 100).toFixed(1)
    }));
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3" fontWeight={800} gutterBottom>
              Attendance Analytics
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
              Deep dive into class performance and attendance patterns
            </Typography>
          </Grid>
          <Grid item>
            <Button 
              variant="contained" 
              startIcon={<FileDownloadIcon />}
              sx={{ borderRadius: 3, px: 3, py: 1 }}
            >
              Export PDF
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Card sx={{ mb: 4, borderRadius: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
            <FilterListIcon color="primary" />
            <Typography variant="h6" fontWeight={700}>Report Filters</Typography>
          </Stack>
          <Grid container spacing={3} alignItems="flex-end">
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, textTransform: 'uppercase', color: 'text.secondary' }}>
                Report Category
              </Typography>
              <Select
                value={reportType}
                fullWidth
                onChange={(e) => setReportType(e.target.value)}
                sx={{ borderRadius: 3 }}
              >
                <MenuItem value="monthly">Monthly Overview</MenuItem>
                <MenuItem value="subjectwise">Subject Distribution</MenuItem>
                <MenuItem value="individual">Individual Tracking</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, textTransform: 'uppercase', color: 'text.secondary' }}>
                Select Class
              </Typography>
              <Select
                value={selectedClass}
                fullWidth
                onChange={(e) => setSelectedClass(e.target.value)}
                sx={{ borderRadius: 3 }}
              >
                {classes.map(cls => (
                  <MenuItem key={cls._id} value={cls._id}>{cls.name}</MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, textTransform: 'uppercase', color: 'text.secondary' }}>
                Time Period
              </Typography>
              <TextField
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button 
                variant="contained" 
                fullWidth 
                size="large"
                onClick={generateMonthlyReport} 
                disabled={loading}
                sx={{ borderRadius: 3, py: 1.5 }}
              >
                {loading ? 'Processing...' : 'Generate Insights'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {stats ? (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ opacity: 0.8 }}>PRESENT</Typography>
                <Typography variant="h3" fontWeight={800}>{stats.Present || 0}</Typography>
                <Typography variant="body2">{calculatePercentage('Present')}%</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: 'error.main', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ opacity: 0.8 }}>ABSENT</Typography>
                <Typography variant="h3" fontWeight={800}>{stats.Absent || 0}</Typography>
                <Typography variant="body2">{calculatePercentage('Absent')}%</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ opacity: 0.8 }}>LATE</Typography>
                <Typography variant="h3" fontWeight={800}>{stats.Late || 0}</Typography>
                <Typography variant="body2">{calculatePercentage('Late')}%</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: 'secondary.main', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ opacity: 0.8 }}>ON-DUTY</Typography>
                <Typography variant="h3" fontWeight={800}>{stats['On-Duty'] || 0}</Typography>
                <Typography variant="body2">{calculatePercentage('On-Duty')}%</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ opacity: 0.8 }}>TOTAL RECORDS</Typography>
                <Typography variant="h3" fontWeight={800}>{Object.values(stats).reduce((a,b)=>a+b, 0)}</Typography>
                <Typography variant="body2">This month</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 4 }}>Attendance Distribution</Typography>
                <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                  {chartData && <Pie data={chartData} options={{ maintainAspectRatio: false }} />}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 4 }}>Statistical Breakdown</Typography>
                <Stack spacing={4}>
                  {Object.entries(stats).map(([status, count]) => {
                    const percentage = calculatePercentage(status);
                    const color = status === 'Present' ? '#10B981' : status === 'Absent' ? '#EF4444' : '#F59E0B';
                    return (
                      <Box key={status}>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                          <Typography fontWeight={700}>{status}</Typography>
                          <Typography fontWeight={700} color="primary">{percentage}%</Typography>
                        </Stack>
                        <Box sx={{ height: 12, bgcolor: 'action.hover', borderRadius: 6, overflow: 'hidden' }}>
                          <Box sx={{ height: '100%', width: `${percentage}%`, bgcolor: color, borderRadius: 6 }} />
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ borderRadius: 5, overflow: 'hidden' }}>
              <Box sx={{ p: 3, bgcolor: 'background.default' }}>
                <Typography variant="h6" fontWeight={700}>Student Performance Leaderboard</Typography>
              </Box>
              <Divider />
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ pl: 4 }}>Student</TableCell>
                    <TableCell align="center">Present</TableCell>
                    <TableCell align="center">Absent</TableCell>
                    <TableCell align="center">Late</TableCell>
                    <TableCell align="center">On-Duty</TableCell>
                    <TableCell align="center">Half-Day</TableCell>
                    <TableCell align="center">Digital Twin (Engagement)</TableCell>
                    <TableCell align="center">Percentage</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getStudentStats().sort((a,b) => b.percentage - a.percentage).map((student) => (
                    <TableRow key={student.id} hover>
                      <TableCell sx={{ pl: 4 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32, fontSize: '0.875rem' }}>{student.name.charAt(0)}</Avatar>
                          <Typography variant="subtitle2" fontWeight={700}>{student.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="center"><Chip label={student.present} size="small" variant="outlined" /></TableCell>
                      <TableCell align="center"><Chip label={student.absent} size="small" variant="outlined" /></TableCell>
                      <TableCell align="center"><Chip label={student.late} size="small" variant="outlined" /></TableCell>
                      <TableCell align="center"><Chip label={student.onDuty} size="small" variant="outlined" /></TableCell>
                      <TableCell align="center"><Chip label={student.halfDay} size="small" variant="outlined" /></TableCell>
                      <TableCell align="center">
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <Typography variant="body2" color="text.secondary" fontWeight={700}>{student.engagementScore}%</Typography>
                          <Box sx={{ height: 6, bgcolor: 'action.hover', borderRadius: 3, overflow: 'hidden' }}>
                            <Box sx={{ height: '100%', width: `${student.engagementScore}%`, bgcolor: 'primary.main' }} />
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight={800} color={student.percentage >= 75 ? 'success.main' : 'error.main'}>
                          {student.percentage}%
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Card sx={{ p: 8, textAlign: 'center', borderRadius: 4 }}>
          <AssessmentIcon sx={{ fontSize: 80, color: 'action.disabled', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" fontWeight={700}>
            No Data Generated
          </Typography>
          <Typography color="text.secondary">
            Select a class and time period above to generate detailed analytics.
          </Typography>
        </Card>
      )}
    </Container>
  );
};

export default AttendanceReport;

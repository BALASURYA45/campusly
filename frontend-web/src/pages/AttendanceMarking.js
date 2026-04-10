import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow, 
  Button, 
  Select, 
  MenuItem, 
  Paper, 
  Box, 
  Alert, 
  TextField, 
  Grid, 
  Card, 
  CardContent,
  Chip, 
  Avatar, 
  Stack, 
  Divider, 
  IconButton, 
  Tooltip, 
  FormControl,
  InputLabel
} from '@mui/material';
import API from '../utils/api';
import { useSelector } from 'react-redux';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HistoryIcon from '@mui/icons-material/History';
import SaveIcon from '@mui/icons-material/Save';

const AttendanceMarking = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [period, setPeriod] = useState(1);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const { data } = await API.get('/classes');
      const userId = user?._id || user?.id || user?.user?._id || user?.user?.id;
      const teacherClasses = user.role === 'teacher' 
        ? data.data.filter(c => {
            const classTeacherId = c.teacher?._id || c.teacher;
            return classTeacherId === userId;
          })
        : data.data;
      setClasses(teacherClasses);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    
    const cls = classes.find(c => c._id === classId);
    if (cls && cls.students && Array.isArray(cls.students)) {
      setStudents(cls.students);
      
      const initialAttendance = {};
      cls.students.forEach(s => {
        initialAttendance[s._id] = 'Present';
      });
      setAttendance(initialAttendance);
    } else {
      setStudents([]);
      setAttendance({});
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendance({ ...attendance, [studentId]: status });
  };

  const markAll = (status) => {
    const newAttendance = { ...attendance };
    students.forEach(s => {
      newAttendance[s._id] = status;
    });
    setAttendance(newAttendance);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const records = Object.keys(attendance).map(studentId => ({
        student: studentId,
        class: selectedClass,
        status: attendance[studentId],
        date: date,
        period: period
      }));
      
      // Use bulk endpoint if possible, otherwise individual
      // Based on controller, it expects { attendanceRecords: [] }
      await API.post('/attendance', { attendanceRecords: records });
      
      setMessage({ type: 'success', text: 'Attendance marked successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Error marking attendance' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'success';
      case 'Absent': return 'error';
      case 'Late': return 'warning';
      case 'Half-Day': return 'info';
      case 'On-Duty': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3" fontWeight={800} gutterBottom>
              Attendance Marking
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
              Easily manage daily student presence
            </Typography>
          </Grid>
          <Grid item>
            <Button 
              variant="outlined" 
              startIcon={<HistoryIcon />}
              onClick={() => window.location.href='/attendance-report'}
              sx={{ borderRadius: 3 }}
            >
              View History
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      {message.text && (
        <Alert 
          severity={message.type} 
          sx={{ mb: 3, borderRadius: 3 }} 
          variant="filled"
          onClose={() => setMessage({ type: '', text: '' })}
        >
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={10}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, textTransform: 'uppercase', color: 'text.secondary' }}>
                    Select Target Class
                  </Typography>
                  <Select
                    value={selectedClass}
                    onChange={handleClassChange}
                    displayEmpty
                    fullWidth
                    sx={{ borderRadius: 3 }}
                  >
                    <MenuItem value="" disabled>Choose a class</MenuItem>
                    {classes.map(cls => (
                      <MenuItem key={cls._id} value={cls._id}>{cls.name}</MenuItem>
                    ))}
                  </Select>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, textTransform: 'uppercase', color: 'text.secondary' }}>
                    Select Period (Hour)
                  </Typography>
                  <Select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    fullWidth
                    sx={{ borderRadius: 3 }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map(p => (
                      <MenuItem key={p} value={p}>Period {p}</MenuItem>
                    ))}
                  </Select>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, textTransform: 'uppercase', color: 'text.secondary' }}>
                    Date of Attendance
                  </Typography>
                  <TextField
                    type="date"
                    fullWidth
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', bgcolor: 'primary.main', color: 'white' }}>
            <CardContent sx={{ width: '100%', textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={700}>Total Students</Typography>
              <Typography variant="h2" fontWeight={800}>{students.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {selectedClass && (
        <Card sx={{ borderRadius: 5, overflow: 'hidden' }}>
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.default' }}>
            <Typography variant="h6" fontWeight={700}>Student List</Typography>
            <Stack direction="row" spacing={1}>
              <Button 
                variant="contained" 
                size="small" 
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={() => markAll('Present')}
                sx={{ borderRadius: 2 }}
              >
                Mark All Present
              </Button>
              <Button 
                variant="contained" 
                size="small" 
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => markAll('Absent')}
                sx={{ borderRadius: 2 }}
              >
                Mark All Absent
              </Button>
            </Stack>
          </Box>
          <Divider />
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ pl: 4, fontWeight: 800 }}>STUDENT INFO</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800 }}>ROLL NUMBER</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800 }}>MARK ATTENDANCE (STATUS)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.length > 0 ? students.map(student => (
                <TableRow key={student._id} hover>
                  <TableCell sx={{ pl: 4 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 700, width: 36, height: 32 }}>
                        {student.name.charAt(0)}
                      </Avatar>
                      <Typography variant="subtitle2" fontWeight={700}>{student.name}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight={800} color="primary.main">
                      {student.rollNumber || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                      <Select
                        value={attendance[student._id] || 'Present'}
                        onChange={(e) => handleStatusChange(student._id, e.target.value)}
                        sx={{ 
                          borderRadius: 2, 
                          fontWeight: 700,
                          bgcolor: `${getStatusColor(attendance[student._id] || 'Present')}.light`,
                          color: `${getStatusColor(attendance[student._id] || 'Present')}.main`,
                          '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
                        }}
                      >
                        <MenuItem value="Present">✅ Present</MenuItem>
                        <MenuItem value="Absent">❌ Absent</MenuItem>
                        <MenuItem value="Late">🕒 Late</MenuItem>
                        <MenuItem value="On-Duty">🛡️ On-Duty</MenuItem>
                        <MenuItem value="Half-Day">🌗 Half-Day</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">No students found in this class.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'flex-end', bgcolor: 'background.default' }}>
            <Button 
              variant="contained" 
              size="large" 
              startIcon={<SaveIcon />}
              onClick={handleSubmit}
              disabled={loading}
              sx={{ 
                px: 6, py: 1.5, borderRadius: 3,
                boxShadow: '0 8px 24px rgba(0, 98, 255, 0.3)'
              }}
            >
              {loading ? 'Saving...' : 'Save Attendance'}
            </Button>
          </Box>
        </Card>
      )}
    </Container>
  );
};

export default AttendanceMarking;

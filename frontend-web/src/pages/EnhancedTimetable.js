import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import API from '../utils/api';
import { useSelector } from 'react-redux';

const EnhancedTimetable = () => {
  const { user } = useSelector((state) => state.auth);
  const [tabValue, setTabValue] = useState(0);
  const [classTimetables, setClassTimetables] = useState([]);
  const [teacherTimetables, setTeacherTimetables] = useState([]);
  const [examTimetables, setExamTimetables] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [openDialog, setOpenDialog] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedTimetable, setSelectedTimetable] = useState(null);

  const [newSchedule, setNewSchedule] = useState({
    day: '',
    subject: '',
    startTime: '',
    endTime: '',
    room: '',
    session: 'Morning',
  });

  useEffect(() => {
    fetchTimetables();
    if (user?.role === 'admin') {
      fetchClasses();
    }
  }, [user, tabValue]);

  const fetchTimetables = async () => {
    try {
      const { data } = await API.get('/timetable');
      
      if (user?.role === 'student') {
        const classTimeTT = data.data.filter(t => t.type === 'ClassTimetable');
        const examTimeTT = data.data.filter(t => t.type === 'ExamTimetable');
        
        setClassTimetables(classTimeTT);
        setExamTimetables(examTimeTT);
        
        const { data: exams } = await API.get('/timetable/upcoming/exams');
        setUpcomingExams(exams.data);
      } else if (user?.role === 'teacher') {
        const teacherTimeTT = data.data.filter(t => t.type === 'TeacherTimetable');
        setTeacherTimetables(teacherTimeTT);
      } else if (user?.role === 'admin') {
        setClassTimetables(data.data.filter(t => t.type === 'ClassTimetable'));
        setTeacherTimetables(data.data.filter(t => t.type === 'TeacherTimetable'));
        setExamTimetables(data.data.filter(t => t.type === 'ExamTimetable'));
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load timetables' });
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const { data } = await API.get('/classes');
      setClasses(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const renderClassTimetableTable = (timetable) => {
    return (
      <TableContainer key={timetable._id} component={Paper} sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ p: 2 }}>
          {timetable.class?.name} - {timetable.day}
        </Typography>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>Subject</TableCell>
              <TableCell>Teacher</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Room</TableCell>
              <TableCell>Session</TableCell>
              {user?.role === 'admin' && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {timetable.schedule?.map((slot) => (
              <TableRow key={slot._id}>
                <TableCell>{slot.subject?.name}</TableCell>
                <TableCell>{slot.teacher?.name}</TableCell>
                <TableCell>{slot.startTime}</TableCell>
                <TableCell>{slot.endTime}</TableCell>
                <TableCell>{slot.room}</TableCell>
                <TableCell>{slot.session}</TableCell>
                {user?.role === 'admin' && (
                  <TableCell>
                    <Button size="small" color="error">
                      <DeleteIcon fontSize="small" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderExamTimetable = () => {
    return (
      <Grid container spacing={3}>
        {examTimetables.map((timetable) => (
          <Grid item xs={12} key={timetable._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {timetable.class?.name} - Exam Schedule ({timetable.academicYear})
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell>Subject</TableCell>
                        <TableCell>Exam Date</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Total Marks</TableCell>
                        <TableCell>Duration (min)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {timetable.examSchedule?.map((exam) => (
                        <TableRow key={exam._id}>
                          <TableCell>{exam.subject?.name}</TableCell>
                          <TableCell>{new Date(exam.examDate).toLocaleDateString()}</TableCell>
                          <TableCell>{exam.startTime} - {exam.endTime}</TableCell>
                          <TableCell>{exam.location}</TableCell>
                          <TableCell>{exam.examType}</TableCell>
                          <TableCell>{exam.totalMarks}</TableCell>
                          <TableCell>{exam.duration}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderUpcomingExams = () => {
    return (
      <Grid container spacing={3}>
        {upcomingExams.length > 0 ? (
          upcomingExams.map((timetable) => (
            <Grid item xs={12} md={6} key={timetable._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {timetable.class?.name} Upcoming Exams
                  </Typography>
                  {timetable.examSchedule?.map((exam) => (
                    <Box key={exam._id} sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="subtitle1">{exam.subject?.name}</Typography>
                      <Typography variant="body2">
                        📅 {new Date(exam.examDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2">
                        🕐 {exam.startTime} - {exam.endTime}
                      </Typography>
                      <Typography variant="body2">
                        📍 {exam.location}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip label={exam.examType} size="small" sx={{ mr: 1 }} />
                        <Chip label={`${exam.totalMarks} marks`} size="small" />
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="textSecondary">No upcoming exams</Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    );
  };

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>Timetable Management</Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Class Timetable" />
          {(user?.role === 'teacher' || user?.role === 'admin') && <Tab label="Teacher Timetable" />}
          <Tab label="Exam Timetable" />
          {user?.role === 'student' && <Tab label="Upcoming Exams" />}
        </Tabs>
      </Paper>

      {/* Class Timetable Tab */}
      {tabValue === 0 && (
        <Box>
          {user?.role === 'admin' && (
            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Select Class</InputLabel>
                <Select
                  label="Select Class"
                  onChange={(e) => setSelectedTimetable(classes.find(c => c._id === e.target.value))}
                >
                  {classes.map(c => (
                    <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
                Add Schedule
              </Button>
            </Box>
          )}
          {classTimetables.length > 0 ? (
            classTimetables.map(renderClassTimetableTable)
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="textSecondary">No class timetable available</Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Teacher Timetable Tab */}
      {tabValue === 1 && (
        <Box>
          {user?.role === 'admin' && (
            <Button variant="contained" startIcon={<AddIcon />} sx={{ mb: 3 }} onClick={() => setOpenDialog(true)}>
              Create Teacher Timetable
            </Button>
          )}
          {teacherTimetables.length > 0 ? (
            teacherTimetables.map(renderClassTimetableTable)
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="textSecondary">No teacher timetable available</Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Exam Timetable Tab */}
      {tabValue === 2 && renderExamTimetable()}

      {/* Upcoming Exams Tab (for Students) */}
      {tabValue === 3 && renderUpcomingExams()}

      {/* Add Schedule Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Schedule</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Day</InputLabel>
              <Select
                value={newSchedule.day}
                label="Day"
                onChange={(e) => setNewSchedule({...newSchedule, day: e.target.value})}
              >
                {days.map(d => (
                  <MenuItem key={d} value={d}>{d}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Subject"
              value={newSchedule.subject}
              onChange={(e) => setNewSchedule({...newSchedule, subject: e.target.value})}
            />
            <TextField
              fullWidth
              label="Start Time"
              type="time"
              value={newSchedule.startTime}
              onChange={(e) => setNewSchedule({...newSchedule, startTime: e.target.value})}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="End Time"
              type="time"
              value={newSchedule.endTime}
              onChange={(e) => setNewSchedule({...newSchedule, endTime: e.target.value})}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Room/Location"
              value={newSchedule.room}
              onChange={(e) => setNewSchedule({...newSchedule, room: e.target.value})}
            />
            <FormControl fullWidth>
              <InputLabel>Session</InputLabel>
              <Select
                value={newSchedule.session}
                label="Session"
                onChange={(e) => setNewSchedule({...newSchedule, session: e.target.value})}
              >
                <MenuItem value="Morning">Morning</MenuItem>
                <MenuItem value="Afternoon">Afternoon</MenuItem>
                <MenuItem value="Evening">Evening</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenDialog(false)}>Add</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EnhancedTimetable;

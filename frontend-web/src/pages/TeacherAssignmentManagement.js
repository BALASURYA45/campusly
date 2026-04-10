import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import api from '../utils/api';
import { useSelector } from 'react-redux';

const TeacherAssignmentManagement = () => {
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    subject: '',
    class: '',
    dueDate: '',
  });
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [openSubmissions, setOpenSubmissions] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [gradeData, setGradeData] = useState({ grade: '', feedback: '' });
  const [currentSubmissionId, setCurrentSubmissionId] = useState('');

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const subRes = await api.get('/subjects');
      setSubjects(subRes.data.data);
      
      const clsRes = await api.get('/classes');
      const teacherClasses = user.role === 'teacher' 
        ? clsRes.data.data.filter(c => c.teacher && (c.teacher._id === user.id || c.teacher === user.id))
        : clsRes.data.data;
      setClasses(teacherClasses);

      fetchAssignments();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAssignments = async () => {
    try {
      // Fetching all for now, in production you'd filter by teacher on backend
      const res = await api.get('/assignments/class/all'); // Need to handle this endpoint
      setAssignments(res.data.data);
    } catch (err) {
      // Fallback if endpoint doesn't exist yet
      console.error(err);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/assignments', newAssignment);
      setMessage({ type: 'success', text: 'Assignment created!' });
      setNewAssignment({ title: '', description: '', subject: '', class: '', dueDate: '' });
      fetchAssignments();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to create assignment' });
    }
  };

  const viewSubmissions = async (assignmentId) => {
    try {
      const res = await api.get(`/assignments/${assignmentId}`);
      setSelectedAssignment(res.data.data);
      setOpenSubmissions(true);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to fetch submissions' });
    }
  };

  const handleGrade = async () => {
    try {
      await api.put(`/assignments/${selectedAssignment._id}/submissions/${currentSubmissionId}/grade`, gradeData);
      setMessage({ type: 'success', text: 'Graded successfully!' });
      setGradeData({ grade: '', feedback: '' });
      viewSubmissions(selectedAssignment._id); // Refresh
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to grade' });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Assignment & Grading</Typography>
      
      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Create Assignment</Typography>
            <Box component="form" onSubmit={handleCreateAssignment}>
              <TextField
                fullWidth label="Title" margin="normal" required
                value={newAssignment.title}
                onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
              />
              <TextField
                fullWidth label="Description" margin="normal" multiline rows={3}
                value={newAssignment.description}
                onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
              />
              <TextField
                select fullWidth label="Subject" margin="normal" required
                value={newAssignment.subject}
                onChange={(e) => setNewAssignment({...newAssignment, subject: e.target.value})}
              >
                {subjects.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}
              </TextField>
              <TextField
                select fullWidth label="Class" margin="normal" required
                value={newAssignment.class}
                onChange={(e) => setNewAssignment({...newAssignment, class: e.target.value})}
              >
                {classes.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
              </TextField>
              <TextField
                fullWidth label="Due Date" margin="normal" type="date" required
                InputLabelProps={{ shrink: true }}
                value={newAssignment.dueDate}
                onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
              />
              <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Post Assignment</Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Recent Assignments</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Submissions</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignments.map((asgn) => (
                    <TableRow key={asgn._id}>
                      <TableCell>{asgn.title}</TableCell>
                      <TableCell>{asgn.subject?.name}</TableCell>
                      <TableCell>{new Date(asgn.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>{asgn.submissions?.length || 0}</TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined" onClick={() => viewSubmissions(asgn._id)}>View & Grade</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Submissions Dialog */}
      <Dialog open={openSubmissions} onClose={() => setOpenSubmissions(false)} maxWidth="md" fullWidth>
        <DialogTitle>Submissions for {selectedAssignment?.title}</DialogTitle>
        <DialogContent>
          <List>
            {selectedAssignment?.submissions?.map((sub) => (
              <ListItem key={sub._id} divider>
                <ListItemText 
                  primary={sub.student?.name} 
                  secondary={`Submitted: ${new Date(sub.submittedAt).toLocaleString()}`} 
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip label={sub.grade || 'Not Graded'} color={sub.grade ? 'success' : 'default'} />
                  <Button size="small" onClick={() => {
                    setCurrentSubmissionId(sub._id);
                    setGradeData({ grade: sub.grade || '', feedback: sub.feedback || '' });
                  }}>Grade</Button>
                </Box>
              </ListItem>
            ))}
            {selectedAssignment?.submissions?.length === 0 && <Typography sx={{ p: 2 }}>No submissions yet.</Typography>}
          </List>

          {currentSubmissionId && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2">Grading Submission</Typography>
              <TextField 
                label="Grade (e.g., A, 90)" size="small" sx={{ mr: 1, mt: 1 }}
                value={gradeData.grade} onChange={(e) => setGradeData({...gradeData, grade: e.target.value})}
              />
              <TextField 
                label="Feedback" size="small" sx={{ mr: 1, mt: 1, flex: 1 }}
                value={gradeData.feedback} onChange={(e) => setGradeData({...gradeData, feedback: e.target.value})}
              />
              <Button variant="contained" sx={{ mt: 1 }} onClick={handleGrade}>Save Grade</Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSubmissions(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TeacherAssignmentManagement;

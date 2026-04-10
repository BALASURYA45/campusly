import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, List, ListItem, ListItemText, Button, TextField, Box, Chip, Divider, Alert } from '@mui/material';
import API from '../utils/api';
import { useSelector } from 'react-redux';

const StudentAssignmentView = () => {
  const [assignments, setAssignments] = useState([]);
  const [submissionUrl, setSubmissionUrl] = useState({});
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchAssignments();
  }, [user]);

  const fetchAssignments = async () => {
    if (!user) return;
    try {
      // First, get the student's class
      const { data: classRes } = await API.get('/classes');
      const studentClass = classRes.data.find(c => 
        c.students.includes(user.id) || c.students.includes(user.user?.id)
      );

      if (studentClass) {
        const { data: asgnRes } = await API.get(`/assignments/class/${studentClass._id}`);
        setAssignments(asgnRes.data);
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUrlChange = (id, val) => setSubmissionUrl({ ...submissionUrl, [id]: val });

  const handleSubmit = async (id) => {
    if (!submissionUrl[id]) return alert('Please provide a submission link');
    try {
      await API.post(`/assignments/${id}/submit`, { fileUrl: submissionUrl[id] });
      alert('Assignment submitted successfully!');
      fetchAssignments(); // Refresh to show submitted state
    } catch (err) {
      alert('Error submitting assignment');
    }
  };

  const getSubmissionStatus = (assignment) => {
    const studentId = user.id || user.user?.id;
    const submission = assignment.submissions?.find(s => s.student === studentId || s.student?._id === studentId);
    return submission;
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>My Assignments</Typography>
      
      {!loading && assignments.length === 0 && (
        <Alert severity="info">No assignments found for your class.</Alert>
      )}

      {assignments.map((assignment) => {
        const submission = getSubmissionStatus(assignment);
        const isPastDue = new Date(assignment.dueDate) < new Date();

        return (
          <Paper key={assignment._id} sx={{ p: 3, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h6">{assignment.title}</Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Subject: {assignment.subject?.name} | Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>{assignment.description}</Typography>
              </Box>
              <Box>
                {submission ? (
                  <Chip 
                    label={submission.grade ? `Graded: ${submission.grade}` : "Submitted"} 
                    color={submission.grade ? "success" : "primary"} 
                  />
                ) : (
                  <Chip 
                    label={isPastDue ? "Overdue" : "Pending"} 
                    color={isPastDue ? "error" : "warning"} 
                  />
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {submission ? (
              <Box>
                <Typography variant="subtitle2" color="primary">Your Submission:</Typography>
                <Typography variant="body2" component="a" href={submission.fileUrl} target="_blank" rel="noopener noreferrer">
                  {submission.fileUrl}
                </Typography>
                {submission.feedback && (
                  <Box sx={{ mt: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="caption" color="textSecondary">Teacher Feedback:</Typography>
                    <Typography variant="body2">{submission.feedback}</Typography>
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField 
                  size="small" 
                  placeholder="Link to your work (e.g., Google Drive, GitHub)" 
                  fullWidth 
                  value={submissionUrl[assignment._id] || ''} 
                  onChange={(e) => handleUrlChange(assignment._id, e.target.value)}
                  disabled={isPastDue}
                />
                <Button 
                  variant="contained" 
                  onClick={() => handleSubmit(assignment._id)} 
                  disabled={isPastDue}
                >
                  Submit
                </Button>
              </Box>
            )}
          </Paper>
        );
      })}
    </Container>
  );
};

export default StudentAssignmentView;

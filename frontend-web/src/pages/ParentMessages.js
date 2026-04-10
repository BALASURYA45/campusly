import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import SendIcon from '@mui/icons-material/Send';
import API from '../utils/api';

const ParentMessages = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTeachersAndChild = useCallback(async () => {
    if (!childId) return;

    try {
      const { data: meRes } = await API.get('/auth/me');
      const linkedChild = (meRes.data.children || []).find((item) => item._id === childId);
      setChild(linkedChild || null);

      const { data: classRes } = await API.get('/classes');
      const childClass = classRes.data.find(
        (cls) => cls.students.includes(childId) || cls.students.some((student) => student._id === childId)
      );

      const teacherMap = new Map();
      if (childClass?.teacher) {
        teacherMap.set(childClass.teacher._id, childClass.teacher);
      }

      const { data: subjectsRes } = await API.get('/subjects');
      const childSubjects = subjectsRes.data.filter(
        (subject) => subject.class?._id === childClass?._id || subject.class === childClass?._id
      );

      childSubjects.forEach((subject) => {
        if (subject.teacher) {
          const teacherId = subject.teacher._id || subject.teacher;
          teacherMap.set(teacherId, subject.teacher);
        }
      });

      const teacherList = Array.from(teacherMap.values());
      setTeachers(teacherList);
      setSelectedTeacher((current) => current || teacherList[0]?._id || null);
    } catch (err) {
      console.error('Error fetching teachers:', err);
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    fetchTeachersAndChild();
  }, [fetchTeachersAndChild]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedTeacher) return;

    try {
      await API.post('/notifications/send', {
        recipientIds: [selectedTeacher],
        title: `Message from parent of ${child?.name || 'student'}`,
        message: messageText,
        type: 'message',
        priority: 'medium',
        notificationMethods: {
          inApp: true,
          email: false,
          push: false,
        },
      });

      setMessages((current) => [
        ...current,
        {
          _id: Date.now(),
          text: messageText,
          sender: 'Parent',
          timestamp: new Date(),
          read: false,
        },
      ]);

      setMessageText('');
      alert('Message sent to teacher!');
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message');
    }
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
        Contact {child?.name}'s Teachers
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Teachers
            </Typography>
            <List dense>
              {teachers.map((teacher) => (
                <ListItem
                  key={teacher._id}
                  onClick={() => setSelectedTeacher(teacher._id)}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: selectedTeacher === teacher._id ? '#e3f2fd' : 'transparent',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemText primary={teacher.name} secondary="Teacher" />
                </ListItem>
              ))}
              {teachers.length === 0 && (
                <Typography variant="caption" color="textSecondary">
                  No teachers found.
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={9}>
          {selectedTeacher ? (
            <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 500 }}>
              <Typography variant="h6" gutterBottom>
                Message to {teachers.find((teacher) => teacher._id === selectedTeacher)?.name}
              </Typography>

              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  mb: 2,
                  p: 2,
                  bgcolor: '#f5f5f5',
                  borderRadius: 1,
                }}
              >
                {messages.length === 0 ? (
                  <Typography variant="caption" color="textSecondary">
                    No messages yet. Start the conversation!
                  </Typography>
                ) : (
                  messages.map((message) => (
                    <Box key={message._id} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Paper sx={{ p: 1, maxWidth: '70%', bgcolor: '#bbdefb' }}>
                          <Typography variant="body2">{message.text}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {new Date(message.timestamp).toLocaleString()}
                          </Typography>
                        </Paper>
                      </Box>
                    </Box>
                  ))
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Type your message here..."
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                />
                <Button
                  variant="contained"
                  endIcon={<SendIcon />}
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                >
                  Send
                </Button>
              </Box>
            </Paper>
          ) : (
            <Alert severity="info">Select a teacher to start messaging.</Alert>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ParentMessages;

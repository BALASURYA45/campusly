import React, { useState, useEffect } from 'react';
import { Container, Typography, List, ListItem, ListItemText, Paper, Divider, Box, LinearProgress, Chip, IconButton, Collapse, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import API from '../utils/api';
import { useSelector } from 'react-redux';

const SubjectList = () => {
  const [subjects, setSubjects] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [openAddTopic, setOpenAddTopic] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [newTopic, setNewTopic] = useState({ topic: '', description: '', status: 'Pending' });

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const { data } = await API.get('/subjects');
      setSubjects(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddTopic = async () => {
    try {
      await API.post(`/subjects/${selectedSubjectId}/syllabus`, newTopic);
      setOpenAddTopic(false);
      setNewTopic({ topic: '', description: '', status: 'Pending' });
      fetchSubjects();
    } catch (err) {
      alert('Error adding topic');
    }
  };

  const calculateProgress = (syllabus) => {
    if (!syllabus || syllabus.length === 0) return 0;
    const completed = syllabus.filter(s => s.status === 'Completed').length;
    return (completed / syllabus.length) * 100;
  };

  const updateStatus = async (subjectId, topicId, newStatus) => {
    try {
      await API.put(`/subjects/${subjectId}/syllabus/${topicId}`, { status: newStatus });
      fetchSubjects();
    } catch (err) {
      alert('Error updating status');
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Subjects & Curriculum Tracker</Typography>
      {subjects.map((subject) => (
        <Paper key={subject._id} sx={{ mb: 3, overflow: 'hidden' }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6">{subject.name} ({subject.code})</Typography>
              <Typography variant="body2" color="textSecondary">
                Class: {subject.class?.name} | Teacher: {subject.teacher?.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress variant="determinate" value={calculateProgress(subject.syllabus)} />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="textSecondary">{`${Math.round(calculateProgress(subject.syllabus))}%`}</Typography>
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: 'flex' }}>
              {(user.role === 'teacher' || user.role === 'admin') && (
                <IconButton color="primary" onClick={() => { setSelectedSubjectId(subject._id); setOpenAddTopic(true); }}>
                  <AddCircleIcon />
                </IconButton>
              )}
              <IconButton onClick={() => toggleExpand(subject._id)}>
                <ExpandMoreIcon sx={{ transform: expanded[subject._id] ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }} />
              </IconButton>
            </Box>
          </Box>
          
          <Collapse in={expanded[subject._id]} timeout="auto" unmountOnExit>
            <Divider />
            <List sx={{ bgcolor: '#fafafa' }}>
              {subject.syllabus && subject.syllabus.length > 0 ? (
                subject.syllabus.map((topic) => (
                  <ListItem key={topic._id} sx={{ py: 1 }}>
                    <ListItemText primary={topic.topic} secondary={topic.description} />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip 
                        label={topic.status} 
                        color={topic.status === 'Completed' ? 'success' : topic.status === 'In Progress' ? 'warning' : 'default'}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      {(user.role === 'teacher' || user.role === 'admin') && topic.status !== 'Completed' && (
                        <IconButton size="small" color="primary" onClick={() => updateStatus(subject._id, topic._id, topic.status === 'Pending' ? 'In Progress' : 'Completed')}>
                          <CheckCircleIcon />
                        </IconButton>
                      )}
                    </Box>
                  </ListItem>
                ))
              ) : (
                <ListItem><ListItemText secondary="No syllabus topics added yet" /></ListItem>
              )}
            </List>
          </Collapse>
        </Paper>
      ))}

      {/* Add Topic Dialog */}
      <Dialog open={openAddTopic} onClose={() => setOpenAddTopic(false)}>
        <DialogTitle>Add Syllabus Topic</DialogTitle>
        <DialogContent>
          <TextField 
            fullWidth label="Topic Title" margin="normal" 
            value={newTopic.topic} onChange={(e) => setNewTopic({...newTopic, topic: e.target.value})}
          />
          <TextField 
            fullWidth label="Description" margin="normal" multiline rows={2}
            value={newTopic.description} onChange={(e) => setNewTopic({...newTopic, description: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddTopic(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddTopic}>Add Topic</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SubjectList;

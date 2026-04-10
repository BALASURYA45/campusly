import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Grid, Card, CardContent, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem,
  Box, LinearProgress, Chip, List, ListItem, ListItemText, Divider,
  FormControl, InputLabel, Alert, IconButton, Collapse, Stack, Avatar,
  Tooltip, useTheme
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TopicIcon from '@mui/icons-material/Topic';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import API from '../utils/api';
import { useSelector } from 'react-redux';

const CurriculumManagement = () => {
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [expandedSubject, setExpandedSubject] = useState({});
  const [openLessonPlan, setOpenLessonPlan] = useState(false);
  const [openTopicDialog, setOpenTopicDialog] = useState(false);
  const [openNotesDialog, setOpenNotesDialog] = useState(false);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);

  const [lessonPlanData, setLessonPlanData] = useState({
    title: '',
    subject: '',
    weekNumber: '',
    objectives: '',
    resources: '',
    activities: ''
  });

  const [topicData, setTopicData] = useState({
    topic: '',
    description: '',
    duration: '',
    learningOutcomes: '',
    status: 'Pending'
  });

  const [notesData, setNotesData] = useState({
    notes: '',
    targetAudience: 'All',
    difficulty: 'Intermediate'
  });

  useEffect(() => {
    fetchSubjects();
  }, [user]);

  const fetchSubjects = async () => {
    try {
      const { data } = await API.get('/subjects');
      const teacherSubjects = user.role === 'teacher' 
        ? data.data.filter(s => s.teacher && (s.teacher._id === user.id || s.teacher === user.id))
        : data.data;
      setSubjects(teacherSubjects);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load subjects' });
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (syllabus) => {
    if (!syllabus || syllabus.length === 0) return 0;
    const completed = syllabus.filter(s => s.status === 'Completed').length;
    return (completed / syllabus.length) * 100;
  };

  const handleAddTopic = async () => {
    if (!selectedSubject) return;
    try {
      await API.post(`/subjects/${selectedSubject}/syllabus`, topicData);
      setMessage({ type: 'success', text: 'Topic added successfully!' });
      setOpenTopicDialog(false);
      setTopicData({ topic: '', description: '', duration: '', learningOutcomes: '', status: 'Pending' });
      fetchSubjects();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to add topic' });
    }
  };

  const handleAddLessonPlan = async () => {
    if (!lessonPlanData.title || !lessonPlanData.subject) return;
    try {
      await API.post(`/subjects/${lessonPlanData.subject}/lessonplan`, {
        ...lessonPlanData,
        weekNumber: parseInt(lessonPlanData.weekNumber) || 0
      });
      setMessage({ type: 'success', text: 'Lesson plan created successfully!' });
      setOpenLessonPlan(false);
      setLessonPlanData({ title: '', subject: '', weekNumber: '', objectives: '', resources: '', activities: '' });
      fetchSubjects();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to create lesson plan' });
    }
  };

  const handleUpdateTopicStatus = async (subjectId, topicId, newStatus) => {
    try {
      await API.put(`/subjects/${subjectId}/syllabus/${topicId}`, { status: newStatus });
      fetchSubjects();
      setMessage({ type: 'success', text: 'Topic status updated!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update status' });
    }
  };

  const handleAddNotes = async () => {
    if (!selectedSubject || !currentTopic) return;
    try {
      await API.post(`/subjects/${selectedSubject}/syllabus/${currentTopic._id}/notes`, notesData);
      setMessage({ type: 'success', text: 'Notes saved successfully!' });
      setOpenNotesDialog(false);
      setNotesData({ notes: '', targetAudience: 'All', difficulty: 'Intermediate' });
      fetchSubjects();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save notes' });
    }
  };

  const toggleSubject = (subjectId) => {
    setExpandedSubject(prev => ({ ...prev, [subjectId]: !prev[subjectId] }));
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3" fontWeight={800} gutterBottom>
              Curriculum & Syllabus
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
              Plan, track, and manage academic content across subjects
            </Typography>
          </Grid>
          <Grid item>
            <Stack direction="row" spacing={2}>
              <Button 
                variant="outlined" 
                startIcon={<MenuBookIcon />}
                onClick={() => setOpenLessonPlan(true)}
                sx={{ borderRadius: 3, px: 3 }}
              >
                New Lesson Plan
              </Button>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => setOpenTopicDialog(true)}
                sx={{ borderRadius: 3, px: 3 }}
              >
                Add Syllabus Topic
              </Button>
            </Stack>
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

      {/* Overview Section */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <LibraryBooksIcon sx={{ mr: 1, color: 'primary.main' }} />
        Subject Overview
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {subjects.map((subject) => {
          const progress = calculateProgress(subject.syllabus);
          return (
            <Grid item xs={12} md={6} lg={4} key={subject._id}>
              <Card sx={{ 
                borderRadius: 4, 
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight={800}>{subject.name}</Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>{subject.code}</Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
                      <MenuBookIcon />
                    </Avatar>
                  </Stack>
                  
                  <Box sx={{ mt: 3 }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="body2" fontWeight={700}>Completion</Typography>
                      <Typography variant="body2" fontWeight={800} color="primary">{Math.round(progress)}%</Typography>
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={progress} 
                      sx={{ height: 8, borderRadius: 4, bgcolor: 'action.hover' }}
                    />
                  </Box>
                  
                  <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
                  
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      {subject.syllabus?.filter(s => s.status === 'Completed').length || 0} / {subject.syllabus?.length || 0} Topics
                    </Typography>
                    <Button size="small" onClick={() => toggleSubject(subject._id)} sx={{ fontWeight: 700 }}>
                      View Details
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Detailed Management */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <TopicIcon sx={{ mr: 1, color: 'secondary.main' }} />
        Syllabus Breakdown
      </Typography>

      {subjects.map((subject) => (
        <Card key={subject._id} sx={{ mb: 3, borderRadius: 4, overflow: 'hidden' }}>
          <Box 
            sx={{ 
              p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
              cursor: 'pointer', bgcolor: 'background.paper' 
            }}
            onClick={() => toggleSubject(subject._id)}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.main' }}>{subject.name.charAt(0)}</Avatar>
              <Box>
                <Typography variant="h6" fontWeight={800}>{subject.name}</Typography>
                <Typography variant="body2" color="text.secondary">Class: {subject.class?.name || 'N/A'}</Typography>
              </Box>
            </Stack>
            <IconButton sx={{ transform: expandedSubject[subject._id] ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }}>
              <ExpandMoreIcon />
            </IconButton>
          </Box>

          <Collapse in={expandedSubject[subject._id]} timeout="auto">
            <Divider />
            <Box sx={{ p: 3 }}>
              {subject.syllabus && subject.syllabus.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {subject.syllabus.map((topic, index) => (
                    <Paper 
                      key={topic._id} 
                      elevation={0} 
                      sx={{ 
                        mb: 2, p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={7}>
                          <Stack direction="row" spacing={2} alignItems="flex-start">
                            <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: 'action.disabled' }}>{index + 1}</Avatar>
                            <Box>
                              <Typography variant="subtitle1" fontWeight={700}>{topic.topic}</Typography>
                              <Typography variant="body2" color="text.secondary">{topic.description}</Typography>
                              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                <Chip label={`Duration: ${topic.duration || 'N/A'}`} size="small" variant="outlined" />
                                <Chip label={topic.status} size="small" color={topic.status === 'Completed' ? 'success' : topic.status === 'In Progress' ? 'warning' : 'default'} />
                              </Stack>
                            </Box>
                          </Stack>
                        </Grid>
                        <Grid item xs={12} md={5}>
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Tooltip title="Add Study Notes">
                              <IconButton size="small" onClick={() => { setCurrentTopic(topic); setSelectedSubject(subject._id); setOpenNotesDialog(true); }}>
                                <NoteAddIcon color="primary" />
                              </IconButton>
                            </Tooltip>
                            {topic.status !== 'Completed' && (
                              <Button 
                                size="small" 
                                variant="outlined" 
                                color="success"
                                startIcon={<CheckCircleIcon />}
                                onClick={() => handleUpdateTopicStatus(subject._id, topic._id, topic.status === 'Pending' ? 'In Progress' : 'Completed')}
                                sx={{ borderRadius: 2 }}
                              >
                                {topic.status === 'Pending' ? 'Start' : 'Complete'}
                              </Button>
                            )}
                          </Stack>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </List>
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">No topics added to this syllabus yet.</Typography>
                </Box>
              )}
            </Box>
          </Collapse>
        </Card>
      ))}

      {/* Dialogs with Premium Styling */}
      <Dialog open={openTopicDialog} onClose={() => setOpenTopicDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Add Syllabus Topic</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Target Subject</InputLabel>
              <Select value={selectedSubject} label="Target Subject" onChange={(e) => setSelectedSubject(e.target.value)} sx={{ borderRadius: 3 }}>
                {subjects.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField fullWidth label="Topic Title" value={topicData.topic} onChange={(e) => setTopicData({...topicData, topic: e.target.value})} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
            <TextField fullWidth label="Duration (e.g., 2 weeks)" value={topicData.duration} onChange={(e) => setTopicData({...topicData, duration: e.target.value})} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
            <TextField fullWidth label="Description" multiline rows={3} value={topicData.description} onChange={(e) => setTopicData({...topicData, description: e.target.value})} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
            <TextField fullWidth label="Learning Outcomes" multiline rows={2} value={topicData.learningOutcomes} onChange={(e) => setTopicData({...topicData, learningOutcomes: e.target.value})} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={topicData.status} label="Status" onChange={(e) => setTopicData({...topicData, status: e.target.value})} sx={{ borderRadius: 3 }}>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenTopicDialog(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddTopic} sx={{ borderRadius: 2, px: 4 }}>Add Topic</Button>
        </DialogActions>
      </Dialog>

      {/* Lesson Plan Dialog */}
      <Dialog open={openLessonPlan} onClose={() => setOpenLessonPlan(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Create New Lesson Plan</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Subject</InputLabel>
              <Select value={lessonPlanData.subject} label="Subject" onChange={(e) => setLessonPlanData({...lessonPlanData, subject: e.target.value})} sx={{ borderRadius: 3 }}>
                {subjects.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField fullWidth label="Lesson Title" value={lessonPlanData.title} onChange={(e) => setLessonPlanData({...lessonPlanData, title: e.target.value})} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
            <TextField fullWidth label="Week Number" type="number" value={lessonPlanData.weekNumber} onChange={(e) => setLessonPlanData({...lessonPlanData, weekNumber: e.target.value})} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
            <TextField fullWidth label="Objectives" multiline rows={2} value={lessonPlanData.objectives} onChange={(e) => setLessonPlanData({...lessonPlanData, objectives: e.target.value})} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
            <TextField fullWidth label="Resources" multiline rows={2} value={lessonPlanData.resources} onChange={(e) => setLessonPlanData({...lessonPlanData, resources: e.target.value})} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
            <TextField fullWidth label="Activities" multiline rows={3} value={lessonPlanData.activities} onChange={(e) => setLessonPlanData({...lessonPlanData, activities: e.target.value})} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenLessonPlan(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddLessonPlan} sx={{ borderRadius: 2, px: 4 }}>Create Plan</Button>
        </DialogActions>
      </Dialog>

      {/* Teacher Notes Dialog */}
      <Dialog open={openNotesDialog} onClose={() => setOpenNotesDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Add Teacher Notes: {currentTopic?.topic}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField fullWidth label="Teaching Notes" multiline rows={5} value={notesData.notes} onChange={(e) => setNotesData({...notesData, notes: e.target.value})} placeholder="Add your teaching notes, tips, and recommendations here..." sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
            <FormControl fullWidth>
              <InputLabel>Target Audience</InputLabel>
              <Select value={notesData.targetAudience} label="Target Audience" onChange={(e) => setNotesData({...notesData, targetAudience: e.target.value})} sx={{ borderRadius: 3 }}>
                <MenuItem value="All">All Students</MenuItem>
                <MenuItem value="Slow Learners">Slow Learners</MenuItem>
                <MenuItem value="Advanced">Advanced Learners</MenuItem>
                <MenuItem value="Teachers">Teachers Only</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Difficulty Level</InputLabel>
              <Select value={notesData.difficulty} label="Difficulty Level" onChange={(e) => setNotesData({...notesData, difficulty: e.target.value})} sx={{ borderRadius: 3 }}>
                <MenuItem value="Easy">Easy</MenuItem>
                <MenuItem value="Intermediate">Intermediate</MenuItem>
                <MenuItem value="Advanced">Advanced</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenNotesDialog(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddNotes} sx={{ borderRadius: 2, px: 4 }}>Save Notes</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CurriculumManagement;

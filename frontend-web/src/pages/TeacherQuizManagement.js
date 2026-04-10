import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Grid, Card, CardContent, Button, 
  TextField, Select, MenuItem, FormControl, InputLabel, 
  Table, TableBody, TableCell, TableHead, TableRow, 
  IconButton, Box, Alert, Dialog, DialogTitle, DialogContent, 
  DialogActions, Stack, Chip, LinearProgress, Divider
} from '@mui/material';
import { useSelector } from 'react-redux';
import API from '../utils/api';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import QuizIcon from '@mui/icons-material/Quiz';
import TimerIcon from '@mui/icons-material/Timer';
import AssessmentIcon from '@mui/icons-material/Assessment';

const TeacherQuizManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [questions, setQuestions] = useState([{ 
    questionText: '', 
    options: ['', '', '', ''], 
    correctOptionIndex: 0, 
    points: 1 
  }]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    class: '',
    duration: 30,
    totalMarks: 0,
    status: 'Draft',
    dueDate: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [qRes, subRes, clsRes] = await Promise.all([
        API.get('/quizzes'),
        API.get('/subjects'),
        API.get('/classes')
      ]);
      setQuizzes(qRes.data.data);
      setSubjects(subRes.data.data);
      setClasses(clsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { 
      questionText: '', 
      options: ['', '', '', ''], 
      correctOptionIndex: 0, 
      points: 1 
    }]);
  };

  const handleRemoveQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async () => {
    const totalMarks = questions.reduce((sum, q) => sum + (parseInt(q.points) || 1), 0);
    const data = { ...formData, questions, totalMarks };

    setLoading(true);
    try {
      await API.post('/quizzes', data);
      setMessage({ type: 'success', text: 'Quiz created and synchronized with Digital Twins!' });
      fetchData();
      setOpen(false);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to create quiz.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h3" fontWeight={800}>Automated Quiz Engine</Typography>
          <Typography variant="subtitle1" color="text.secondary">Create auto-graded assessments and track real-time performance</Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => setOpen(true)}
          sx={{ borderRadius: 3, px: 3, py: 1.5 }}
        >
          Create New Quiz
        </Button>
      </Stack>

      {message.text && <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: '', text: '' })}>{message.text}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 4 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 800 }}>QUIZ TITLE</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>SUBJECT</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>CLASS</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>QUESTIONS</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>DURATION</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>STATUS</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quizzes.map((quiz) => (
                  <TableRow key={quiz._id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={700}>{quiz.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{quiz.totalMarks} Marks Total</Typography>
                    </TableCell>
                    <TableCell><Chip label={quiz.subject?.name} size="small" variant="outlined" /></TableCell>
                    <TableCell>{quiz.class?.name}</TableCell>
                    <TableCell>{quiz.questions?.length} Items</TableCell>
                    <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><TimerIcon fontSize="small" color="action" />{quiz.duration} mins</Box></TableCell>
                    <TableCell><Chip label={quiz.status} size="small" color={quiz.status === 'Published' ? 'success' : 'default'} /></TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" size="small"><AssessmentIcon /></IconButton>
                      <IconButton color="error" size="small"><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Create New Quiz</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField label="Quiz Title" fullWidth value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField type="date" label="Due Date" fullWidth InputLabelProps={{ shrink: true }} value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} />
              </Grid>
            </Grid>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Subject</InputLabel>
                  <Select value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})}>
                    {subjects.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Class</InputLabel>
                  <Select value={formData.class} onChange={(e) => setFormData({...formData, class: e.target.value})}>
                    {classes.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField type="number" label="Duration (Minutes)" fullWidth value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }}>
              <Chip label={`QUESTIONS (${questions.length})`} sx={{ fontWeight: 800 }} />
            </Divider>

            {questions.map((q, qIndex) => (
              <Card key={qIndex} variant="outlined" sx={{ p: 2, borderRadius: 3, position: 'relative' }}>
                <IconButton 
                  size="small" 
                  color="error" 
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                  onClick={() => handleRemoveQuestion(qIndex)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
                <TextField 
                  label={`Question ${qIndex + 1}`} 
                  fullWidth 
                  value={q.questionText} 
                  onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Grid container spacing={1}>
                  {q.options.map((opt, oIndex) => (
                    <Grid item xs={6} key={oIndex}>
                      <TextField 
                        label={`Option ${oIndex + 1}`} 
                        fullWidth 
                        size="small" 
                        value={opt} 
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        color={q.correctOptionIndex === oIndex ? 'success' : 'primary'}
                      />
                    </Grid>
                  ))}
                </Grid>
                <Stack direction="row" spacing={2} sx={{ mt: 2 }} alignItems="center">
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Correct Answer</InputLabel>
                    <Select 
                      value={q.correctOptionIndex} 
                      onChange={(e) => updateQuestion(qIndex, 'correctOptionIndex', e.target.value)}
                    >
                      {q.options.map((_, i) => <MenuItem key={i} value={i}>Option {i + 1}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <TextField 
                    type="number" 
                    label="Points" 
                    size="small" 
                    sx={{ width: 100 }} 
                    value={q.points} 
                    onChange={(e) => updateQuestion(qIndex, 'points', e.target.value)} 
                  />
                </Stack>
              </Card>
            ))}

            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddQuestion} fullWidth sx={{ py: 1.5, borderRadius: 3 }}>
              Add Question
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading || !formData.title}>
            {loading ? 'Creating...' : 'Publish Quiz'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TeacherQuizManagement;

import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Grid, Card, CardContent, Button, 
  Box, Stack, Chip, Paper, Divider, Radio, RadioGroup, 
  FormControlLabel, FormControl, LinearProgress, Dialog,
  DialogTitle, DialogContent, DialogActions, Avatar
} from '@mui/material';
import API from '../utils/api';
import QuizIcon from '@mui/icons-material/Quiz';
import TimerIcon from '@mui/icons-material/Timer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const StudentQuizView = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [startTime, setStartTime] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [qRes, rRes] = await Promise.all([
        API.get('/quizzes?status=Published'),
        API.get('/quizzes/results/me')
      ]);
      setQuizzes(qRes.data.data);
      setResults(rRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestion(0);
    setAnswers({});
    setStartTime(new Date());
    setQuizResult(null);
  };

  const handleOptionSelect = (optionIndex) => {
    setAnswers({ ...answers, [currentQuestion]: optionIndex });
  };

  const submitQuiz = async () => {
    setSubmitting(true);
    const durationTaken = Math.round((new Date() - startTime) / 60000);
    try {
      const { data } = await API.post(`/quizzes/${activeQuiz._id}/submit`, {
        userAnswers: answers,
        durationTaken
      });
      setQuizResult(data.data);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const isTaken = (quizId) => results.some(r => r.quiz?._id === quizId);
  const getResult = (quizId) => results.find(r => r.quiz?._id === quizId);

  if (activeQuiz && !quizResult) {
    const q = activeQuiz.questions[currentQuestion];
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Card sx={{ borderRadius: 6, p: 4, boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight={800}>{activeQuiz.title}</Typography>
            <Chip 
              icon={<TimerIcon />} 
              label={`Question ${currentQuestion + 1} of ${activeQuiz.questions.length}`} 
              color="primary" 
              variant="outlined" 
            />
          </Stack>
          
          <LinearProgress 
            variant="determinate" 
            value={((currentQuestion + 1) / activeQuiz.questions.length) * 100} 
            sx={{ mb: 4, height: 8, borderRadius: 4 }}
          />

          <Typography variant="h6" sx={{ mb: 4, fontWeight: 600 }}>{q.questionText}</Typography>

          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <RadioGroup 
              value={answers[currentQuestion] ?? ''} 
              onChange={(e) => handleOptionSelect(parseInt(e.target.value))}
            >
              {q.options.map((opt, i) => (
                <Paper 
                  key={i} 
                  variant="outlined" 
                  sx={{ 
                    mb: 2, p: 1, borderRadius: 3,
                    borderColor: answers[currentQuestion] === i ? 'primary.main' : 'divider',
                    bgcolor: answers[currentQuestion] === i ? 'primary.light' : 'transparent',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <FormControlLabel 
                    value={i} 
                    control={<Radio />} 
                    label={opt} 
                    sx={{ width: '100%', m: 0, px: 2 }} 
                  />
                </Paper>
              ))}
            </RadioGroup>
          </FormControl>

          <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mt: 4 }}>
            <Button 
              disabled={currentQuestion === 0} 
              onClick={() => setCurrentQuestion(v => v - 1)}
            >
              Previous
            </Button>
            {currentQuestion < activeQuiz.questions.length - 1 ? (
              <Button 
                variant="contained" 
                onClick={() => setCurrentQuestion(v => v + 1)}
                sx={{ px: 4, borderRadius: 3 }}
              >
                Next
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="success" 
                onClick={submitQuiz}
                disabled={submitting}
                sx={{ px: 4, borderRadius: 3 }}
              >
                {submitting ? 'Submitting...' : 'Finish Quiz'}
              </Button>
            )}
          </Stack>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight={800}>Assessments & Quizzes</Typography>
        <Typography variant="subtitle1" color="text.secondary">Test your knowledge and update your Digital Twin score</Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>Available Quizzes</Typography>
          <Stack spacing={2}>
            {quizzes.map((quiz) => {
              const taken = isTaken(quiz._id);
              const result = getResult(quiz._id);
              return (
                <Paper key={quiz._id} sx={{ p: 3, borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="h6" fontWeight={700}>{quiz.title}</Typography>
                      <Chip label={quiz.subject?.name} size="small" variant="outlined" />
                    </Stack>
                    <Stack direction="row" spacing={2} color="text.secondary">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <QuizIcon fontSize="small" /> {quiz.questions.length} Items
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TimerIcon fontSize="small" /> {quiz.duration} mins
                      </Box>
                    </Stack>
                  </Box>
                  <Box>
                    {taken ? (
                      <Chip 
                        icon={<CheckCircleIcon />} 
                        label={`Score: ${result?.percentage}%`} 
                        color="success" 
                        variant="outlined" 
                        sx={{ fontWeight: 700 }}
                      />
                    ) : (
                      <Button variant="contained" onClick={() => startQuiz(quiz)} sx={{ borderRadius: 3 }}>
                        Start Quiz
                      </Button>
                    )}
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 4, background: 'linear-gradient(135deg, #0062ff 0%, #7c4dff 100%)', color: 'white' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2} alignItems="center" textAlign="center">
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 64, height: 64 }}>
                  <AutoAwesomeIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography variant="h5" fontWeight={800}>Digital Twin Impact</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Every quiz you complete instantly updates your Digital Twin performance score. Higher scores lead to better AI-predicted outcomes!
                </Typography>
                <Divider sx={{ width: '100%', borderColor: 'rgba(255,255,255,0.2)' }} />
                <Typography variant="h3" fontWeight={800}>{results.length}</Typography>
                <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>Quizzes Completed</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={!!quizResult} onClose={() => setQuizResult(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 800 }}>Quiz Completed!</DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Box sx={{ py: 4 }}>
            <Typography variant="h2" color="primary.main" fontWeight={800}>{quizResult?.percentage}%</Typography>
            <Typography variant="h6" color="text.secondary">Your Score: {quizResult?.score} / {quizResult?.totalMarks}</Typography>
            <Box sx={{ mt: 4, p: 2, bgcolor: 'success.light', borderRadius: 3, color: 'success.contrastText' }}>
              <Typography variant="body2" fontWeight={700}>
                Excellent! Your Digital Twin has been updated with this performance.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button variant="contained" onClick={() => setQuizResult(null)} sx={{ borderRadius: 3, px: 4 }}>
            Close Result
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentQuizView;

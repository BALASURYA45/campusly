const express = require('express');
const {
  createQuiz,
  getQuizzes,
  getQuiz,
  submitQuiz,
  getMyResults,
  getQuizResults,
} = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getQuizzes);
router.get('/results/me', authorize('student'), getMyResults);
router.get('/:id', getQuiz);
router.post('/:id/submit', authorize('student'), submitQuiz);

router.post('/', authorize('teacher', 'admin', 'superadmin'), createQuiz);
router.get('/:id/results', authorize('teacher', 'admin', 'superadmin'), getQuizResults);

module.exports = router;

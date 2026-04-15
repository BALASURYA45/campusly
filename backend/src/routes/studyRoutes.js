const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getMyStudySummary, setMyWeeklyGoal, logMyStudySession } = require('../controllers/studyController');

const router = express.Router();

router.use(protect);

router.get('/me/summary', authorize('student'), getMyStudySummary);
router.put('/me/goal', authorize('student'), setMyWeeklyGoal);
router.post('/me/sessions', authorize('student'), logMyStudySession);

module.exports = router;


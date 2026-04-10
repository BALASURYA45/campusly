const express = require('express');
const {
  getAtRiskStudents,
  logIntervention,
  updateThreshold
} = require('../controllers/earlyWarningController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/at-risk', authorize('teacher', 'admin', 'superadmin'), getAtRiskStudents);
router.post('/intervention/:studentId', authorize('teacher', 'admin'), logIntervention);
router.put('/threshold/:studentId', authorize('teacher', 'admin'), updateThreshold);

module.exports = router;

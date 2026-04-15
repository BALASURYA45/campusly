const express = require('express');
const {
  getStats,
  getStudentAttendanceReport,
  generateAttendanceReport,
  generatePerformanceReport,
  generateMyPerformanceReport,
  generateClassReport,
  generateParentReport,
  getReports,
  getReport,
  deleteReport,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/stats', authorize('admin', 'superadmin'), getStats);
router.get('/attendance/:studentId', authorize('admin', 'teacher', 'parent', 'student'), getStudentAttendanceReport);
router.get('/me/performance', authorize('student'), generateMyPerformanceReport);

router.post('/attendance', authorize('teacher', 'admin'), generateAttendanceReport);
router.post('/performance', authorize('teacher', 'admin', 'parent'), generatePerformanceReport);
router.post('/class', authorize('teacher', 'admin'), generateClassReport);
router.post('/parent', authorize('parent'), generateParentReport);

router.get('/', getReports);
router.get('/:id', getReport);
router.delete('/:id', deleteReport);

module.exports = router;

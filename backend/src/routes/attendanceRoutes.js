const express = require('express');
const { markAttendance, getClassAttendance, getMyAttendance, getStudentAttendance, getMyAttendanceSummary, getStudentAttendanceSummary } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', authorize('admin', 'teacher'), markAttendance);
router.get('/class/:classId', authorize('admin', 'teacher'), getClassAttendance);
router.get('/me', authorize('student'), getMyAttendance);
router.get('/me/summary', authorize('student'), getMyAttendanceSummary);
router.get('/student/:studentId', authorize('admin', 'teacher', 'parent', 'student'), getStudentAttendance);
router.get('/student/:studentId/summary', authorize('admin', 'teacher', 'parent', 'student'), getStudentAttendanceSummary);

module.exports = router;

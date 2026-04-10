const express = require('express');
const { markAttendance, getClassAttendance, getMyAttendance, getStudentAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', authorize('admin', 'teacher'), markAttendance);
router.get('/class/:classId', authorize('admin', 'teacher'), getClassAttendance);
router.get('/me', authorize('student'), getMyAttendance);
router.get('/student/:studentId', authorize('admin', 'teacher', 'parent', 'student'), getStudentAttendance);

module.exports = router;

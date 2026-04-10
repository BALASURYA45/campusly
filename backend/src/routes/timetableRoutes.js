const express = require('express');
const {
  getTimetables,
  getTimetable,
  createTimetable,
  updateTimetable,
  deleteTimetable,
  getClassTimetable,
  getTeacherTimetable,
  getExamTimetable,
  addSchedule,
  removeSchedule,
  addExamSchedule,
  updateExamSchedule,
  getUpcomingExams,
} = require('../controllers/timetableController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getTimetables);
router.post('/', authorize('admin'), createTimetable);
router.get('/:id', getTimetable);
router.put('/:id', authorize('admin'), updateTimetable);
router.delete('/:id', authorize('admin'), deleteTimetable);

router.get('/class/:classId', getClassTimetable);
router.get('/teacher/:teacherId', getTeacherTimetable);
router.get('/exams/:classId', getExamTimetable);

router.post('/:id/schedule', authorize('admin'), addSchedule);
router.delete('/:id/schedule/:scheduleId', authorize('admin'), removeSchedule);

router.post('/:id/exam', authorize('admin'), addExamSchedule);
router.put('/:id/exam/:examId', authorize('admin'), updateExamSchedule);

router.get('/upcoming/exams', getUpcomingExams);

module.exports = router;

const express = require('express');
const { 
  getSubjects, 
  createSubject, 
  updateSyllabusStatus, 
  addSyllabusTopic,
  updateSubject,
  deleteSubject,
  addLessonPlan,
  addTeacherNotes
} = require('../controllers/subjectController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getSubjects);
router.post('/', authorize('admin'), createSubject);
router.put('/:id', authorize('admin'), updateSubject);
router.delete('/:id', authorize('admin'), deleteSubject);
router.post('/:id/syllabus', authorize('admin', 'teacher'), addSyllabusTopic);
router.put('/:id/syllabus/:topicId', authorize('admin', 'teacher'), updateSyllabusStatus);
router.post('/:id/lessonplan', authorize('admin', 'teacher'), addLessonPlan);
router.post('/:id/syllabus/:topicId/notes', authorize('admin', 'teacher'), addTeacherNotes);

module.exports = router;

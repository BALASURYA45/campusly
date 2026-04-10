const express = require('express');
const { 
  getAllAssignments,
  getAssignmentsByClass,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeSubmission,
  getStudentSubmissions,
  getAssignmentStats,
  bulkUpdateSubmissions,
  createRubric
} = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getAllAssignments);
router.post('/', authorize('admin', 'teacher'), createAssignment);
router.get('/class/:classId', getAssignmentsByClass);
router.get('/:id', getAssignment);
router.put('/:id', authorize('admin', 'teacher'), updateAssignment);
router.delete('/:id', authorize('admin', 'teacher'), deleteAssignment);

router.post('/:id/submit', authorize('student'), submitAssignment);
router.get('/:id/student-submissions', authorize('student'), getStudentSubmissions);
router.put('/:id/submissions/:submissionId/grade', authorize('admin', 'teacher'), gradeSubmission);
router.get('/:id/stats', authorize('admin', 'teacher'), getAssignmentStats);
router.put('/:id/bulk-update', authorize('admin', 'teacher'), bulkUpdateSubmissions);
router.post('/:id/rubric', authorize('admin', 'teacher'), createRubric);

module.exports = router;

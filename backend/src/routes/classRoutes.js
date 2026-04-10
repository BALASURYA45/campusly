const express = require('express');
const {
  getClasses,
  createClass,
  addStudentToClass,
  addStudentsToClass,
  removeStudentFromClass,
  updateClass,
  deleteClass
} = require('../controllers/classController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', authorize('admin', 'teacher', 'superadmin', 'student', 'parent'), getClasses);
router.post('/', authorize('admin', 'teacher', 'superadmin'), createClass);
router.put('/:id', authorize('admin', 'superadmin'), updateClass);
router.delete('/:id', authorize('admin', 'superadmin'), deleteClass);
router.put('/:id/add-student', authorize('admin', 'teacher', 'superadmin'), addStudentToClass);
router.put('/:id/add-students', authorize('admin', 'teacher', 'superadmin'), addStudentsToClass);
router.put('/:id/remove-student', authorize('admin', 'teacher', 'superadmin'), removeStudentFromClass);

module.exports = router;

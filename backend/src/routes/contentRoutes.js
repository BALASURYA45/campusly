const express = require('express');
const {
  getContents,
  getContent,
  createContent,
  updateContent,
  deleteContent
} = require('../controllers/contentController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .get(getContents)
  .post(authorize('teacher', 'admin', 'superadmin'), createContent);

router
  .route('/:id')
  .get(getContent)
  .put(authorize('teacher', 'admin', 'superadmin'), updateContent)
  .delete(authorize('teacher', 'admin', 'superadmin'), deleteContent);

module.exports = router;

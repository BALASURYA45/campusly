const express = require('express');
const {
  uploadResource,
  getResources,
  getResource,
  updateResource,
  deleteResource,
} = require('../controllers/resourceController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../utils/resourceUpload');

const router = express.Router();

router.use(protect);

router.get('/', getResources);
router.get('/:id', getResource);

router.post('/', authorize('teacher', 'admin', 'superadmin'), upload.single('file'), uploadResource);
router.put('/:id', authorize('teacher', 'admin', 'superadmin'), updateResource);
router.delete('/:id', authorize('teacher', 'admin', 'superadmin'), deleteResource);

module.exports = router;

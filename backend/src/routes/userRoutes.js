const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  uploadAvatar,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../utils/fileUpload');

const router = express.Router();

router.use(protect);

router.get('/', authorize('admin', 'teacher', 'superadmin'), getUsers);
router.post('/', authorize('admin', 'superadmin'), createUser);
router.put('/avatar', upload.single('avatar'), uploadAvatar);
router.route('/:id')
  .get(authorize('admin', 'teacher', 'superadmin'), getUser)
  .put(authorize('admin', 'superadmin'), updateUser)
  .delete(authorize('admin', 'superadmin'), deleteUser);

module.exports = router;

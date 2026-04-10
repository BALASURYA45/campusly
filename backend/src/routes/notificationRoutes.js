const express = require('express');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  sendNotification,
  broadcastNotification,
  getPreferences,
  updatePreferences,
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.get('/count/unread', getUnreadCount);
router.put('/:id/read', markAsRead);
router.put('/mark-all-read', markAllAsRead);
router.delete('/:id', deleteNotification);
router.delete('/', clearAllNotifications);
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);

router.post('/send', authorize('admin', 'teacher', 'superadmin', 'parent'), sendNotification);
router.post('/broadcast', authorize('admin', 'superadmin'), broadcastNotification);

module.exports = router;

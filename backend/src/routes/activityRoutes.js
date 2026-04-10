const express = require('express');
const {
  getActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
  registerForActivity,
  updateParticipantStatus,
  issueCertificate,
  getActivityStats,
  withdrawFromActivity,
} = require('../controllers/activityController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getActivities);
router.post('/', authorize('teacher', 'admin'), createActivity);
router.get('/:id', getActivity);
router.put('/:id', authorize('teacher', 'admin'), updateActivity);
router.delete('/:id', authorize('teacher', 'admin'), deleteActivity);
router.get('/:id/stats', getActivityStats);
router.post('/:id/register', authorize('student'), registerForActivity);
router.post('/:id/withdraw', authorize('student'), withdrawFromActivity);
router.put('/:id/participants/:participantId', authorize('teacher', 'admin'), updateParticipantStatus);
router.post('/:id/issue-certificate', authorize('teacher', 'admin'), issueCertificate);

module.exports = router;

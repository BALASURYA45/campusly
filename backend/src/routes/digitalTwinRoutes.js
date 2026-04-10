const express = require('express');
const router = express.Router();
const { 
  getStudentDigitalTwin, 
  getClassDigitalTwin, 
  syncAllDigitalTwins 
} = require('../controllers/digitalTwinController');
const { protect, authorize } = require('../middleware/auth');

router.get('/:studentId', protect, getStudentDigitalTwin);
router.get('/class/:classId', protect, authorize('teacher', 'admin', 'superadmin'), getClassDigitalTwin);
router.post('/sync', protect, authorize('admin', 'superadmin'), syncAllDigitalTwins);

module.exports = router;

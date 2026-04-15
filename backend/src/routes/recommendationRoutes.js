const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getMyRecommendations } = require('../controllers/recommendationController');

const router = express.Router();

router.use(protect);

router.get('/me', authorize('student'), getMyRecommendations);

module.exports = router;


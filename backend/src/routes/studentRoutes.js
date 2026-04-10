const express = require('express');
const { completeStudentSignup } = require('../controllers/authController');

const router = express.Router();

router.put('/:id/complete-signup', completeStudentSignup);

module.exports = router;

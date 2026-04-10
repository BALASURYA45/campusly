const EarlyWarningService = require('../utils/earlyWarningService');
const User = require('../models/User');

// @desc    Get at-risk students
// @route   GET /api/v1/early-warning/at-risk
// @access  Private/Teacher/Admin
exports.getAtRiskStudents = async (req, res, next) => {
  try {
    const students = await EarlyWarningService.getAtRiskStudents(req.user.id);
    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Log intervention for a student
// @route   POST /api/v1/early-warning/intervention/:studentId
// @access  Private/Teacher/Admin
exports.logIntervention = async (req, res, next) => {
  try {
    const interventions = await EarlyWarningService.logIntervention(
      req.params.studentId,
      req.body,
      req.user.id
    );
    res.status(201).json({
      success: true,
      data: interventions
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Update alert threshold for a student
// @route   PUT /api/v1/early-warning/threshold/:studentId
// @access  Private/Teacher/Admin
exports.updateThreshold = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.digitalTwin.earlyWarning.alertThreshold = req.body.threshold;
    await student.save();

    res.status(200).json({
      success: true,
      data: student.digitalTwin.earlyWarning
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

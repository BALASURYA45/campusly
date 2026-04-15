const Attendance = require('../models/Attendance');
const { notifyAttendanceMarked } = require('../utils/notificationService');
const DigitalTwinService = require('../utils/digitalTwinService');
const { buildAttendanceSummaryFromCounts } = require('../utils/attendanceSummary');
const mongoose = require('mongoose');

// @desc    Mark attendance (idempotent, supports bulk)
// @route   POST /api/v1/attendance
// @access  Private/Teacher/Admin
exports.markAttendance = async (req, res, next) => {
  try {
    const { attendanceRecords } = req.body; // Expect array of records
    const markedBy = req.user.id;

    if (!attendanceRecords || !Array.isArray(attendanceRecords)) {
      return res.status(400).json({ message: 'Please provide attendanceRecords as an array' });
    }

    const operations = attendanceRecords.map(record => ({
      updateOne: {
        filter: { 
          student: record.student, 
          class: record.class, 
          date: record.date, 
          subject: record.subject,
          period: record.period
        },
        update: { ...record, markedBy },
        upsert: true
      }
    }));

    const result = await Attendance.bulkWrite(operations);

    // Notify only if students are provided
    const studentIds = attendanceRecords.map(r => r.student).filter(Boolean);
    if (studentIds.length > 0) {
      // 1. Send Notifications
      await notifyAttendanceMarked(
        attendanceRecords[0].class,
        studentIds,
        attendanceRecords[0].date,
        markedBy
      );

      // 2. Update Digital Twins (Student and Class)
      await DigitalTwinService.updateClassTwin(attendanceRecords[0].class);
      // Limit batch update to avoid performance hit on large classes, or run in background
      Promise.all(studentIds.map(id => DigitalTwinService.updateStudentTwin(id)))
        .catch(err => console.error('Digital Twin sync failed:', err));
    }

    res.status(200).json({ 
      success: true, 
      data: {
        upsertedCount: result.upsertedCount,
        modifiedCount: result.modifiedCount
      } 
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get attendance by class
// @route   GET /api/v1/attendance/class/:classId
// @access  Private/Teacher/Admin
exports.getClassAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.find({ class: req.params.classId })
      .populate('student', 'name email')
      .populate('subject', 'name');

    res.status(200).json({ success: true, data: attendance });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get my attendance (for students)
// @route   GET /api/v1/attendance/me
// @access  Private/Student
exports.getMyAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.find({ student: req.user.id })
      .populate('subject', 'name')
      .populate('class', 'name');

    res.status(200).json({ success: true, data: attendance });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get attendance for a specific student
// @route   GET /api/v1/attendance/student/:studentId
// @access  Private/Student/Parent/Teacher/Admin
exports.getStudentAttendance = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({ message: 'Students can only access their own attendance' });
    }

    if (req.user.role === 'parent') {
      const User = require('../models/User');
      const parent = await User.findById(req.user.id).select('children');
      const hasAccess = parent?.children?.some(childId => childId.toString() === studentId);

      if (!hasAccess) {
        return res.status(403).json({ message: 'Parents can only access linked children attendance' });
      }
    }

    const attendance = await Attendance.find({ student: studentId })
      .populate('subject', 'name')
      .populate('class', 'name');

    res.status(200).json({ success: true, data: attendance });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get my attendance summary (weighted % + 75% calculator)
// @route   GET /api/v1/attendance/me/summary
// @access  Private/Student
exports.getMyAttendanceSummary = async (req, res, next) => {
  try {
    const targetPercentage = Number(req.query.targetPercentage || 75);

    const grouped = await Attendance.aggregate([
      { $match: { student: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const counts = grouped.reduce((acc, row) => {
      acc[row._id] = row.count;
      return acc;
    }, {});

    const summary = buildAttendanceSummaryFromCounts(counts, targetPercentage);

    res.status(200).json({ success: true, data: summary });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get attendance summary for a student
// @route   GET /api/v1/attendance/student/:studentId/summary
// @access  Private/Student/Parent/Teacher/Admin
exports.getStudentAttendanceSummary = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const targetPercentage = Number(req.query.targetPercentage || 75);

    // Reuse the same access checks as getStudentAttendance
    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({ message: 'Students can only access their own attendance' });
    }

    if (req.user.role === 'parent') {
      const User = require('../models/User');
      const parent = await User.findById(req.user.id).select('children');
      const hasAccess = parent?.children?.some(childId => childId.toString() === studentId);

      if (!hasAccess) {
        return res.status(403).json({ message: 'Parents can only access linked children attendance' });
      }
    }

    const grouped = await Attendance.aggregate([
      { $match: { student: new mongoose.Types.ObjectId(studentId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const counts = grouped.reduce((acc, row) => {
      acc[row._id] = row.count;
      return acc;
    }, {});

    const summary = buildAttendanceSummaryFromCounts(counts, targetPercentage);

    res.status(200).json({ success: true, data: summary });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');
const Activity = require('../models/Activity');
const Class = require('../models/Class');
const mongoose = require('mongoose');
const DigitalTwinService = require('../utils/digitalTwinService');

// @desc    Get Digital Twin data for a student
// @route   GET /api/v1/digital-twin/:studentId
// @access  Private (Student/Parent/Teacher/Admin)
exports.getStudentDigitalTwin = async (req, res, next) => {
  try {
    const studentId = req.params.studentId;

    // Sync data before returning
    const twinData = await DigitalTwinService.updateStudentTwin(studentId);
    
    // Also get additional info for detailed response
    const student = await User.findById(studentId).select('name rollNumber email role profileImage');
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Reuse existing logic for detailed metrics if needed, or just return twinData
    // Let's enhance twinData with some details from existing logic
    const attendanceRecords = await Attendance.find({ student: studentId });
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(r => r.status === 'Present').length;
    const odDays = attendanceRecords.filter(r => r.status === 'On-Duty').length;
    
    const assignments = await Assignment.find({ 'submissions.student': studentId });
    const gradedCount = assignments.filter(a => a.submissions.find(s => s.student.toString() === studentId && s.status === 'Graded')).length;

    res.status(200).json({
      success: true,
      data: {
        student: {
          name: student.name,
          rollNumber: student.rollNumber,
          avatar: student.profileImage
        },
        twin: twinData,
        details: {
          attendance: { total: totalDays, present: presentDays, od: odDays },
          academics: { assignmentsCount: assignments.length, graded: gradedCount }
        }
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get Digital Twin data for a classroom
// @route   GET /api/v1/digital-twin/class/:classId
// @access  Private (Teacher/Admin)
exports.getClassDigitalTwin = async (req, res, next) => {
  try {
    const classId = req.params.classId;
    
    // Sync class twin
    const twinData = await DigitalTwinService.updateClassTwin(classId);
    
    const classObj = await Class.findById(classId).populate('teacher', 'name');
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        className: classObj.name,
        teacher: classObj.teacher ? classObj.teacher.name : 'Unassigned',
        twin: twinData
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Sync all digital twins
// @route   POST /api/v1/digital-twin/sync
// @access  Private (Admin)
exports.syncAllDigitalTwins = async (req, res, next) => {
  try {
    await DigitalTwinService.syncAllTwins();
    res.status(200).json({
      success: true,
      message: 'All digital twins synchronized successfully'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


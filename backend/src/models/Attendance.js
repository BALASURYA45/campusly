const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  class: {
    type: mongoose.Schema.ObjectId,
    ref: 'Class',
    required: true,
  },
  subject: {
    type: mongoose.Schema.ObjectId,
    ref: 'Subject',
  },
  period: {
    type: Number,
    required: [true, 'Please specify the period (1-7)'],
    min: 1,
    max: 7,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Half-Day', 'On-Duty'],
    default: 'Present',
  },
  remarks: String,
  markedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
});

// Add unique index to prevent duplicates: studentId + classId + subjectId + period + date
// We match by YYYY-MM-DD format usually, but here we'll ensure index
attendanceSchema.index({ student: 1, class: 1, date: 1, subject: 1, period: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);

const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['ClassTimetable', 'TeacherTimetable', 'ExamTimetable'],
    default: 'ClassTimetable',
  },
  class: {
    type: mongoose.Schema.ObjectId,
    ref: 'Class',
  },
  teacher: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  },
  schedule: [{
    subject: {
      type: mongoose.Schema.ObjectId,
      ref: 'Subject',
    },
    teacher: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    startTime: String, // e.g., "09:00"
    endTime: String, // e.g., "10:00"
    room: String,
    session: String, // Morning, Afternoon, Evening
  }],
  examSchedule: [{
    subject: {
      type: mongoose.Schema.ObjectId,
      ref: 'Subject',
    },
    examDate: Date,
    startTime: String,
    endTime: String,
    location: String,
    examType: {
      type: String,
      enum: ['Midterm', 'Final', 'Unit Test', 'Quiz'],
    },
    totalMarks: Number,
    duration: Number, // in minutes
  }],
  academicYear: String,
  semester: String,
  effectiveFrom: Date,
  effectiveUntil: Date,
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Timetable', timetableSchema);

const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a class name (e.g., Grade 10-A)'],
    unique: true,
  },
  section: String,
  roomNumber: String,
  teacher: {
    type: mongoose.Schema.ObjectId,
    ref: 'User', // Reference to a teacher
  },
  students: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  }],
  digitalTwin: {
    currentAttendanceRate: {
      type: Number,
      default: 0,
    },
    engagementTrend: [{
      date: Date,
      score: Number,
    }],
    resourceUsage: {
      type: Number,
      default: 0, // 0-100 scale
    },
    performanceAverage: {
      type: Number,
      default: 0,
    },
    lastUpdate: {
      type: Date,
      default: Date.now,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Class', classSchema);

const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  durationMinutes: {
    type: Number,
    required: true,
    min: 1,
    max: 24 * 60,
  },
  mode: {
    type: String,
    enum: ['pomodoro', 'deep', 'custom'],
    default: 'pomodoro',
  },
  startedAt: Date,
  endedAt: Date,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

module.exports = mongoose.model('StudySession', studySessionSchema);


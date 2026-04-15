const mongoose = require('mongoose');

const studyProfileSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
    required: true,
  },
  weeklyGoalMinutes: {
    type: Number,
    default: 300,
    min: 30,
    max: 7 * 24 * 60,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('StudyProfile', studyProfileSchema);


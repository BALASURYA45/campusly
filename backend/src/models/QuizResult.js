const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  answers: [{
    questionIndex: Number,
    selectedOptionIndex: Number,
    isCorrect: Boolean,
    pointsEarned: Number,
  }],
  score: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
  durationTaken: Number, // In minutes
});

// Ensure a student can take a quiz only once
quizResultSchema.index({ quiz: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('QuizResult', quizResultSchema);

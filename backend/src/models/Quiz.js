const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a quiz title'],
  },
  description: String,
  subject: {
    type: mongoose.Schema.ObjectId,
    ref: 'Subject',
    required: true,
  },
  class: {
    type: mongoose.Schema.ObjectId,
    ref: 'Class',
    required: true,
  },
  teacher: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  questions: [{
    questionText: {
      type: String,
      required: true,
    },
    options: [{
      type: String,
      required: true,
    }],
    correctOptionIndex: {
      type: Number,
      required: true,
    },
    points: {
      type: Number,
      default: 1,
    }
  }],
  totalMarks: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number, // In minutes
    default: 30,
  },
  dueDate: Date,
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Closed'],
    default: 'Draft',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Quiz', quizSchema);

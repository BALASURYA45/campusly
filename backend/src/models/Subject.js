const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a subject name'],
  },
  code: {
    type: String,
    unique: true,
  },
  description: String,
  teacher: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  class: {
    type: mongoose.Schema.ObjectId,
    ref: 'Class',
    required: true,
  },
  syllabus: [{
    topic: {
      type: String,
      required: true,
    },
    description: String,
    duration: String,
    learningOutcomes: String,
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending',
    },
    completionDate: Date,
    teacherNotes: [{
      notes: String,
      targetAudience: String,
      difficulty: String,
      createdAt: { type: Date, default: Date.now }
    }]
  }],
  lessonPlans: [{
    title: String,
    weekNumber: Number,
    objectives: String,
    resources: String,
    activities: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Subject', subjectSchema);

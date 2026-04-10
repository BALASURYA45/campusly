const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
  },
  description: String,
  instructions: String,
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
  dueDate: {
    type: Date,
    required: true,
  },
  totalMarks: {
    type: Number,
    default: 100,
  },
  allowedFileTypes: [String], // e.g., ['pdf', 'doc', 'docx', 'txt']
  maxSubmissions: {
    type: Number,
    default: 1,
  },
  fileUrl: String,
  attachments: [{
    name: String,
    url: String,
  }],
  submissions: [{
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    submissionNumber: {
      type: Number,
      default: 1,
    },
    fileUrl: String,
    fileName: String,
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    isLate: Boolean,
    grading: {
      marksObtained: Number,
      grade: String, // A, B, C, D, F
      feedback: String,
      detailedComments: String,
      rubricScores: {
        clarity: Number,
        accuracy: Number,
        completeness: Number,
        presentation: Number,
      },
      gradedAt: Date,
      gradedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    },
    status: {
      type: String,
      enum: ['Pending', 'Submitted', 'Late', 'Graded', 'NotSubmitted'],
      default: 'Pending',
    },
  }],
  rubric: {
    enabled: Boolean,
    criteria: [{
      name: String,
      description: String,
      maxScore: Number,
    }],
  },
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Closed'],
    default: 'Draft',
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

module.exports = mongoose.model('Assignment', assignmentSchema);

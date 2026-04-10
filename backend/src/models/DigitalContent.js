const mongoose = require('mongoose');

const DigitalContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  contentType: {
    type: String,
    required: [true, 'Please select content type'],
    enum: ['Video', 'E-Book', 'Study Material', 'Other']
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  class: {
    type: String, // e.g., 'I-CSE'
    required: true
  },
  fileUrl: {
    type: String,
    required: [true, 'Please provide file URL or path']
  },
  thumbnailUrl: String,
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topics: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DigitalContent', DigitalContentSchema);

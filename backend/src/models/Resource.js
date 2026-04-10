const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
  },
  description: String,
  type: {
    type: String,
    enum: ['Video', 'E-book', 'Study Material', 'Link', 'Assignment'],
    required: true,
  },
  fileUrl: {
    type: String,
    required: [true, 'Please provide a file URL or path'],
  },
  fileName: String,
  fileSize: String,
  subject: {
    type: mongoose.Schema.ObjectId,
    ref: 'Subject',
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  class: {
    type: mongoose.Schema.ObjectId,
    ref: 'Class',
  },
  uploadedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Resource', resourceSchema);

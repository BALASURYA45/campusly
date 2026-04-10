const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['attendance', 'performance', 'class', 'teacher', 'activity', 'assignment'],
    required: true,
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  generatedFor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
  },
  dateRange: {
    startDate: Date,
    endDate: Date,
  },
  data: {
    summary: Object,
    details: Object,
    statistics: Object,
  },
  filters: Object,
  isScheduled: {
    type: Boolean,
    default: false,
  },
  scheduleFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
  },
  nextGenerationDate: Date,
  format: {
    type: String,
    enum: ['pdf', 'excel', 'csv', 'json'],
    default: 'json',
  },
  fileUrl: String,
  fileName: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 90 * 24 * 60 * 60 * 1000),
  },
});

reportSchema.index({ generatedBy: 1, createdAt: -1 });
reportSchema.index({ type: 1, createdAt: -1 });
reportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Report', reportSchema);

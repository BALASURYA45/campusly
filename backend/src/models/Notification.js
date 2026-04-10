const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['attendance', 'assignment', 'activity', 'message', 'system', 'alert'],
    default: 'system',
  },
  relatedModel: {
    type: String,
    enum: ['Attendance', 'Assignment', 'Activity', 'Class', 'Subject', null],
  },
  relatedId: mongoose.Schema.Types.ObjectId,
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: Date,
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  notificationMethods: {
    inApp: {
      type: Boolean,
      default: true,
    },
    email: {
      type: Boolean,
      default: false,
    },
    push: {
      type: Boolean,
      default: false,
    },
  },
  emailSent: {
    type: Boolean,
    default: false,
  },
  emailSentAt: Date,
  pushSent: {
    type: Boolean,
    default: false,
  },
  pushSentAt: Date,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  actionUrl: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: Date,
});

notificationSchema.pre('save', function (next) {
  if (!this.expiresAt) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    this.expiresAt = expiryDate;
  }
  next();
});

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', notificationSchema);

const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add an activity title'],
  },
  description: String,
  type: {
    type: String,
    enum: ['Sports', 'Cultural', 'Academic', 'Skill Development', 'Other'],
    default: 'Academic',
  },
  teacher: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  class: {
    type: mongoose.Schema.ObjectId,
    ref: 'Class',
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: Date,
  location: String,
  maxParticipants: Number,
  participants: [{
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['Registered', 'Participated', 'Absent', 'Withdrew'],
      default: 'Registered',
    },
    certificateEarned: {
      type: Boolean,
      default: false,
    },
    certificateDate: Date,
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  status: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Upcoming',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Activity', activitySchema);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  role: {
    type: String,
    enum: ['admin', 'teacher', 'student', 'parent', 'superadmin'],
    default: 'student',
  },
  rollNumber: {
    type: String,
    unique: true,
    sparse: true, // Only unique if present (for students)
  },
  employeeId: {
    type: String,
    unique: true,
    sparse: true, // Only unique if present (for teachers)
  },
  parentId: {
    type: String,
    unique: true,
    sparse: true, // Only unique if present (for parents)
  },
  children: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  }],
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false,
  },
  profileImage: String,
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  notificationPreferences: {
    email: {
      type: Boolean,
      default: true,
    },
    push: {
      type: Boolean,
      default: true,
    },
    inApp: {
      type: Boolean,
      default: true,
    },
  },
  digitalTwin: {
    engagementScore: {
      type: Number,
      default: 0, // 0-100 scale
    },
    predictedPerformance: {
      type: String,
      enum: ['Excellent', 'Good', 'Average', 'Below Average', 'At Risk'],
      default: 'Average',
    },
    // Teacher specific metrics
    teachingLoad: {
      type: Number,
      default: 0, // Number of classes/hours
    },
    gradingEfficiency: {
      type: Number,
      default: 100, // 0-100 scale based on how quickly assignments are graded
    },
    contentRichness: {
      type: Number,
      default: 0, // Based on digital content uploads
    },
    learningStyle: {
      type: String,
      enum: ['Visual', 'Auditory', 'Reading/Writing', 'Kinesthetic', 'Undetermined'],
      default: 'Undetermined',
    },
    activityHeatmap: [{
      date: Date,
      score: Number,
    }],
    lastSync: {
      type: Date,
      default: Date.now,
    },
    earlyWarning: {
      status: {
        type: String,
        enum: ['Normal', 'Monitoring', 'Critical'],
        default: 'Normal',
      },
      alertThreshold: {
        type: Number,
        default: 50, // Threshold for alert (Engagement Score)
      },
      lastAlertDate: Date,
    },
    interventions: [{
      type: {
        type: String,
        enum: ['Counseling', 'Remedial Class', 'Parent Meeting', 'Peer Mentoring', 'Other'],
      },
      description: String,
      startDate: {
        type: Date,
        default: Date.now,
      },
      endDate: Date,
      status: {
        type: String,
        enum: ['Planned', 'Ongoing', 'Completed', 'Cancelled'],
        default: 'Planned',
      },
      effectiveness: {
        type: String,
        enum: ['Improving', 'Stable', 'Declining', 'Unknown'],
        default: 'Stable',
      },
      assignedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
      notes: String,
    }],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('User', userSchema);

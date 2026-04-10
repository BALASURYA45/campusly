const mongoose = require('mongoose');

const themeSchema = new mongoose.Schema({
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    default: null,
  },
  name: {
    type: String,
    required: true,
    default: 'Default Theme',
  },
  description: String,
  primaryColor: {
    type: String,
    default: '#1976d2',
    match: /^#[0-9A-Fa-f]{6}$/,
  },
  secondaryColor: {
    type: String,
    default: '#dc004e',
    match: /^#[0-9A-Fa-f]{6}$/,
  },
  backgroundColor: {
    type: String,
    default: '#ffffff',
    match: /^#[0-9A-Fa-f]{6}$/,
  },
  textColor: {
    type: String,
    default: '#000000',
    match: /^#[0-9A-Fa-f]{6}$/,
  },
  successColor: {
    type: String,
    default: '#4caf50',
    match: /^#[0-9A-Fa-f]{6}$/,
  },
  errorColor: {
    type: String,
    default: '#f44336',
    match: /^#[0-9A-Fa-f]{6}$/,
  },
  warningColor: {
    type: String,
    default: '#ff9800',
    match: /^#[0-9A-Fa-f]{6}$/,
  },
  infoColor: {
    type: String,
    default: '#2196f3',
    match: /^#[0-9A-Fa-f]{6}$/,
  },
  logo: String,
  favicon: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  isSystem: {
    type: Boolean,
    default: false,
  },
  settings: {
    roundedCorners: {
      type: Boolean,
      default: true,
    },
    shadowDepth: {
      type: String,
      enum: ['none', 'light', 'medium', 'heavy'],
      default: 'light',
    },
    animationDuration: {
      type: Number,
      default: 300,
      min: 0,
      max: 1000,
    },
    fontFamily: {
      type: String,
      default: 'Inter, Roboto, Helvetica, Arial, sans-serif',
    },
  },
  darkMode: {
    enabled: {
      type: Boolean,
      default: true,
    },
    primaryColor: {
      type: String,
      default: '#90caf9',
      match: /^#[0-9A-Fa-f]{6}$/,
    },
    secondaryColor: {
      type: String,
      default: '#f48fb1',
      match: /^#[0-9A-Fa-f]{6}$/,
    },
    backgroundColor: {
      type: String,
      default: '#121212',
      match: /^#[0-9A-Fa-f]{6}$/,
    },
    textColor: {
      type: String,
      default: '#ffffff',
      match: /^#[0-9A-Fa-f]{6}$/,
    },
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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

// Update updatedAt before saving
themeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Theme', themeSchema);

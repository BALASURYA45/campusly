const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, password, role, rollNumber } = req.body;
    const email = 'balasuryad13062006@gmail.com'; // Use common email for all users

    // Validate required fields
    if (!name || !password || !role) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Students must have a roll number
    if (role === 'student' && !rollNumber) {
      return res.status(400).json({ message: 'Students must provide a roll number' });
    }

    // Check if user already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    if (role === 'student' && rollNumber) {
      existingUser = await User.findOne({ rollNumber });
      if (existingUser) {
        return res.status(400).json({ message: 'Roll number already registered' });
      }
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');

    // Create user object - only add rollNumber for students
    const userData = {
      name,
      email,
      password,
      role,
      verificationToken,
      isVerified: process.env.NODE_ENV === 'production' ? false : true, // Auto-verify in development
    };

    // Only add rollNumber for students
    if (role === 'student' && rollNumber) {
      userData.rollNumber = rollNumber;
    }

    // Create user
    const user = await User.create(userData);

    // Try to send verification email, but don't fail registration if it doesn't work
    if (process.env.NODE_ENV === 'production') {
      const verifyUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verifyemail/${verificationToken}`;
      const message = `Please verify your email by clicking the link: \n\n ${verifyUrl}`;
      
      try {
        await sendEmail({
          email: user.email,
          subject: 'Email Verification',
          message,
        });
      } catch (err) {
        console.error('Email send error:', err.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Registration Error:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ message: `${field} already registered` });
    }
    res.status(500).json({ message: err.message || 'Error creating user' });
  }
};

// @desc    Verify email
// @route   GET /api/v1/auth/verifyemail/:token
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });

    if (!user) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password, rollNumber, employeeId, parentId, role: expectedRole } = req.body;

    // Validate identifiers & password
    if ((!email && !rollNumber && !employeeId && !parentId) || !password) {
      return res.status(400).json({ message: 'Please provide email/rollNumber/employeeId and password' });
    }

    // Check for user
    let user;
    if (rollNumber) {
      user = await User.findOne({ rollNumber: rollNumber.toUpperCase() }).select('+password');
    } else if (employeeId) {
      user = await User.findOne({ employeeId: employeeId.toUpperCase() }).select('+password');
    } else if (parentId) {
      user = await User.findOne({ parentId: parentId.toUpperCase() }).select('+password').populate('children');
    } else {
      user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    }

    if (!user) {
      return res.status(401).json({ message: 'User not found. Please check your credentials.' });
    }

    // Role validation
    if (expectedRole && user.role !== expectedRole) {
      return res.status(401).json({ message: `Access denied. User is not registered as ${expectedRole}.` });
    }

    // Check if password matches (before checking verification)
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password. Please try again.' });
    }

    // Auto-verify user if not verified (for development)
    if (!user.isVerified) {
      user.isVerified = true;
      user.verificationToken = undefined;
      await user.save();
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Internal Server Error during login' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate('children', 'name rollNumber email profileImage digitalTwin');

  res.status(200).json({
    success: true,
    data: user,
  });
};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  const { rollNumber } = req.body;
  const resetEmail = 'balasuryad13062006@gmail.com';

  if (!rollNumber) {
    return res.status(400).json({ message: 'Please provide your roll number' });
  }

  const user = await User.findOne({
    rollNumber: rollNumber.toUpperCase(),
  });

  if (!user) {
    return res.status(404).json({ message: 'No user found with that roll number' });
  }

  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

  const message = `A password reset was requested for roll number ${user.rollNumber}. Open this link to set a new password:\n\n${resetUrl}\n\nThis link expires in 10 minutes. If you did not request this, you can ignore this email.`;

  try {
    await sendEmail({
      email: resetEmail,
      subject: 'Smart Curriculum Password Reset',
      message,
    });

    res.status(200).json({
      success: true,
      message: `Password reset link sent to ${resetEmail}`,
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return res.status(500).json({ message: 'Email could not be sent' });
  }
};

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  if (!req.body.password) {
    return res.status(400).json({ message: 'Please provide a new password' });
  }

  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid token' });
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
};

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      // email: req.body.email, // Prevent updating email to keep it common
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({ message: 'Password is incorrect' });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Verify student credentials for signup
// @route   POST /api/v1/auth/verify-student-credentials
// @access  Public
exports.verifyStudentCredentials = async (req, res, next) => {
  try {
    const { rollNumber, password } = req.body;

    if (!rollNumber || !password) {
      return res.status(400).json({ message: 'Please provide roll number and password' });
    }

    const user = await User.findOne({ rollNumber }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Roll number not found' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    res.status(200).json({
      success: true,
      message: 'Credentials verified',
      data: {
        _id: user._id,
        rollNumber: user.rollNumber,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error verifying credentials' });
  }
};

// @desc    Complete student signup with profile info
// @route   PUT /api/v1/students/:id/complete-signup
// @access  Public
exports.completeStudentSignup = async (req, res, next) => {
  try {
    const { name } = req.body;
    const email = 'balasuryad13062006@gmail.com'; // Use common email for all users

    if (!name) {
      return res.status(400).json({ message: 'Please provide name' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, isVerified: true },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Profile completed successfully',
      data: user,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    rollNumber: user.rollNumber || null,
    employeeId: user.employeeId || null,
    parentId: user.parentId || null,
    children: user.children || []
  };

  res.status(statusCode).json({
    success: true,
    token,
    user: userData
  });
};

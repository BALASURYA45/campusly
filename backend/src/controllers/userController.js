const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    let query;
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
    removeFields.forEach((param) => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    query = User.find(JSON.parse(queryStr));

    // Search functionality
    if (req.query.search) {
      const search = req.query.search;
      query = query.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { rollNumber: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      });
    }

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await User.countDocuments();

    query = query.skip(startIndex).limit(limit);

    const users = await query;

    res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        total,
        page,
        limit,
      },
      data: users,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Create user
// @route   POST /api/v1/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, rollNumber, employeeId, parentId, children } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide name, email, password, and role' });
    }

    if (role === 'student' && !rollNumber) {
      return res.status(400).json({ message: 'Roll number is required for students' });
    }

    if (role === 'teacher' && !employeeId) {
      return res.status(400).json({ message: 'Employee ID is required for teachers' });
    }

    if (role === 'parent' && !parentId) {
      return res.status(400).json({ message: 'Parent ID is required for parents' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingEmailUser = await User.findOne({ email: normalizedEmail });
    if (existingEmailUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const payload = {
      name: String(name).trim(),
      email: normalizedEmail,
      password: String(password),
      role,
      isVerified: true,
      verificationToken: undefined,
    };

    if (role === 'student') payload.rollNumber = String(rollNumber).trim().toUpperCase();
    if (role === 'teacher') payload.employeeId = String(employeeId).trim().toUpperCase();
    if (role === 'parent') payload.parentId = String(parentId).trim().toUpperCase();
    if (role === 'parent' && Array.isArray(children)) payload.children = children;

    const user = await User.create(payload);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    if (err.code === 11000) {
      const duplicateField = Object.keys(err.keyPattern || {})[0] || 'field';
      return res.status(400).json({ message: `${duplicateField} already exists` });
    }
    res.status(400).json({ message: err.message });
  }
};

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const updateData = { ...req.body };

    if (Object.prototype.hasOwnProperty.call(updateData, 'email') && updateData.email) {
      const normalizedEmail = String(updateData.email).trim().toLowerCase();
      const existingEmailUser = await User.findOne({ email: normalizedEmail, _id: { $ne: req.params.id } });
      if (existingEmailUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      updateData.email = normalizedEmail;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Upload avatar
// @route   PUT /api/v1/users/avatar
// @access  Private
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const user = await User.findById(req.user.id);
    user.profileImage = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    res.status(200).json({
      success: true,
      data: user.profileImage
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

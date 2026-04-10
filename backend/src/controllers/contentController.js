const DigitalContent = require('../models/DigitalContent');
const Subject = require('../models/Subject');
const User = require('../models/User');

// @desc    Get all digital content with filters
// @route   GET /api/v1/content
// @access  Private
exports.getContents = async (req, res, next) => {
  try {
    let query;

    // Build filter object
    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    query = DigitalContent.find(reqQuery).populate('subject', 'name code').populate('uploadedBy', 'name');

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

    const contents = await query;

    res.status(200).json({
      success: true,
      count: contents.length,
      data: contents
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get single content
// @route   GET /api/v1/content/:id
// @access  Private
exports.getContent = async (req, res, next) => {
  try {
    const content = await DigitalContent.findById(req.params.id)
      .populate('subject', 'name code')
      .populate('uploadedBy', 'name');

    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    res.status(200).json({
      success: true,
      data: content
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Create new digital content
// @route   POST /api/v1/content
// @access  Private/Teacher/Admin
exports.createContent = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.uploadedBy = req.user.id;

    const content = await DigitalContent.create(req.body);

    res.status(201).json({
      success: true,
      data: content
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update digital content
// @route   PUT /api/v1/content/:id
// @access  Private/Teacher/Admin
exports.updateContent = async (req, res, next) => {
  try {
    let content = await DigitalContent.findById(req.params.id);

    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    // Make sure user is owner or admin
    if (content.uploadedBy.toString() !== req.user.id && !['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(401).json({ success: false, message: 'Not authorized to update' });
    }

    content = await DigitalContent.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: content
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete digital content
// @route   DELETE /api/v1/content/:id
// @access  Private/Teacher/Admin
exports.deleteContent = async (req, res, next) => {
  try {
    const content = await DigitalContent.findById(req.params.id);

    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    // Make sure user is owner or admin
    if (content.uploadedBy.toString() !== req.user.id && !['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete' });
    }

    await content.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

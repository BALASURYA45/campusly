const Resource = require('../models/Resource');
const Subject = require('../models/Subject');
const User = require('../models/User');

// @desc    Upload new digital content
// @route   POST /api/v1/resources
// @access  Private/Teacher/Admin
exports.uploadResource = async (req, res, next) => {
  try {
    req.body.uploadedBy = req.user.id;

    if (req.file) {
      req.body.fileUrl = `/uploads/resources/${req.file.filename}`;
      req.body.fileName = req.file.originalname;
      req.body.fileSize = `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`;
    }

    const resource = await Resource.create(req.body);
    res.status(201).json({ success: true, data: resource });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get all resources
// @route   GET /api/v1/resources
// @access  Private
exports.getResources = async (req, res, next) => {
  try {
    const { subject, topic, type, class: classId } = req.query;
    const filter = {};
    if (subject) filter.subject = subject;
    if (topic) filter.topic = { $regex: topic, $options: 'i' };
    if (type) filter.type = type;
    if (classId) filter.class = classId;

    const resources = await Resource.find(filter)
      .populate('subject', 'name code')
      .populate('class', 'name')
      .populate('uploadedBy', 'name');

    res.status(200).json({ success: true, count: resources.length, data: resources });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get single resource
// @route   GET /api/v1/resources/:id
// @access  Private
exports.getResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('subject', 'name')
      .populate('class', 'name')
      .populate('uploadedBy', 'name');

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.status(200).json({ success: true, data: resource });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Update resource
// @route   PUT /api/v1/resources/:id
// @access  Private/Teacher/Admin
exports.updateResource = async (req, res, next) => {
  try {
    let resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check authorization
    if (resource.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this resource' });
    }

    resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: resource });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Delete resource
// @route   DELETE /api/v1/resources/:id
// @access  Private/Teacher/Admin
exports.deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check authorization
    if (resource.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this resource' });
    }

    await Resource.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

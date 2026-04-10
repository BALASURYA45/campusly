const Class = require('../models/Class');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Get all classes
// @route   GET /api/v1/classes
// @access  Private/Admin/Teacher
exports.getClasses = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'student') {
      query = { students: req.user.id };
    } else if (req.user.role === 'parent') {
      const parent = await User.findById(req.user.id).select('children');
      query = { students: { $in: parent?.children || [] } };
    }

    const classes = await Class.find(query)
      .populate('teacher', 'name email')
      .populate('students', 'name email rollNumber profileImage');
    res.status(200).json({ success: true, data: classes });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Create new class
// @route   POST /api/v1/classes
// @access  Private/Admin/Teacher
exports.createClass = async (req, res, next) => {
  try {
    // If teacher is creating, automatically set them as the teacher
    if (req.user.role === 'teacher') {
      req.body.teacher = req.user.id;
    }

    const classObj = await Class.create(req.body);
    res.status(201).json({ success: true, data: classObj });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Add multiple students to class
// @route   PUT /api/v1/classes/:id/add-students
// @access  Private/Admin/Teacher
exports.addStudentsToClass = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid class ID' });
    }

    const classObj = await Class.findById(req.params.id);
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if user is the teacher of this class or an admin
    const isTeacher = classObj.teacher && classObj.teacher.toString() === req.user.id.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    
    if (!isTeacher && !isAdmin) {
      return res.status(401).json({ message: 'Not authorized to add students to this class' });
    }

    const { studentIds } = req.body; // Array of student IDs

    if (!studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({ message: 'Please provide an array of student IDs' });
    }

    if (studentIds.length === 0) {
      return res.status(400).json({ message: 'Please select at least one student' });
    }

    // Validate all student IDs exist and are valid ObjectIds
    const validStudentIds = [];
    for (const id of studentIds) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        const student = await User.findById(id);
        if (student && student.role === 'student') {
          validStudentIds.push(id);
        }
      }
    }

    if (validStudentIds.length === 0) {
      return res.status(400).json({ message: 'No valid students found to add' });
    }

    // Add unique students only
    validStudentIds.forEach(id => {
      const idStr = id.toString();
      if (!classObj.students.map(s => s.toString()).includes(idStr)) {
        classObj.students.push(id);
      }
    });

    await classObj.save();

    res.status(200).json({ success: true, data: classObj });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Add student to class
// @route   PUT /api/v1/classes/:id/add-student
// @access  Private/Admin/Teacher
exports.addStudentToClass = async (req, res, next) => {
  try {
    const classObj = await Class.findById(req.params.id);
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if user is the teacher of this class or an admin
    if (classObj.teacher.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(401).json({ message: 'Not authorized to add student to this class' });
    }

    const { studentId } = req.body;
    if (!classObj.students.includes(studentId)) {
      classObj.students.push(studentId);
      await classObj.save();
    }

    res.status(200).json({ success: true, data: classObj });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Update class
// @route   PUT /api/v1/classes/:id
// @access  Private/Admin
exports.updateClass = async (req, res, next) => {
  try {
    const classObj = await Class.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.status(200).json({ success: true, data: classObj });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Remove student from class
// @route   PUT /api/v1/classes/:id/remove-student
// @access  Private/Admin/Teacher
exports.removeStudentFromClass = async (req, res, next) => {
  try {
    const classObj = await Class.findById(req.params.id);
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }

    if (classObj.teacher.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(401).json({ message: 'Not authorized to remove student from this class' });
    }

    const { studentId } = req.body;
    classObj.students = classObj.students.filter(id => id.toString() !== studentId);
    await classObj.save();

    res.status(200).json({ success: true, message: 'Student removed from class', data: classObj });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Delete class
// @route   DELETE /api/v1/classes/:id
// @access  Private/Admin
exports.deleteClass = async (req, res, next) => {
  try {
    const classObj = await Class.findByIdAndDelete(req.params.id);
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

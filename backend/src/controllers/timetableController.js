const Timetable = require('../models/Timetable');

// @desc    Get all timetables
// @route   GET /api/v1/timetable
// @access  Private
exports.getTimetables = async (req, res, next) => {
  try {
    let query;
    
    if (req.user.role === 'teacher') {
      query = Timetable.find({
        $or: [
          { teacher: req.user.id },
          { 'schedule.teacher': req.user.id }
        ]
      });
    } else if (req.user.role === 'student') {
      // Fetch class from student's data (assuming student has a class field)
      query = Timetable.find({ class: req.user.class });
    } else {
      query = Timetable.find();
    }

    const timetables = await query
      .populate('class', 'name')
      .populate('teacher', 'name email')
      .populate('schedule.subject', 'name code')
      .populate('schedule.teacher', 'name email')
      .populate('examSchedule.subject', 'name code')
      .populate('createdBy', 'name');

    res.status(200).json({ success: true, data: timetables });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get single timetable
// @route   GET /api/v1/timetable/:id
// @access  Private
exports.getTimetable = async (req, res, next) => {
  try {
    const timetable = await Timetable.findById(req.params.id)
      .populate('class', 'name')
      .populate('teacher', 'name email')
      .populate('schedule.subject', 'name code')
      .populate('schedule.teacher', 'name email')
      .populate('examSchedule.subject', 'name code')
      .populate('createdBy', 'name');

    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    res.status(200).json({ success: true, data: timetable });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Create timetable
// @route   POST /api/v1/timetable
// @access  Private/Admin
exports.createTimetable = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    const timetable = await Timetable.create(req.body);
    await timetable.populate('class', 'name');
    
    res.status(201).json({ success: true, data: timetable });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Update timetable
// @route   PUT /api/v1/timetable/:id
// @access  Private/Admin
exports.updateTimetable = async (req, res, next) => {
  try {
    req.body.updatedAt = new Date();
    const timetable = await Timetable.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    res.status(200).json({ success: true, data: timetable });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Delete timetable
// @route   DELETE /api/v1/timetable/:id
// @access  Private/Admin
exports.deleteTimetable = async (req, res, next) => {
  try {
    const timetable = await Timetable.findByIdAndDelete(req.params.id);
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get class timetable
// @route   GET /api/v1/timetable/class/:classId
// @access  Private
exports.getClassTimetable = async (req, res, next) => {
  try {
    const timetables = await Timetable.find({
      class: req.params.classId,
      type: 'ClassTimetable'
    })
      .populate('class', 'name')
      .populate('schedule.subject', 'name code')
      .populate('schedule.teacher', 'name email');

    res.status(200).json({ success: true, data: timetables });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get teacher timetable
// @route   GET /api/v1/timetable/teacher/:teacherId
// @access  Private
exports.getTeacherTimetable = async (req, res, next) => {
  try {
    const timetables = await Timetable.find({
      $or: [
        { teacher: req.params.teacherId },
        { 'schedule.teacher': req.params.teacherId }
      ],
      type: 'TeacherTimetable'
    })
      .populate('teacher', 'name email')
      .populate('schedule.subject', 'name code')
      .populate('schedule.class', 'name');

    res.status(200).json({ success: true, data: timetables });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get exam timetable
// @route   GET /api/v1/timetable/exams/:classId
// @access  Private
exports.getExamTimetable = async (req, res, next) => {
  try {
    const timetables = await Timetable.find({
      class: req.params.classId,
      type: 'ExamTimetable'
    })
      .populate('class', 'name')
      .populate('examSchedule.subject', 'name code');

    res.status(200).json({ success: true, data: timetables });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Add schedule to timetable
// @route   POST /api/v1/timetable/:id/schedule
// @access  Private/Admin
exports.addSchedule = async (req, res, next) => {
  try {
    const timetable = await Timetable.findById(req.params.id);
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    timetable.schedule.push(req.body);
    await timetable.save();

    res.status(200).json({ success: true, data: timetable });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Remove schedule from timetable
// @route   DELETE /api/v1/timetable/:id/schedule/:scheduleId
// @access  Private/Admin
exports.removeSchedule = async (req, res, next) => {
  try {
    const timetable = await Timetable.findById(req.params.id);
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    timetable.schedule.id(req.params.scheduleId).deleteOne();
    await timetable.save();

    res.status(200).json({ success: true, data: timetable });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Add exam schedule
// @route   POST /api/v1/timetable/:id/exam
// @access  Private/Admin
exports.addExamSchedule = async (req, res, next) => {
  try {
    const timetable = await Timetable.findById(req.params.id);
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    timetable.examSchedule.push(req.body);
    await timetable.save();

    res.status(200).json({ success: true, data: timetable });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Update exam schedule
// @route   PUT /api/v1/timetable/:id/exam/:examId
// @access  Private/Admin
exports.updateExamSchedule = async (req, res, next) => {
  try {
    const timetable = await Timetable.findById(req.params.id);
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    const exam = timetable.examSchedule.id(req.params.examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    Object.assign(exam, req.body);
    await timetable.save();

    res.status(200).json({ success: true, data: timetable });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get upcoming exams for student
// @route   GET /api/v1/timetable/upcoming-exams
// @access  Private/Student
exports.getUpcomingExams = async (req, res, next) => {
  try {
    const now = new Date();
    const upcomingExams = await Timetable.find({
      type: 'ExamTimetable',
      'examSchedule.examDate': { $gte: now }
    })
      .populate('class', 'name')
      .populate('examSchedule.subject', 'name code');

    res.status(200).json({ success: true, data: upcomingExams });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

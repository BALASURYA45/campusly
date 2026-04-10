const Subject = require('../models/Subject');

// @desc    Get all subjects
// @route   GET /api/v1/subjects
// @access  Private
exports.getSubjects = async (req, res, next) => {
  try {
    let query;
    if (req.user.role === 'teacher') {
      query = Subject.find({ teacher: req.user.id });
    } else if (req.user.role === 'student') {
      // Logic for student subjects (matching their class) would go here
      query = Subject.find(); 
    } else {
      query = Subject.find();
    }

    const subjects = await query.populate('teacher', 'name').populate('class', 'name');
    res.status(200).json({ success: true, data: subjects });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Create subject
// @route   POST /api/v1/subjects
// @access  Private/Admin
exports.createSubject = async (req, res, next) => {
  try {
    const subject = await Subject.create(req.body);
    res.status(201).json({ success: true, data: subject });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Update subject syllabus topic status
// @route   PUT /api/v1/subjects/:id/syllabus/:topicId
// @access  Private/Teacher/Admin
exports.updateSyllabusStatus = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const topic = subject.syllabus.id(req.params.topicId);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    topic.status = req.body.status;
    if (req.body.status === 'Completed') {
      topic.completionDate = Date.now();
    }

    await subject.save();
    res.status(200).json({ success: true, data: subject });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Add syllabus topic
// @route   POST /api/v1/subjects/:id/syllabus
// @access  Private/Teacher/Admin
exports.addSyllabusTopic = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    subject.syllabus.push(req.body);
    await subject.save();
    res.status(200).json({ success: true, data: subject });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Update subject
// @route   PUT /api/v1/subjects/:id
// @access  Private/Admin
exports.updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.status(200).json({ success: true, data: subject });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Delete subject
// @route   DELETE /api/v1/subjects/:id
// @access  Private/Admin
exports.deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Add lesson plan
// @route   POST /api/v1/subjects/:id/lessonplan
// @access  Private/Teacher/Admin
exports.addLessonPlan = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    subject.lessonPlans.push(req.body);
    await subject.save();
    res.status(201).json({ success: true, data: subject });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Add teacher notes to topic
// @route   POST /api/v1/subjects/:id/syllabus/:topicId/notes
// @access  Private/Teacher/Admin
exports.addTeacherNotes = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const topic = subject.syllabus.id(req.params.topicId);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    topic.teacherNotes.push(req.body);
    await subject.save();
    res.status(201).json({ success: true, data: subject });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

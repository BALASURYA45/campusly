const Assignment = require('../models/Assignment');
const { notifyAssignmentCreated, notifyAssignmentSubmitted } = require('../utils/notificationService');
const DigitalTwinService = require('../utils/digitalTwinService');

// @desc    Get all assignments
// @route   GET /api/v1/assignments
// @access  Private
exports.getAllAssignments = async (req, res, next) => {
  try {
    let query;
    
    if (req.user.role === 'teacher') {
      query = Assignment.find({ teacher: req.user.id });
    } else if (req.user.role === 'student') {
      query = Assignment.find();
    } else {
      query = Assignment.find();
    }

    const assignments = await query
      .populate('subject', 'name code')
      .populate('class', 'name')
      .populate('teacher', 'name email')
      .populate('submissions.student', 'name email rollNumber');

    res.status(200).json({ success: true, data: assignments });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get assignments for a class
// @route   GET /api/v1/assignments/class/:classId
// @access  Private
exports.getAssignmentsByClass = async (req, res, next) => {
  try {
    const assignments = await Assignment.find({ class: req.params.classId })
      .populate('subject', 'name')
      .populate('teacher', 'name')
      .populate('submissions.student', 'name email rollNumber');
    
    res.status(200).json({ success: true, data: assignments });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get single assignment with submissions
// @route   GET /api/v1/assignments/:id
// @access  Private/Teacher/Admin
exports.getAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('submissions.student', 'name email rollNumber')
      .populate('submissions.grading.gradedBy', 'name')
      .populate('subject', 'name code')
      .populate('class', 'name')
      .populate('teacher', 'name email');
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.status(200).json({ success: true, data: assignment });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Create assignment
// @route   POST /api/v1/assignments
// @access  Private/Teacher/Admin
exports.createAssignment = async (req, res, next) => {
  try {
    req.body.teacher = req.user.id;
    req.body.status = 'Published';

    const assignment = await Assignment.create(req.body);
    await assignment.populate('subject', 'name');
    await assignment.populate('class', 'name');

    const Class = require('../models/Class');
    const cls = await Class.findById(assignment.class);
    if (cls && cls.students && cls.students.length > 0) {
      await notifyAssignmentCreated(
        assignment._id,
        assignment.class,
        req.user.id,
        assignment.title,
        assignment.dueDate
      );
    }

    res.status(201).json({ success: true, data: assignment });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Update assignment
// @route   PUT /api/v1/assignments/:id
// @access  Private/Teacher/Admin
exports.updateAssignment = async (req, res, next) => {
  try {
    let assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check authorization
    if (assignment.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this assignment' });
    }

    req.body.updatedAt = new Date();
    assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: assignment });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/v1/assignments/:id
// @access  Private/Teacher/Admin
exports.deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check authorization
    if (assignment.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this assignment' });
    }

    await Assignment.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Submit assignment
// @route   POST /api/v1/assignments/:id/submit
// @access  Private/Student
exports.submitAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if student already submitted
    const existingSubmission = assignment.submissions.find(
      s => s.student.toString() === req.user.id
    );

    if (existingSubmission && assignment.maxSubmissions === 1) {
      return res.status(400).json({ message: 'You have already submitted this assignment' });
    }

    const submissionCount = assignment.submissions.filter(
      s => s.student.toString() === req.user.id
    ).length;

    if (submissionCount >= assignment.maxSubmissions) {
      return res.status(400).json({ message: 'Maximum submission limit reached' });
    }

    const isLate = new Date() > assignment.dueDate;

    const submission = {
      student: req.user.id,
      fileUrl: req.body.fileUrl,
      fileName: req.body.fileName,
      submissionNumber: submissionCount + 1,
      submittedAt: new Date(),
      isLate,
      status: isLate ? 'Late' : 'Submitted',
    };

    assignment.submissions.push(submission);
    await assignment.save();

    // Trigger Digital Twin sync for student and class
    DigitalTwinService.updateStudentTwin(req.user.id).catch(err => console.error('Student Twin sync failed:', err));
    DigitalTwinService.updateClassTwin(assignment.class).catch(err => console.error('Class Twin sync failed:', err));

    await assignment.populate('submissions.student', 'name email');

    const User = require('../models/User');
    const student = await User.findById(req.user.id);
    if (student) {
      await notifyAssignmentSubmitted(
        assignment._id,
        req.user.id,
        student.name,
        assignment.teacher
      );
    }

    res.status(200).json({ success: true, data: assignment });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Grade a submission with detailed feedback
// @route   PUT /api/v1/assignments/:id/submissions/:submissionId/grade
// @access  Private/Teacher/Admin
exports.gradeSubmission = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const submission = assignment.submissions.id(req.params.submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Calculate grade from marks
    const marksObtained = req.body.marksObtained || 0;
    const totalMarks = assignment.totalMarks || 100;
    const percentage = (marksObtained / totalMarks) * 100;

    let grade = 'F';
    if (percentage >= 90) grade = 'A';
    else if (percentage >= 80) grade = 'B';
    else if (percentage >= 70) grade = 'C';
    else if (percentage >= 60) grade = 'D';

    submission.grading = {
      marksObtained,
      grade: req.body.grade || grade,
      feedback: req.body.feedback,
      detailedComments: req.body.detailedComments,
      rubricScores: req.body.rubricScores,
      gradedAt: new Date(),
      gradedBy: req.user.id,
    };

    submission.status = 'Graded';

    await assignment.save();

    // Trigger Digital Twin sync for student and class after grading
    DigitalTwinService.updateStudentTwin(submission.student).catch(err => console.error('Student Twin sync failed:', err));
    DigitalTwinService.updateClassTwin(assignment.class).catch(err => console.error('Class Twin sync failed:', err));

    await assignment.populate('submissions.grading.gradedBy', 'name');

    res.status(200).json({ success: true, data: assignment });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get student submissions for assignment
// @route   GET /api/v1/assignments/:id/student-submissions
// @access  Private/Student
exports.getStudentSubmissions = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const studentSubmissions = assignment.submissions.filter(
      s => s.student.toString() === req.user.id
    );

    res.status(200).json({ success: true, data: studentSubmissions });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get grading statistics for assignment
// @route   GET /api/v1/assignments/:id/stats
// @access  Private/Teacher/Admin
exports.getAssignmentStats = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const totalStudents = assignment.class.length || 0;
    const submitted = assignment.submissions.filter(s => s.status === 'Submitted' || s.status === 'Graded').length;
    const graded = assignment.submissions.filter(s => s.status === 'Graded').length;
    const pending = assignment.submissions.filter(s => s.status === 'Pending').length;
    const late = assignment.submissions.filter(s => s.isLate).length;

    let avgMarks = 0;
    let avgGrade = '';
    const gradedSubmissions = assignment.submissions.filter(s => s.grading?.marksObtained);

    if (gradedSubmissions.length > 0) {
      avgMarks = (
        gradedSubmissions.reduce((acc, s) => acc + (s.grading.marksObtained || 0), 0) /
        gradedSubmissions.length
      ).toFixed(2);
    }

    const stats = {
      totalStudents,
      submitted,
      graded,
      pending,
      late,
      submissionRate: totalStudents > 0 ? ((submitted / totalStudents) * 100).toFixed(2) : 0,
      gradingRate: submitted > 0 ? ((graded / submitted) * 100).toFixed(2) : 0,
      averageMarks: avgMarks,
      highestMarks: Math.max(...gradedSubmissions.map(s => s.grading?.marksObtained || 0)),
      lowestMarks: Math.min(...gradedSubmissions.map(s => s.grading?.marksObtained || 0)),
    };

    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Bulk update submission status
// @route   PUT /api/v1/assignments/:id/bulk-update
// @access  Private/Teacher/Admin
exports.bulkUpdateSubmissions = async (req, res, next) => {
  try {
    const { submissionIds, status } = req.body;
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    submissionIds.forEach(subId => {
      const submission = assignment.submissions.id(subId);
      if (submission) {
        submission.status = status;
      }
    });

    await assignment.save();
    res.status(200).json({ success: true, data: assignment });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Create rubric for assignment
// @route   POST /api/v1/assignments/:id/rubric
// @access  Private/Teacher/Admin
exports.createRubric = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    assignment.rubric = {
      enabled: true,
      criteria: req.body.criteria,
    };

    await assignment.save();
    res.status(200).json({ success: true, data: assignment });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

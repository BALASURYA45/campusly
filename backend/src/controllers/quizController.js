const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const DigitalTwinService = require('../utils/digitalTwinService');

// @desc    Create new quiz
// @route   POST /api/v1/quizzes
// @access  Private/Teacher/Admin
exports.createQuiz = async (req, res, next) => {
  try {
    req.body.teacher = req.user.id;
    const quiz = await Quiz.create(req.body);
    res.status(201).json({ success: true, data: quiz });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get all quizzes
// @route   GET /api/v1/quizzes
// @access  Private
exports.getQuizzes = async (req, res, next) => {
  try {
    const { subject, class: classId, status } = req.query;
    const filter = {};
    if (subject) filter.subject = subject;
    if (classId) filter.class = classId;
    if (status) filter.status = status;

    const quizzes = await Quiz.find(filter)
      .populate('subject', 'name')
      .populate('class', 'name')
      .populate('teacher', 'name');

    res.status(200).json({ success: true, count: quizzes.length, data: quizzes });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get single quiz
// @route   GET /api/v1/quizzes/:id
// @access  Private
exports.getQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('subject', 'name')
      .populate('class', 'name');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.status(200).json({ success: true, data: quiz });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Submit quiz for auto-grading
// @route   POST /api/v1/quizzes/:id/submit
// @access  Private/Student
exports.submitQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const { userAnswers, durationTaken } = req.body;
    let score = 0;
    const gradedAnswers = [];

    quiz.questions.forEach((question, index) => {
      const userAnswerIndex = userAnswers[index];
      const isCorrect = userAnswerIndex === question.correctOptionIndex;
      const pointsEarned = isCorrect ? (question.points || 1) : 0;
      
      if (isCorrect) score += pointsEarned;

      gradedAnswers.push({
        questionIndex: index,
        selectedOptionIndex: userAnswerIndex,
        isCorrect,
        pointsEarned,
      });
    });

    const percentage = ((score / quiz.totalMarks) * 100).toFixed(2);

    const result = await QuizResult.create({
      quiz: quiz._id,
      student: req.user.id,
      answers: gradedAnswers,
      score,
      percentage,
      durationTaken,
    });

    // Update Digital Twin immediately
    await DigitalTwinService.updateStudentTwin(req.user.id);
    await DigitalTwinService.updateClassTwin(quiz.class);

    res.status(200).json({
      success: true,
      data: {
        score,
        totalMarks: quiz.totalMarks,
        percentage,
        resultId: result._id,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already taken this quiz' });
    }
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get quiz results for a student
// @route   GET /api/v1/quizzes/results/me
// @access  Private/Student
exports.getMyResults = async (req, res, next) => {
  try {
    const results = await QuizResult.find({ student: req.user.id })
      .populate({
        path: 'quiz',
        populate: { path: 'subject', select: 'name' },
      });

    res.status(200).json({ success: true, data: results });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get all results for a quiz (Teacher only)
// @route   GET /api/v1/quizzes/:id/results
// @access  Private/Teacher/Admin
exports.getQuizResults = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quiz.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view these results' });
    }

    const results = await QuizResult.find({ quiz: req.params.id })
      .populate('student', 'name rollNumber email profileImage');

    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

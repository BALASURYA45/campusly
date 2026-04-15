const mongoose = require('mongoose');
const QuizResult = require('../models/QuizResult');
const Assignment = require('../models/Assignment');
const Subject = require('../models/Subject');
const DigitalContent = require('../models/DigitalContent');

// @desc    Get recommendations for the current student
// @route   GET /api/v1/recommendations/me
// @access  Private/Student
exports.getMyRecommendations = async (req, res, next) => {
  try {
    const studentId = new mongoose.Types.ObjectId(req.user.id);

    // Quiz performance by subject
    const quizAgg = await QuizResult.aggregate([
      { $match: { student: studentId } },
      {
        $lookup: {
          from: 'quizzes',
          localField: 'quiz',
          foreignField: '_id',
          as: 'quizDoc',
        },
      },
      { $unwind: '$quizDoc' },
      {
        $group: {
          _id: '$quizDoc.subject',
          quizAvg: { $avg: '$percentage' },
          quizAttempts: { $sum: 1 },
        },
      },
    ]);

    // Assignment performance by subject (graded submissions only)
    const asgAgg = await Assignment.aggregate([
      { $unwind: '$submissions' },
      { $match: { 'submissions.student': studentId, 'submissions.grading.marksObtained': { $ne: null } } },
      {
        $addFields: {
          asgPct: {
            $cond: [
              { $gt: ['$totalMarks', 0] },
              { $multiply: [{ $divide: ['$submissions.grading.marksObtained', '$totalMarks'] }, 100] },
              null,
            ],
          },
        },
      },
      {
        $group: {
          _id: '$subject',
          asgAvg: { $avg: '$asgPct' },
          asgCount: { $sum: 1 },
        },
      },
    ]);

    const bySubject = new Map();
    for (const q of quizAgg) {
      bySubject.set(String(q._id), { subjectId: q._id, quizAvg: q.quizAvg, quizAttempts: q.quizAttempts, asgAvg: null, asgCount: 0 });
    }
    for (const a of asgAgg) {
      const key = String(a._id);
      const existing = bySubject.get(key) || { subjectId: a._id, quizAvg: null, quizAttempts: 0, asgAvg: null, asgCount: 0 };
      existing.asgAvg = a.asgAvg;
      existing.asgCount = a.asgCount;
      bySubject.set(key, existing);
    }

    const combined = Array.from(bySubject.values()).map((row) => {
      const parts = [];
      if (typeof row.quizAvg === 'number') parts.push(row.quizAvg);
      if (typeof row.asgAvg === 'number') parts.push(row.asgAvg);
      const combinedScore = parts.length > 0 ? (parts.reduce((s, v) => s + v, 0) / parts.length) : 100;
      return { ...row, combinedScore };
    });

    combined.sort((a, b) => a.combinedScore - b.combinedScore);
    const weakTop = combined.slice(0, 3);
    const weakSubjectIds = weakTop.map((w) => w.subjectId).filter(Boolean);

    const subjects = weakSubjectIds.length > 0
      ? await Subject.find({ _id: { $in: weakSubjectIds } }).select('name code')
      : [];

    const contents = weakSubjectIds.length > 0
      ? await DigitalContent.find({ subject: { $in: weakSubjectIds } })
          .sort({ createdAt: -1 })
          .limit(12)
          .populate('subject', 'name code')
          .populate('uploadedBy', 'name')
      : [];

    res.status(200).json({
      success: true,
      data: {
        weakSubjects: subjects.map((s) => ({ _id: s._id, name: s.name, code: s.code })),
        signals: weakTop.map((w) => ({
          subjectId: w.subjectId,
          combinedScore: Number((w.combinedScore ?? 0).toFixed(1)),
          quizAvg: w.quizAvg !== null ? Number((w.quizAvg ?? 0).toFixed(1)) : null,
          asgAvg: w.asgAvg !== null ? Number((w.asgAvg ?? 0).toFixed(1)) : null,
          quizAttempts: w.quizAttempts,
          asgCount: w.asgCount,
        })),
        recommendedContent: contents,
      },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


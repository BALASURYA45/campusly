const mongoose = require('mongoose');
const StudySession = require('../models/StudySession');
const StudyProfile = require('../models/StudyProfile');

function startOfWeek(d) {
  const date = new Date(d);
  // Monday start (0=Sun, 1=Mon...)
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function dateKeyLocal(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// @desc    Get my study summary (streak + weekly goal progress)
// @route   GET /api/v1/study/me/summary
// @access  Private/Student
exports.getMyStudySummary = async (req, res, next) => {
  try {
    const studentId = new mongoose.Types.ObjectId(req.user.id);
    const now = new Date();
    const weekStart = startOfWeek(now);

    const profile = await StudyProfile.findOneAndUpdate(
      { student: studentId },
      { $setOnInsert: { weeklyGoalMinutes: 300 } },
      { new: true, upsert: true }
    );

    const sessionsThisWeek = await StudySession.find({
      student: studentId,
      createdAt: { $gte: weekStart, $lte: now },
    }).select('durationMinutes createdAt mode');

    const minutesThisWeek = sessionsThisWeek.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

    // Build streak from last 60 days
    const streakWindowStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const recentSessions = await StudySession.find({
      student: studentId,
      createdAt: { $gte: streakWindowStart, $lte: now },
    }).select('createdAt');

    const daysWithStudy = new Set(recentSessions.map((s) => dateKeyLocal(s.createdAt)));
    let streakDays = 0;
    const cursor = new Date(now);
    cursor.setHours(0, 0, 0, 0);
    while (daysWithStudy.has(dateKeyLocal(cursor))) {
      streakDays += 1;
      cursor.setDate(cursor.getDate() - 1);
      if (streakDays > 60) break;
    }

    const goal = profile.weeklyGoalMinutes || 300;
    const progressPercent = goal > 0 ? Math.min(100, Math.round((minutesThisWeek / goal) * 100)) : 0;

    res.status(200).json({
      success: true,
      data: {
        weeklyGoalMinutes: goal,
        weekStart,
        minutesThisWeek,
        progressPercent,
        streakDays,
        sessionsThisWeek: sessionsThisWeek.slice(-10),
      },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Set my weekly study goal
// @route   PUT /api/v1/study/me/goal
// @access  Private/Student
exports.setMyWeeklyGoal = async (req, res, next) => {
  try {
    const studentId = new mongoose.Types.ObjectId(req.user.id);
    const weeklyGoalMinutes = Number(req.body.weeklyGoalMinutes);
    if (!weeklyGoalMinutes || weeklyGoalMinutes < 30) {
      return res.status(400).json({ message: 'weeklyGoalMinutes must be at least 30' });
    }

    const profile = await StudyProfile.findOneAndUpdate(
      { student: studentId },
      { weeklyGoalMinutes, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Log a completed study session
// @route   POST /api/v1/study/me/sessions
// @access  Private/Student
exports.logMyStudySession = async (req, res, next) => {
  try {
    const studentId = new mongoose.Types.ObjectId(req.user.id);
    const durationMinutes = Number(req.body.durationMinutes);
    const mode = req.body.mode || 'pomodoro';

    if (!durationMinutes || durationMinutes < 1) {
      return res.status(400).json({ message: 'durationMinutes is required' });
    }

    const startedAt = req.body.startedAt ? new Date(req.body.startedAt) : null;
    const endedAt = req.body.endedAt ? new Date(req.body.endedAt) : null;

    const session = await StudySession.create({
      student: studentId,
      durationMinutes,
      mode,
      startedAt,
      endedAt,
      notes: req.body.notes || '',
    });

    res.status(201).json({ success: true, data: session });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


const Report = require('../models/Report');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');
const Activity = require('../models/Activity');
const Class = require('../models/Class');
const User = require('../models/User');
const QuizResult = require('../models/QuizResult');
const StudySession = require('../models/StudySession');
const StudyProfile = require('../models/StudyProfile');
const mongoose = require('mongoose');
const { generateCSV, generateExcel, generatePDF } = require('../utils/reportExport');

// @desc    Generate attendance report
// @route   POST /api/v1/reports/attendance
// @access  Private/Teacher/Admin
exports.generateAttendanceReport = async (req, res, next) => {
  try {
    const { classId, month, year, format = 'json' } = req.body;

    if (!classId) {
      return res.status(400).json({ message: 'Class ID is required' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const cls = await Class.findById(classId).populate('students', 'name email rollNumber');
    if (!cls) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const attendanceData = await Attendance.find({
      class: classId,
      date: { $gte: startDate, $lte: endDate },
    }).populate('student', 'name rollNumber');

    const summary = {
      class: cls.name,
      totalStudents: cls.students.length,
      reportMonth: `${month}/${year}`,
      totalDays: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1,
    };

    const details = cls.students.map(student => {
      const studentAttendance = attendanceData.filter(a => a.student._id.toString() === student._id.toString());
      const present = studentAttendance.filter(a => a.status === 'Present').length;
      const absent = studentAttendance.filter(a => a.status === 'Absent').length;
      const late = studentAttendance.filter(a => a.status === 'Late').length;
      const onDuty = studentAttendance.filter(a => a.status === 'On-Duty').length;
      const halfDay = studentAttendance.filter(a => a.status === 'Half-Day').length;
      
      const total = studentAttendance.length;
      // Digital Twin Engagement Score (Current)
      const engagementScore = student.digitalTwin?.engagementScore || 0;
      
      const attendancePercentage = total > 0 ? (((present + late + onDuty + (halfDay * 0.5)) / total) * 100).toFixed(2) : 0;

      return {
        rollNo: student.rollNumber,
        studentName: student.name,
        present,
        absent,
        late,
        onDuty,
        halfDay,
        total,
        engagementScore: `${engagementScore}%`,
        percentage: `${attendancePercentage}%`,
      };
    });

    const statistics = {
      totalPresent: details.reduce((sum, d) => sum + d.present, 0),
      totalAbsent: details.reduce((sum, d) => sum + d.absent, 0),
      totalLate: details.reduce((sum, d) => sum + d.late, 0),
      totalOnDuty: details.reduce((sum, d) => sum + d.onDuty, 0),
      averageAttendance: (
        (details.reduce((sum, d) => sum + parseFloat(d.percentage), 0) / details.length) || 0
      ).toFixed(2),
      averageEngagement: (
        (details.reduce((sum, d) => sum + parseFloat(d.engagementScore), 0) / details.length) || 0
      ).toFixed(2),
    };

    const reportData = {
      summary,
      details,
      statistics,
    };

    let fileInfo = null;
    if (format !== 'json') {
      const title = `Attendance Report - ${cls.name} - ${month}/${year}`;
      if (format === 'csv') {
        fileInfo = generateCSV(reportData, title);
      } else if (format === 'excel') {
        fileInfo = await generateExcel(reportData, title);
      } else if (format === 'pdf') {
        fileInfo = await generatePDF(reportData, title);
      }
    }

    const report = await Report.create({
      title: `Attendance Report - ${cls.name} - ${month}/${year}`,
      type: 'attendance',
      generatedBy: req.user.id,
      class: classId,
      dateRange: { startDate, endDate },
      data: reportData,
      filters: { classId, month, year },
      format,
      ...(fileInfo && {
        fileUrl: `/exports/${fileInfo.fileName}`,
        fileName: fileInfo.fileName,
      }),
    });

    res.status(201).json({
      success: true,
      data: {
        report,
        ...reportData,
      },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Generate student performance report
// @route   POST /api/v1/reports/performance
// @access  Private/Teacher/Admin/Parent
exports.generatePerformanceReport = async (req, res, next) => {
  try {
    const { studentId, classId, format = 'json' } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (req.user.role === 'parent') {
      const parent = await User.findById(req.user.id).select('children');
      const hasAccess = parent?.children?.some(childId => childId.toString() === studentId);

      if (!hasAccess) {
        return res.status(403).json({ message: 'Parents can only generate reports for linked children' });
      }
    }

    const assignments = await Assignment.find().populate('submissions');
    const studentAssignments = [];

    assignments.forEach(assignment => {
      const submission = assignment.submissions.find(s => s.student.toString() === studentId);
      if (submission) {
        studentAssignments.push({
          title: assignment.title,
          dueDate: assignment.dueDate,
          status: submission.status,
          submitted: submission.submittedAt,
          isLate: submission.isLate,
          grade: submission.grading?.grade || 'N/A',
          marks: submission.grading?.marksObtained || 'N/A',
          feedback: submission.grading?.feedback || 'No feedback',
        });
      }
    });

    const activities = await Activity.find();
    const studentActivities = activities.filter(a => 
      a.participants.some(p => p.student.toString() === studentId)
    );

    const attendanceStats = await Attendance.aggregate([
      { $match: { student: new mongoose.Types.ObjectId(studentId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const summary = {
      studentName: student.name,
      rollNumber: student.rollNumber || 'N/A',
      email: student.email,
      role: student.role,
      totalAssignments: studentAssignments.length,
      submittedAssignments: studentAssignments.filter(a => a.status !== 'Pending').length,
      gradedAssignments: studentAssignments.filter(a => a.grade !== 'N/A').length,
      lateSubmissions: studentAssignments.filter(a => a.isLate).length,
      activitiesParticipated: studentActivities.length,
      engagementScore: student.digitalTwin?.engagementScore || 0,
      predictedPerformance: student.digitalTwin?.predictedPerformance || 'Average',
    };

    const attendancePercentage = (() => {
      if (attendanceStats.length === 0) return 0;
      const present = attendanceStats.find(a => a._id === 'Present')?.count || 0;
      const late = attendanceStats.find(a => a._id === 'Late')?.count || 0;
      const od = attendanceStats.find(a => a._id === 'On-Duty')?.count || 0;
      const half = attendanceStats.find(a => a._id === 'Half-Day')?.count || 0;
      
      const total = attendanceStats.reduce((sum, a) => sum + a.count, 0);
      return total > 0 ? (((present + late + od + (half * 0.5)) / total) * 100).toFixed(2) : 0;
    })();

    const statistics = {
      averageGrade: studentAssignments.length > 0
        ? calculateAverageGrade(studentAssignments.map(a => a.grade))
        : 'N/A',
      submissionRate: summary.totalAssignments > 0
        ? ((summary.submittedAssignments / summary.totalAssignments) * 100).toFixed(2) + '%'
        : '0%',
      attendancePercentage: attendancePercentage + '%',
      overallPerformance: calculatePerformanceLevel(studentAssignments),
      digitalTwinStatus: summary.engagementScore >= 75 ? 'Optimal' : (summary.engagementScore >= 50 ? 'Stable' : 'Needs Attention'),
    };

    const reportData = {
      summary,
      details: studentAssignments,
      statistics,
      activities: studentActivities.map(a => ({ name: a.name, status: a.status })),
    };

    let fileInfo = null;
    if (format !== 'json') {
      const title = `Performance Report - ${student.name}`;
      if (format === 'csv') {
        fileInfo = generateCSV(reportData, title);
      } else if (format === 'excel') {
        fileInfo = await generateExcel(reportData, title);
      } else if (format === 'pdf') {
        fileInfo = await generatePDF(reportData, title);
      }
    }

    const report = await Report.create({
      title: `Performance Report - ${student.name}`,
      type: 'performance',
      generatedBy: req.user.id,
      generatedFor: studentId,
      data: reportData,
      filters: { studentId, classId },
      format,
      ...(fileInfo && {
        fileUrl: `/exports/${fileInfo.fileName}`,
        fileName: fileInfo.fileName,
      }),
    });

    res.status(201).json({
      success: true,
      data: {
        report,
        ...reportData,
      },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Generate my (student) progress report
// @route   GET /api/v1/reports/me/performance?format=pdf|csv|excel|json
// @access  Private/Student
exports.generateMyPerformanceReport = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const format = String(req.query.format || 'json').toLowerCase();

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const classes = await Class.find({ students: new mongoose.Types.ObjectId(studentId) }).select('_id name');
    const classIds = classes.map((c) => c._id);

    const assignments = await Assignment.find({ class: { $in: classIds } })
      .populate('subject', 'name code')
      .populate('teacher', 'name')
      .select('title dueDate totalMarks subject teacher submissions');

    const myAssignments = [];
    for (const a of assignments) {
      const sub = (a.submissions || []).find((s) => String(s.student) === String(studentId) || String(s.student?._id) === String(studentId));
      myAssignments.push({
        title: a.title,
        subject: a.subject?.name || 'N/A',
        dueDate: a.dueDate ? new Date(a.dueDate).toLocaleDateString() : '',
        status: sub?.status || 'Not Submitted',
        isLate: !!sub?.isLate,
        submittedAt: sub?.submittedAt ? new Date(sub.submittedAt).toLocaleString() : '',
        marks: sub?.grading?.marksObtained ?? '',
        grade: sub?.grading?.grade ?? '',
        teacher: a.teacher?.name || '',
      });
    }

    const attendanceStats = await Attendance.aggregate([
      { $match: { student: new mongoose.Types.ObjectId(studentId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const present = attendanceStats.find((a) => a._id === 'Present')?.count || 0;
    const late = attendanceStats.find((a) => a._id === 'Late')?.count || 0;
    const od = attendanceStats.find((a) => a._id === 'On-Duty')?.count || 0;
    const half = attendanceStats.find((a) => a._id === 'Half-Day')?.count || 0;
    const absent = attendanceStats.find((a) => a._id === 'Absent')?.count || 0;
    const totalAttendance = attendanceStats.reduce((s, a) => s + a.count, 0);
    const attendancePercentage = totalAttendance > 0 ? (((present + late + od + (half * 0.5)) / totalAttendance) * 100) : 0;

    const submittedCount = myAssignments.filter((a) => a.status !== 'Not Submitted' && a.status !== 'Pending').length;
    const overdueCount = myAssignments.filter((a) => a.status === 'Not Submitted' && a.dueDate && new Date(a.dueDate) < new Date()).length;
    const graded = myAssignments.filter((a) => a.grade).length;

    const quizResults = await QuizResult.find({ student: studentId })
      .populate({ path: 'quiz', populate: { path: 'subject', select: 'name code' } })
      .select('percentage score completedAt quiz');

    const quizAvg = quizResults.length > 0
      ? (quizResults.reduce((s, r) => s + (Number(r.percentage) || 0), 0) / quizResults.length)
      : 0;

    const quizBySubject = {};
    for (const r of quizResults) {
      const subj = r.quiz?.subject?.name || 'Unknown';
      quizBySubject[subj] = quizBySubject[subj] || { attempts: 0, avg: 0, _sum: 0 };
      quizBySubject[subj].attempts += 1;
      quizBySubject[subj]._sum += Number(r.percentage) || 0;
      quizBySubject[subj].avg = Number((quizBySubject[subj]._sum / quizBySubject[subj].attempts).toFixed(1));
    }

    // Study summary (week + streak)
    const now = new Date();
    const weekStart = (() => {
      const d = new Date(now);
      const day = d.getDay();
      const diff = (day === 0 ? -6 : 1) - day;
      d.setDate(d.getDate() + diff);
      d.setHours(0, 0, 0, 0);
      return d;
    })();

    const profile = await StudyProfile.findOneAndUpdate(
      { student: new mongoose.Types.ObjectId(studentId) },
      { $setOnInsert: { weeklyGoalMinutes: 300 } },
      { new: true, upsert: true }
    );

    const sessionsThisWeek = await StudySession.find({
      student: studentId,
      createdAt: { $gte: weekStart, $lte: now },
    }).select('durationMinutes createdAt mode');

    const minutesThisWeek = sessionsThisWeek.reduce((s, x) => s + (x.durationMinutes || 0), 0);

    const streakWindowStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const recentSessions = await StudySession.find({
      student: studentId,
      createdAt: { $gte: streakWindowStart, $lte: now },
    }).select('createdAt');

    const dateKeyLocal = (date) => {
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const daysWithStudy = new Set(recentSessions.map((s) => dateKeyLocal(s.createdAt)));
    let streakDays = 0;
    const cursor = new Date(now);
    cursor.setHours(0, 0, 0, 0);
    while (daysWithStudy.has(dateKeyLocal(cursor))) {
      streakDays += 1;
      cursor.setDate(cursor.getDate() - 1);
      if (streakDays > 60) break;
    }

    const summary = {
      studentName: student.name,
      rollNumber: student.rollNumber || 'N/A',
      classCount: classes.length,
      attendancePercentage: `${attendancePercentage.toFixed(1)}%`,
      assignmentsTotal: myAssignments.length,
      assignmentsSubmitted: submittedCount,
      assignmentsGraded: graded,
      quizAttempts: quizResults.length,
      quizAverage: `${quizAvg.toFixed(1)}%`,
      engagementScore: `${student.digitalTwin?.engagementScore || 0}%`,
      studyWeeklyGoalMinutes: profile.weeklyGoalMinutes || 300,
      studyMinutesThisWeek: minutesThisWeek,
      studyStreakDays: streakDays,
    };

    const details = [
      ...myAssignments.map((a) => ({
        type: 'Assignment',
        title: a.title,
        subject: a.subject,
        status: a.status,
        dueDate: a.dueDate,
        submittedAt: a.submittedAt,
        grade: a.grade,
        marks: a.marks,
        teacher: a.teacher,
      })),
      ...Object.entries(quizBySubject).map(([subject, v]) => ({
        type: 'Quiz',
        title: 'Quiz Performance',
        subject,
        status: `${v.attempts} attempt(s)`,
        dueDate: '',
        submittedAt: '',
        grade: '',
        marks: `${v.avg}%`,
        teacher: '',
      })),
    ];

    const statistics = {
      attendance: summary.attendancePercentage,
      submissionRate: myAssignments.length > 0 ? `${((submittedCount / myAssignments.length) * 100).toFixed(1)}%` : '0%',
      overdueAssignments: overdueCount,
      quizAverage: summary.quizAverage,
      studyMinutesThisWeek: minutesThisWeek,
      studyStreakDays: streakDays,
    };

    const reportData = { summary, details, statistics };

    let fileInfo = null;
    if (format !== 'json') {
      const title = `Student Progress Report - ${student.rollNumber || student.name}`;
      if (format === 'csv') fileInfo = generateCSV(reportData, title);
      else if (format === 'excel') fileInfo = await generateExcel(reportData, title);
      else if (format === 'pdf') fileInfo = await generatePDF(reportData, title);
      else return res.status(400).json({ message: 'Invalid format. Use json|csv|excel|pdf' });
    }

    const report = await Report.create({
      title: `Student Progress Report - ${student.rollNumber || student.name}`,
      type: 'performance',
      generatedBy: req.user.id,
      class: classIds[0] || null,
      data: reportData,
      filters: { studentId },
      format,
      ...(fileInfo && {
        fileUrl: `/exports/${fileInfo.fileName}`,
        fileName: fileInfo.fileName,
      }),
    });

    res.status(200).json({
      success: true,
      data: {
        report,
        ...reportData,
      },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Generate class performance report
// @route   POST /api/v1/reports/class
// @access  Private/Teacher/Admin
exports.generateClassReport = async (req, res, next) => {
  try {
    const { classId, format = 'json' } = req.body;

    if (!classId) {
      return res.status(400).json({ message: 'Class ID is required' });
    }

    const cls = await Class.findById(classId).populate('students', 'name email rollNumber');
    if (!cls) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const assignments = await Assignment.find({ class: classId }).populate('submissions');
    const attendanceData = await Attendance.find({ class: classId });

    const studentDetails = cls.students.map(student => {
      const studentAssignments = assignments.flatMap(a =>
        a.submissions
          .filter(s => s.student.toString() === student._id.toString())
          .map(s => ({
            grade: s.grading?.grade || 'Pending',
            marks: s.grading?.marksObtained || 0,
          }))
      );

      const studentAttendance = attendanceData.filter(a => a.student.toString() === student._id.toString());
      const present = studentAttendance.filter(a => a.status === 'Present').length;
      const total = studentAttendance.length;
      const attendancePercentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

      const avgGrade = studentAssignments.length > 0
        ? calculateAverageGrade(studentAssignments.map(s => s.grade))
        : 'N/A';

      return {
        name: student.name,
        rollNumber: student.rollNumber || 'N/A',
        assignmentsSubmitted: studentAssignments.length,
        averageGrade: avgGrade,
        attendancePercentage,
      };
    });

    const totalAssignments = assignments.length;
    const totalSubmissions = assignments.reduce((sum, a) => sum + a.submissions.length, 0);
    const submissionRate = totalAssignments > 0
      ? ((totalSubmissions / (totalAssignments * cls.students.length)) * 100).toFixed(2)
      : 0;

    const summary = {
      className: cls.name,
      totalStudents: cls.students.length,
      totalAssignments,
      averageSubmissionRate: submissionRate + '%',
    };

    const statistics = {
      topPerformers: studentDetails
        .filter(s => s.averageGrade !== 'N/A')
        .sort((a, b) => gradeToScore(b.averageGrade) - gradeToScore(a.averageGrade))
        .slice(0, 5)
        .map(s => `${s.name} (${s.averageGrade})`),
      averageAttendance: (
        studentDetails.reduce((sum, s) => sum + parseFloat(s.attendancePercentage), 0) / studentDetails.length
      ).toFixed(2) + '%',
    };

    const reportData = {
      summary,
      details: studentDetails,
      statistics,
    };

    let fileInfo = null;
    if (format !== 'json') {
      const title = `Class Report - ${cls.name}`;
      if (format === 'csv') {
        fileInfo = generateCSV(reportData, title);
      } else if (format === 'excel') {
        fileInfo = await generateExcel(reportData, title);
      } else if (format === 'pdf') {
        fileInfo = await generatePDF(reportData, title);
      }
    }

    const report = await Report.create({
      title: `Class Report - ${cls.name}`,
      type: 'class',
      generatedBy: req.user.id,
      class: classId,
      data: reportData,
      filters: { classId },
      format,
      ...(fileInfo && {
        fileUrl: `/exports/${fileInfo.fileName}`,
        fileName: fileInfo.fileName,
      }),
    });

    res.status(201).json({
      success: true,
      data: {
        report,
        ...reportData,
      },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Generate summary report for Parent (covering all children)
// @route   POST /api/v1/reports/parent
// @access  Private/Parent
exports.generateParentReport = async (req, res, next) => {
  try {
    const parent = await User.findById(req.user.id).populate('children');
    if (!parent || parent.role !== 'parent') {
      return res.status(403).json({ message: 'Only parents can access this report' });
    }

    if (!parent.children || parent.children.length === 0) {
      return res.status(400).json({ message: 'No children linked to this parent account' });
    }

    const childrenData = await Promise.all(parent.children.map(async (child) => {
      // Get attendance summary
      const attendance = await Attendance.aggregate([
        { $match: { student: child._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      
      const present = attendance.find(a => a._id === 'Present')?.count || 0;
      const total = attendance.reduce((sum, a) => sum + a.count, 0);
      const attendancePercentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

      // Get assignment summary
      const assignments = await Assignment.find();
      let submitted = 0;
      let graded = 0;
      let totalMarks = 0;
      let obtainedMarks = 0;

      assignments.forEach(a => {
        const sub = a.submissions.find(s => s.student.toString() === child._id.toString());
        if (sub) {
          submitted++;
          if (sub.status === 'Graded') {
            graded++;
            totalMarks += a.totalMarks;
            obtainedMarks += sub.grading?.marksObtained || 0;
          }
        }
      });

      const avgMarks = graded > 0 ? (obtainedMarks / totalMarks * 100).toFixed(2) : 0;

      return {
        name: child.name,
        rollNumber: child.rollNumber,
        attendance: `${attendancePercentage}%`,
        assignmentSubmission: `${submitted}/${assignments.length}`,
        academicPerformance: `${avgMarks}%`,
        engagementScore: child.digitalTwin?.engagementScore || 0,
        predictedPerformance: child.digitalTwin?.predictedPerformance || 'N/A'
      };
    }));

    const reportData = {
      parentName: parent.name,
      generatedAt: new Date(),
      children: childrenData
    };

    const report = await Report.create({
      title: `Parent Summary Report - ${parent.name}`,
      type: 'performance',
      generatedBy: req.user.id,
      data: reportData,
      format: 'json'
    });

    res.status(201).json({
      success: true,
      data: report
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get all generated reports for current user
// @route   GET /api/v1/reports
// @access  Private
exports.getReports = async (req, res, next) => {
  try {
    const { type, limit = 10, page = 1 } = req.query;

    let query = { generatedBy: req.user.id };
    if (type) {
      query.type = type;
    }

    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Report.countDocuments(query);

    res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        total,
        pages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
      },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get single report
// @route   GET /api/v1/reports/:id
// @access  Private
exports.getReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('generatedBy', 'name')
      .populate('generatedFor', 'name')
      .populate('class', 'name');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Delete report
// @route   DELETE /api/v1/reports/:id
// @access  Private
exports.deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (report.generatedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this report' });
    }

    await Report.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Helper functions
const calculateAverageGrade = (grades) => {
  const scores = grades
    .filter(g => g !== 'N/A' && g !== 'Pending')
    .map(g => gradeToScore(g));

  if (scores.length === 0) return 'N/A';

  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return scoreToGrade(avg);
};

const gradeToScore = (grade) => {
  const gradeMap = { A: 90, B: 80, C: 70, D: 60, F: 0 };
  return gradeMap[grade] || 0;
};

const scoreToGrade = (score) => {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
};

const calculatePerformanceLevel = (assignments) => {
  if (assignments.length === 0) return 'No Data';

  const grades = assignments.filter(a => a.grade !== 'N/A').map(a => a.grade);
  if (grades.length === 0) return 'Pending';

  const avgScore = grades.reduce((sum, g) => sum + gradeToScore(g), 0) / grades.length;

  if (avgScore >= 85) return 'Excellent';
  if (avgScore >= 70) return 'Good';
  if (avgScore >= 60) return 'Average';
  if (avgScore >= 50) return 'Below Average';
  return 'Poor';
};

// @desc    Get admin dashboard stats
// @route   GET /api/v1/reports/stats
// @access  Private/Admin
exports.getStats = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalClasses = await Class.countDocuments();
    const totalActivities = await Activity.countDocuments();

    const roleStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    const attendanceStats = await Attendance.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const activityStats = await Activity.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalTeachers,
        totalClasses,
        totalActivities,
        attendanceStats,
        roleStats,
        activityStats,
      },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get attendance reports for a specific student
// @route   GET /api/v1/reports/attendance/:studentId
// @access  Private/Admin/Teacher/Parent
exports.getStudentAttendanceReport = async (req, res, next) => {
  try {
    if (req.user.role === 'student' && req.user.id !== req.params.studentId) {
      return res.status(403).json({ message: 'Students can only access their own attendance report' });
    }

    if (req.user.role === 'parent') {
      const parent = await User.findById(req.user.id).select('children');
      const hasAccess = parent?.children?.some(childId => childId.toString() === req.params.studentId);

      if (!hasAccess) {
        return res.status(403).json({ message: 'Parents can only access linked children attendance reports' });
      }
    }

    const stats = await Attendance.aggregate([
      { $match: { student: new mongoose.Types.ObjectId(req.params.studentId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

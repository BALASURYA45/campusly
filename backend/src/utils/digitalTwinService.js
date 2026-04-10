const User = require('../models/User');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');
const Subject = require('../models/Subject');
const Activity = require('../models/Activity');
const DigitalContent = require('../models/DigitalContent');
const EarlyWarningService = require('./earlyWarningService');

/**
 * Digital Twin Service
 * Handles calculations and updates for Student and Classroom digital representations.
 */
class DigitalTwinService {
  /**
   * Update Student Digital Twin metrics
   * @param {string} studentId 
   */
  async updateStudentTwin(studentId) {
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') return;

    // 1. Calculate Attendance Score (0-100)
    const attendanceRecords = await Attendance.find({ student: studentId });
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(r => r.status === 'Present' || r.status === 'Late' || r.status === 'On-Duty').length;
    const attendanceScore = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    // 2. Calculate Academic Performance Score (Assignments + Quizzes)
    const assignments = await Assignment.find({ 'submissions.student': studentId });
    const quizzes = await require('../models/QuizResult').find({ student: studentId });
    
    let totalMarksPossible = 0;
    let totalMarksObtained = 0;
    let itemsCompleted = 0;

    // Assignment performance
    assignments.forEach(assign => {
      const submission = assign.submissions.find(s => s.student.toString() === studentId.toString());
      if (submission && submission.grading && submission.grading.marksObtained !== undefined) {
        totalMarksPossible += assign.totalMarks;
        totalMarksObtained += submission.grading.marksObtained;
        itemsCompleted++;
      }
    });

    // Quiz performance
    quizzes.forEach(result => {
      totalMarksObtained += result.score;
      // We need to fetch the quiz to get total marks, or assume it's part of the result
      // Let's assume result.percentage is more reliable if score is absolute
      // If result has percentage, we can use it to derive total if needed
    });

    // Recalculate using weighted average if multiple types
    const assignmentScore = totalMarksPossible > 0 ? (totalMarksObtained / totalMarksPossible) * 100 : 0;
    const quizAvg = quizzes.length > 0 ? quizzes.reduce((acc, q) => acc + q.percentage, 0) / quizzes.length : 0;
    
    const performanceScore = quizzes.length > 0 
      ? (assignmentScore * 0.6) + (quizAvg * 0.4) 
      : assignmentScore;

    const totalTasks = assignments.length + quizzes.length;
    const completionRate = totalTasks > 0 ? ((itemsCompleted + quizzes.length) / totalTasks) * 100 : 0;

    // 3. Calculate Extracurricular Score (Activities)
    const activities = await Activity.find({ 'participants.student': studentId, 'participants.status': 'Participated' });
    const activityScore = Math.min(activities.length * 20, 100); // 5 activities for full score

    // 4. Calculate Engagement Score (Weighted)
    // 35% Attendance, 25% Completion Rate, 25% Performance, 15% Extracurricular
    const engagementScore = Math.round(
      (attendanceScore * 0.35) + (completionRate * 0.25) + (performanceScore * 0.25) + (activityScore * 0.15)
    );

    // 5. Predict Performance
    let predictedPerformance = 'Average';
    if (engagementScore >= 90) predictedPerformance = 'Excellent';
    else if (engagementScore >= 75) predictedPerformance = 'Good';
    else if (engagementScore >= 60) predictedPerformance = 'Average';
    else if (engagementScore >= 40) predictedPerformance = 'Below Average';
    else predictedPerformance = 'At Risk';

    // 6. Update Heatmap (Add current snapshot)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let activityHeatmap = student.digitalTwin.activityHeatmap || [];
    const existingEntryIndex = activityHeatmap.findIndex(h => h.date.getTime() === today.getTime());
    
    if (existingEntryIndex > -1) {
      activityHeatmap[existingEntryIndex].score = engagementScore;
    } else {
      activityHeatmap.push({ date: today, score: engagementScore });
      // Keep only last 30 days
      if (activityHeatmap.length > 30) activityHeatmap.shift();
    }

    // Update Student Model
    student.digitalTwin.engagementScore = engagementScore;
    student.digitalTwin.predictedPerformance = predictedPerformance;
    student.digitalTwin.activityHeatmap = activityHeatmap;
    student.digitalTwin.lastSync = new Date();

    await student.save();

    // 7. Trigger Early Warning Analysis
    await EarlyWarningService.analyzeRisk(studentId);

    return student.digitalTwin;
  }

  /**
   * Update Teacher Digital Twin metrics
   * @param {string} teacherId 
   */
  async updateTeacherTwin(teacherId) {
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') return;

    // 1. Calculate Teaching Load (Classes assigned)
    const classes = await Class.find({ teacher: teacherId });
    teacher.digitalTwin.teachingLoad = classes.length;

    // 2. Calculate Content Richness (Uploads)
    const contents = await DigitalContent.find({ uploadedBy: teacherId });
    teacher.digitalTwin.contentRichness = Math.min(contents.length * 10, 100);

    // 3. Calculate Grading Efficiency
    const assignments = await Assignment.find({ teacher: teacherId });
    let totalSubmissions = 0;
    let gradedSubmissions = 0;

    assignments.forEach(a => {
      totalSubmissions += a.submissions.length;
      gradedSubmissions += a.submissions.filter(s => s.status === 'Graded').length;
    });

    teacher.digitalTwin.gradingEfficiency = totalSubmissions > 0 
      ? Math.round((gradedSubmissions / totalSubmissions) * 100) 
      : 100;

    teacher.digitalTwin.lastSync = new Date();
    await teacher.save();
    return teacher.digitalTwin;
  }

  /**
   * Update Classroom Digital Twin metrics
   * @param {string} classId 
   */
  async updateClassTwin(classId) {
    const classObj = await Class.findById(classId).populate('students');
    if (!classObj) return;

    const studentIds = classObj.students.map(s => s._id);
    
    // 1. Average Attendance Rate
    const attendanceRecords = await Attendance.find({ class: classId });
    const totalPossible = attendanceRecords.length;
    const totalPresent = attendanceRecords.filter(r => r.status === 'Present' || r.status === 'Late' || r.status === 'On-Duty').length;
    const attendanceRate = totalPossible > 0 ? (totalPresent / totalPossible) * 100 : 0;

    // 2. Average Engagement
    const students = await User.find({ _id: { $in: studentIds } });
    const avgEngagement = students.length > 0 
      ? students.reduce((acc, s) => acc + (s.digitalTwin.engagementScore || 0), 0) / students.length 
      : 0;

    // 3. Performance Average
    const assignments = await Assignment.find({ class: classId });
    let totalMarks = 0;
    let totalPossibleMarks = 0;
    
    assignments.forEach(a => {
      a.submissions.forEach(s => {
        if (s.grading && s.grading.marksObtained !== undefined) {
          totalMarks += s.grading.marksObtained;
          totalPossibleMarks += a.totalMarks;
        }
      });
    });
    
    const performanceAvg = totalPossibleMarks > 0 ? (totalMarks / totalPossibleMarks) * 100 : 0;

    // 4. Update Trend
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let engagementTrend = classObj.digitalTwin.engagementTrend || [];
    const existingTrendIndex = engagementTrend.findIndex(t => t.date.getTime() === today.getTime());
    
    if (existingTrendIndex > -1) {
      engagementTrend[existingTrendIndex].score = avgEngagement;
    } else {
      engagementTrend.push({ date: today, score: avgEngagement });
      if (engagementTrend.length > 30) engagementTrend.shift();
    }

    // 5. Resource Usage (Mocking based on syllabus completion)
    const subjects = await Subject.find({ class: classId });
    let totalTopics = 0;
    let completedTopics = 0;
    
    subjects.forEach(sub => {
      totalTopics += sub.syllabus.length;
      completedTopics += sub.syllabus.filter(t => t.status === 'Completed').length;
    });
    
    const resourceUsage = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

    // Update Class Model
    classObj.digitalTwin.currentAttendanceRate = Math.round(attendanceRate);
    classObj.digitalTwin.performanceAverage = Math.round(performanceAvg);
    classObj.digitalTwin.resourceUsage = Math.round(resourceUsage);
    classObj.digitalTwin.engagementTrend = engagementTrend;
    classObj.digitalTwin.lastUpdate = new Date();

    await classObj.save();
    return classObj.digitalTwin;
  }

  /**
   * Batch update all digital twins
   */
  async syncAllTwins() {
    const students = await User.find({ role: 'student' });
    for (const student of students) {
      await this.updateStudentTwin(student._id);
    }

    const teachers = await User.find({ role: 'teacher' });
    for (const teacher of teachers) {
      await this.updateTeacherTwin(teacher._id);
    }

    const classes = await Class.find();
    for (const classObj of classes) {
      await this.updateClassTwin(classObj._id);
    }
  }
}

module.exports = new DigitalTwinService();

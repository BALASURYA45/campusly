const User = require('../models/User');
const { notifyAtRiskStudent } = require('./notificationService');

/**
 * AI-Powered Early Warning Service
 * Analyzes Digital Twin data to predict risks and trigger interventions.
 */
class EarlyWarningService {
  /**
   * Check if a student is at risk based on their Digital Twin metrics
   * @param {string} studentId 
   */
  async analyzeRisk(studentId) {
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') return;

    const engagementScore = student.digitalTwin.engagementScore;
    const threshold = student.digitalTwin.earlyWarning.alertThreshold || 50;
    
    let currentStatus = 'Normal';
    if (engagementScore < threshold) {
      currentStatus = engagementScore < (threshold - 20) ? 'Critical' : 'Monitoring';
    }

    // Status changed to Monitoring or Critical
    if (currentStatus !== 'Normal' && student.digitalTwin.earlyWarning.status === 'Normal') {
      await this.triggerAlert(student, currentStatus);
    }

    // Update student early warning status
    student.digitalTwin.earlyWarning.status = currentStatus;
    await student.save();

    return currentStatus;
  }

  /**
   * Trigger notifications for at-risk students
   * @param {Object} student 
   * @param {string} riskLevel 
   */
  async triggerAlert(student, riskLevel) {
    console.log(`[Early Warning] Alert triggered for ${student.name}. Risk Level: ${riskLevel}`);
    
    // Update last alert date
    student.digitalTwin.earlyWarning.lastAlertDate = new Date();
    
    // Send notifications to Teachers and Parents
    try {
      await notifyAtRiskStudent(student, riskLevel);
    } catch (err) {
      console.error('Failed to send early warning notifications:', err);
    }
  }

  /**
   * Get all at-risk students for a specific teacher or class
   * @param {string} teacherId 
   */
  async getAtRiskStudents(teacherId) {
    // This would typically involve looking up classes for the teacher first
    // For now, let's return all students with 'Monitoring' or 'Critical' status
    return await User.find({
      'digitalTwin.earlyWarning.status': { $in: ['Monitoring', 'Critical'] },
      role: 'student'
    }).select('name rollNumber email digitalTwin.engagementScore digitalTwin.earlyWarning digitalTwin.predictedPerformance profileImage');
  }

  /**
   * Log an intervention for a student
   */
  async logIntervention(studentId, interventionData, assignedBy) {
    const student = await User.findById(studentId);
    if (!student) throw new Error('Student not found');

    student.digitalTwin.interventions.push({
      ...interventionData,
      assignedBy,
      startDate: new Date()
    });

    await student.save();
    return student.digitalTwin.interventions;
  }
}

module.exports = new EarlyWarningService();

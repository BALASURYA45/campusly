const Notification = require('../models/Notification');
const User = require('../models/User');
const sendEmail = require('./sendEmail');

const sendNotification = async (options) => {
  try {
    const {
      recipients, 
      title,
      message,
      type = 'system',
      sender,
      relatedModel,
      relatedId,
      priority = 'medium',
      actionUrl,
      methods = { inApp: true, email: false, push: false }
    } = options;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      console.error('Invalid recipients for notification');
      return null;
    }

    const notifications = [];

    for (const recipientId of recipients) {
      const notification = await Notification.create({
        recipient: recipientId,
        title,
        message,
        type,
        sender,
        relatedModel,
        relatedId,
        notificationMethods: methods,
        priority,
        actionUrl,
      });

      notifications.push(notification);

      const userPrefs = await User.findById(recipientId);
      const shouldSendEmail = methods.email && userPrefs?.notificationPreferences?.email !== false;
      const shouldSendPush = methods.push && userPrefs?.notificationPreferences?.push !== false;

      if (shouldSendEmail) {
        await sendNotificationEmail(recipientId, title, message, actionUrl).catch(err =>
          console.error('Error sending email notification:', err.message)
        );
      }

      if (shouldSendPush) {
        await sendPushNotification(recipientId, title, message).catch(err =>
          console.error('Error sending push notification:', err.message)
        );
      }
    }

    return notifications;
  } catch (err) {
    console.error('Error creating notification:', err);
    return null;
  }
};

const sendNotificationEmail = async (userId, title, message, actionUrl) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.email) return;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">${title}</h2>
        <p style="color: #666; font-size: 14px;">${message}</p>
        ${actionUrl ? `<a href="${actionUrl}" style="display: inline-block; padding: 10px 20px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 4px; margin-top: 10px;">View Details</a>` : ''}
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">This is an automated notification from Smart Curriculum. You can manage your notification preferences in your account settings.</p>
      </div>
    `;

    await sendEmail({
      email: user.email,
      subject: title,
      message: htmlContent,
      html: true,
    });

    await Notification.updateMany(
      { recipient: userId },
      { emailSent: true, emailSentAt: new Date() },
      { sort: { createdAt: -1 }, limit: 1 }
    );
  } catch (err) {
    console.error('Error sending notification email:', err);
  }
};

const sendPushNotification = async (userId, title, message) => {
  try {
    const io = global.io;
    if (!io) return;

    io.to(`user_${userId}`).emit('pushNotification', {
      title,
      message,
      badge: '/badge.png',
      icon: '/icon.png',
    });

    await Notification.updateMany(
      { recipient: userId },
      { pushSent: true, pushSentAt: new Date() },
      { sort: { createdAt: -1 }, limit: 1 }
    );
  } catch (err) {
    console.error('Error sending push notification:', err);
  }
};

const notifyAttendanceMarked = async (classId, studentIds, date, teacherId) => {
  try {
    const notification = await sendNotification({
      recipients: studentIds,
      title: 'Attendance Marked',
      message: `Your attendance has been marked for ${new Date(date).toLocaleDateString()}`,
      type: 'attendance',
      sender: teacherId,
      relatedModel: 'Attendance',
      priority: 'medium',
      methods: { inApp: true, email: false, push: false }
    });
    return notification;
  } catch (err) {
    console.error('Error notifying attendance:', err);
  }
};

const notifyAssignmentCreated = async (assignmentId, classId, teacherId, assignmentTitle, dueDate) => {
  try {
    const Class = require('../models/Class');
    const cls = await Class.findById(classId);
    if (!cls) return;

    const notification = await sendNotification({
      recipients: cls.students,
      title: 'New Assignment',
      message: `New assignment "${assignmentTitle}" created. Due: ${new Date(dueDate).toLocaleDateString()}`,
      type: 'assignment',
      sender: teacherId,
      relatedModel: 'Assignment',
      relatedId: assignmentId,
      priority: 'high',
      methods: { inApp: true, email: true, push: false }
    });
    return notification;
  } catch (err) {
    console.error('Error notifying assignment:', err);
  }
};

const notifyAssignmentSubmitted = async (assignmentId, studentId, studentName, teacherId) => {
  try {
    const notification = await sendNotification({
      recipients: [teacherId],
      title: 'Assignment Submitted',
      message: `${studentName} has submitted the assignment`,
      type: 'assignment',
      sender: studentId,
      relatedModel: 'Assignment',
      relatedId: assignmentId,
      priority: 'medium',
      methods: { inApp: true, email: true, push: false }
    });
    return notification;
  } catch (err) {
    console.error('Error notifying assignment submission:', err);
  }
};

const notifyActivityCreated = async (activityId, participantIds, activityTitle, teacherId) => {
  try {
    const notification = await sendNotification({
      recipients: participantIds,
      title: 'New Activity',
      message: `You have been added to activity: "${activityTitle}"`,
      type: 'activity',
      sender: teacherId,
      relatedModel: 'Activity',
      relatedId: activityId,
      priority: 'medium',
      methods: { inApp: true, email: false, push: false }
    });
    return notification;
  } catch (err) {
    console.error('Error notifying activity:', err);
  }
};

const notifySystemAlert = async (recipients, title, message, priority = 'high') => {
  try {
    const notification = await sendNotification({
      recipients,
      title,
      message,
      type: 'alert',
      priority,
      methods: { inApp: true, email: true, push: true }
    });
    return notification;
  } catch (err) {
    console.error('Error sending system alert:', err);
  }
};

const notifyAtRiskStudent = async (student, riskLevel) => {
  try {
    // 1. Notify Teachers of the student
    const Class = require('../models/Class');
    const classes = await Class.find({ students: student._id }).populate('teacher');
    const teacherIds = classes.map(c => c.teacher?._id || c.teacher).filter(Boolean);

    // 2. Notify Parents
    const parentIds = await User.find({ children: student._id, role: 'parent' }).select('_id');
    const parentIdList = parentIds.map(p => p._id);

    const recipients = [...new Set([...teacherIds, ...parentIdList])];

    if (recipients.length > 0) {
      await sendNotification({
        recipients,
        title: `AI Early Warning: ${student.name} at ${riskLevel} Risk`,
        message: `The Digital Twin for ${student.name} indicates a ${riskLevel} drop in engagement score (${student.digitalTwin.engagementScore}%). Immediate intervention may be required.`,
        type: 'alert',
        relatedModel: 'User',
        relatedId: student._id,
        priority: riskLevel === 'Critical' ? 'high' : 'medium',
        methods: { inApp: true, email: true, push: true }
      });
    }
  } catch (err) {
    console.error('Error notifying at-risk student:', err);
  }
};

module.exports = {
  sendNotification,
  notifyAttendanceMarked,
  notifyAssignmentCreated,
  notifyAssignmentSubmitted,
  notifyActivityCreated,
  notifySystemAlert,
  notifyAtRiskStudent,
};

const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get all notifications for a user
// @route   GET /api/v1/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const { isRead, type, limit = 20, page = 1 } = req.query;
    const filter = { recipient: req.user.id };
    
    if (isRead !== undefined) {
      filter.isRead = isRead === 'true';
    }
    
    if (type) {
      filter.type = type;
    }

    const notifications = await Notification.find(filter)
      .populate('sender', 'name email profileImage')
      .populate('recipient', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Notification.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: notifications,
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

// @desc    Get unread notification count
// @route   GET /api/v1/notifications/count/unread
// @access  Private
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/v1/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      {
        isRead: true,
        readAt: new Date(),
      },
      { new: true }
    ).populate('sender', 'name email');

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/v1/notifications/mark-all-read
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      {
        recipient: req.user.id,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Delete notification
// @route   DELETE /api/v1/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Clear all notifications
// @route   DELETE /api/v1/notifications
// @access  Private
exports.clearAllNotifications = async (req, res, next) => {
  try {
    const result = await Notification.deleteMany({ recipient: req.user.id });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Send notification
// @route   POST /api/v1/notifications/send
// @access  Private (Admin/Teacher)
exports.sendNotification = async (req, res, next) => {
  try {
    const {
      recipientIds,
      title,
      message,
      type = 'system',
      relatedModel,
      relatedId,
      notificationMethods = { inApp: true, email: false, push: false },
      priority = 'medium',
      actionUrl,
    } = req.body;

    if (!recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
      return res.status(400).json({ message: 'Please provide recipient IDs' });
    }

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    const notifications = [];
    const sanitizedMethods = { inApp: notificationMethods?.inApp !== false, email: false, push: false };

    for (const recipientId of recipientIds) {
      const notification = await Notification.create({
        recipient: recipientId,
        title,
        message,
        type,
        sender: req.user.id,
        relatedModel,
        relatedId,
        notificationMethods: sanitizedMethods,
        priority,
        actionUrl,
      });

      const populatedNotif = await notification.populate('sender', 'name email');
      notifications.push(populatedNotif);

      const io = req.app.get('socketio');
      if (io) {
        io.to(`user_${recipientId}`).emit('notification', {
          id: notification._id,
          title,
          message,
          type,
          priority,
          createdAt: notification.createdAt,
          actionUrl,
        });
      }
    }

    res.status(201).json({
      success: true,
      data: notifications,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Broadcast notification to all users
// @route   POST /api/v1/notifications/broadcast
// @access  Private (Admin only)
exports.broadcastNotification = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only admins can broadcast notifications' });
    }

    const { title, message, type = 'system', notificationMethods = { inApp: true } } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    const allUsers = await User.find({ _id: { $ne: req.user.id } });
    const recipientIds = allUsers.map(u => u._id);

    const io = req.app.get('socketio');
    if (io) {
      io.emit('broadcast', {
        title,
        message,
        type,
        createdAt: new Date(),
      });
    }

    const notifications = [];
    const sanitizedMethods = { inApp: notificationMethods?.inApp !== false, email: false, push: false };
    for (const recipientId of recipientIds) {
      const notification = await Notification.create({
        recipient: recipientId,
        title,
        message,
        type,
        sender: req.user.id,
        notificationMethods: sanitizedMethods,
        priority: 'high',
      });

      notifications.push(notification);
    }

    res.status(201).json({
      success: true,
      message: `Notification sent to ${notifications.length} users`,
      data: notifications.length,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get notification preferences
// @route   GET /api/v1/notifications/preferences
// @access  Private
exports.getPreferences = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const preferences = user.notificationPreferences || {
      email: true,
      push: true,
      inApp: true,
    };

    res.status(200).json({
      success: true,
      data: preferences,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Update notification preferences
// @route   PUT /api/v1/notifications/preferences
// @access  Private
exports.updatePreferences = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { notificationPreferences: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: user.notificationPreferences,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

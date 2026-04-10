const Activity = require('../models/Activity');
const User = require('../models/User');
const DigitalTwinService = require('../utils/digitalTwinService');

// @desc    Get all activities
// @route   GET /api/v1/activities
// @access  Private
exports.getActivities = async (req, res, next) => {
  try {
    let query;
    if (req.user.role === 'teacher') {
      query = Activity.find({ teacher: req.user.id });
    } else if (req.user.role === 'student') {
      query = Activity.find();
    } else {
      query = Activity.find();
    }

    const activities = await query
      .populate('teacher', 'name email')
      .populate('class', 'name')
      .populate('participants.student', 'name email rollNumber');
    
    res.status(200).json({ success: true, data: activities });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get single activity
// @route   GET /api/v1/activities/:id
// @access  Private
exports.getActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('teacher', 'name email')
      .populate('class', 'name')
      .populate('participants.student', 'name email rollNumber');

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    res.status(200).json({ success: true, data: activity });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Create activity
// @route   POST /api/v1/activities
// @access  Private/Teacher/Admin
exports.createActivity = async (req, res, next) => {
  try {
    req.body.teacher = req.user.id;
    const activity = await Activity.create(req.body);
    await activity.populate('teacher', 'name email');
    
    res.status(201).json({ success: true, data: activity });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Update activity
// @route   PUT /api/v1/activities/:id
// @access  Private/Teacher/Admin
exports.updateActivity = async (req, res, next) => {
  try {
    let activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Check authorization
    if (activity.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this activity' });
    }

    activity = await Activity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: activity });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Delete activity
// @route   DELETE /api/v1/activities/:id
// @access  Private/Teacher/Admin
exports.deleteActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Check authorization
    if (activity.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this activity' });
    }

    await Activity.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Register student for activity
// @route   POST /api/v1/activities/:id/register
// @access  Private/Student
exports.registerForActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Check if already registered
    const alreadyRegistered = activity.participants.some(
      p => p.student.toString() === req.user.id
    );

    if (alreadyRegistered) {
      return res.status(400).json({ message: 'Already registered for this activity' });
    }

    // Check max participants
    if (activity.maxParticipants && activity.participants.length >= activity.maxParticipants) {
      return res.status(400).json({ message: 'Activity is full' });
    }

    activity.participants.push({
      student: req.user.id,
      status: 'Registered',
    });

    await activity.save();
    res.status(200).json({ success: true, data: activity });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Mark participant status
// @route   PUT /api/v1/activities/:id/participants/:participantId
// @access  Private/Teacher/Admin
exports.updateParticipantStatus = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    const participant = activity.participants.id(req.params.participantId);
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    participant.status = req.body.status || participant.status;
    
    if (req.body.certificateEarned) {
      participant.certificateEarned = true;
      participant.certificateDate = new Date();
    }

    await activity.save();

    // Trigger Digital Twin sync after status change
    DigitalTwinService.updateStudentTwin(participant.student).catch(err => console.error('Student Twin sync failed:', err));
    if (activity.class) {
      DigitalTwinService.updateClassTwin(activity.class).catch(err => console.error('Class Twin sync failed:', err));
    }

    res.status(200).json({ success: true, data: activity });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Issue certificate to participants
// @route   POST /api/v1/activities/:id/issue-certificate
// @access  Private/Teacher/Admin
exports.issueCertificate = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    const { participantIds } = req.body;

    participantIds.forEach(pId => {
      const participant = activity.participants.id(pId);
      if (participant) {
        participant.certificateEarned = true;
        participant.certificateDate = new Date();
      }
    });

    await activity.save();
    res.status(200).json({ 
      success: true, 
      message: `Certificates issued to ${participantIds.length} participants`,
      data: activity 
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get activity statistics
// @route   GET /api/v1/activities/:id/stats
// @access  Private
exports.getActivityStats = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    const stats = {
      totalRegistered: activity.participants.filter(p => p.status === 'Registered').length,
      totalParticipated: activity.participants.filter(p => p.status === 'Participated').length,
      totalAbsent: activity.participants.filter(p => p.status === 'Absent').length,
      totalWithdrew: activity.participants.filter(p => p.status === 'Withdrew').length,
      certificatesIssued: activity.participants.filter(p => p.certificateEarned).length,
      participationRate: activity.participants.length > 0 
        ? ((activity.participants.filter(p => p.status === 'Participated').length / activity.participants.length) * 100).toFixed(2)
        : 0,
    };

    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Withdraw from activity
// @route   POST /api/v1/activities/:id/withdraw
// @access  Private/Student
exports.withdrawFromActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    const participant = activity.participants.find(
      p => p.student.toString() === req.user.id
    );

    if (!participant) {
      return res.status(404).json({ message: 'Not registered for this activity' });
    }

    participant.status = 'Withdrew';
    await activity.save();

    res.status(200).json({ success: true, message: 'Successfully withdrew from activity', data: activity });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

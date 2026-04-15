/* eslint-disable no-console */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const ClassModel = require('../src/models/Class');
const Subject = require('../src/models/Subject');
const Assignment = require('../src/models/Assignment');
const Notification = require('../src/models/Notification');

const authController = require('../src/controllers/authController');
const notificationController = require('../src/controllers/notificationController');
const {
  sendNotification,
  notifyAssignmentCreated,
  notifyAssignmentSubmitted,
  notifyAtRiskStudent,
} = require('../src/utils/notificationService');

const results = [];

function pushResult(name, status, detail) {
  results.push({ name, status, detail });
  console.log(`[${status}] ${name} -> ${detail}`);
}

function createMockRes() {
  const out = { statusCode: 200, body: null };
  out.status = (code) => {
    out.statusCode = code;
    return out;
  };
  out.json = (payload) => {
    out.body = payload;
    return out;
  };
  return out;
}

async function testForgotPassword(student) {
  const req = {
    body: { identifier: '26AIDS001' },
    protocol: 'http',
    get: (key) => (key === 'host' ? 'localhost:5000' : ''),
  };
  const res = createMockRes();

  await authController.forgotPassword(req, res, () => {});

  if (res.statusCode === 200 && res.body?.success) {
    pushResult('Forgot Password Email', 'PASS', `API responded 200 for ${student.email}`);
  } else {
    pushResult(
      'Forgot Password Email',
      'FAIL',
      `Status ${res.statusCode}, message: ${res.body?.message || 'Unknown error'}`
    );
  }
}

async function ensureTeacherAndClass(student) {
  let teacher = await User.findOne({ role: 'teacher' });
  if (!teacher) {
    teacher = await User.create({
      name: 'Email Test Teacher',
      email: `email.test.teacher.${Date.now()}@example.com`,
      role: 'teacher',
      employeeId: `ET${Date.now()}`.slice(-8),
      password: 'Teacher@123',
      isVerified: true,
    });
  }

  let subject = await Subject.findOne({});
  if (!subject) {
    subject = await Subject.create({
      name: 'Email Test Subject',
      code: `ETS${Date.now()}`.slice(-8),
      class: 'Test',
      credits: 3,
      description: 'Temporary subject for email tests',
    });
  }

  const className = `EmailTestClass-26AIDS001-${Date.now()}`;
  const cls = await ClassModel.create({
    name: className,
    section: 'A',
    roomNumber: 'R-01',
    teacher: teacher._id,
    students: [student._id],
  });

  return { teacher, subject, cls };
}

async function testAssignmentCreated(student, cls, teacher) {
  const assignment = await Assignment.create({
    title: `Email Test Assignment ${Date.now()}`,
    description: 'Temporary assignment for email test',
    instructions: 'Submit test file',
    subject: (await Subject.findOne({}))._id,
    class: cls._id,
    teacher: teacher._id,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    totalMarks: 100,
    status: 'Published',
  });

  await notifyAssignmentCreated(
    assignment._id,
    cls._id,
    teacher._id,
    assignment.title,
    assignment.dueDate
  );

  const notif = await Notification.findOne({
    relatedModel: 'Assignment',
    relatedId: assignment._id,
    recipient: student._id,
    title: 'New Assignment',
  }).sort({ createdAt: -1 });

  if (notif) {
    pushResult('Assignment Created Email Path', 'PASS', `Notification created for student ${student.rollNumber}`);
  } else {
    pushResult('Assignment Created Email Path', 'FAIL', 'No notification document found');
  }

  return assignment;
}

async function testAssignmentSubmitted(student, teacher, assignment) {
  await notifyAssignmentSubmitted(assignment._id, student._id, student.name, teacher._id);

  const notif = await Notification.findOne({
    relatedModel: 'Assignment',
    relatedId: assignment._id,
    recipient: teacher._id,
    title: 'Assignment Submitted',
  }).sort({ createdAt: -1 });

  if (notif) {
    pushResult('Assignment Submitted Email Path', 'PASS', `Notification created for teacher ${teacher.email}`);
  } else {
    pushResult('Assignment Submitted Email Path', 'FAIL', 'No teacher notification document found');
  }
}

async function testManualNotification(student) {
  const before = await Notification.countDocuments({
    recipient: student._id,
    title: 'Manual Test Notification',
  });

  await sendNotification({
    recipients: [student._id],
    title: 'Manual Test Notification',
    message: 'This is a direct email notification test for 26AIDS001.',
    type: 'system',
    methods: { inApp: true, email: true, push: false },
    priority: 'medium',
  });

  const after = await Notification.countDocuments({
    recipient: student._id,
    title: 'Manual Test Notification',
  });

  if (after > before) {
    pushResult('Manual Notification Email Path', 'PASS', 'Targeted notification inserted');
  } else {
    pushResult('Manual Notification Email Path', 'FAIL', 'No new manual notification found');
  }
}

async function testEarlyWarning(student) {
  let parent = await User.findOne({ role: 'parent', children: student._id });
  if (!parent) {
    parent = await User.create({
      name: 'Email Test Parent',
      email: `email.test.parent.${Date.now()}@example.com`,
      role: 'parent',
      parentId: `PT${Date.now()}`.slice(-8),
      password: 'Parent@123',
      isVerified: true,
      children: [student._id],
    });
  }

  const beforeTeacherOrParent = await Notification.countDocuments({
    title: { $regex: 'AI Early Warning', $options: 'i' },
    recipient: { $in: [parent._id] },
  });

  student.digitalTwin = student.digitalTwin || {};
  student.digitalTwin.engagementScore = 35;
  student.digitalTwin.earlyWarning = student.digitalTwin.earlyWarning || {};
  student.digitalTwin.earlyWarning.status = 'Critical';
  await student.save();

  await notifyAtRiskStudent(student, 'Critical');

  const afterTeacherOrParent = await Notification.countDocuments({
    title: { $regex: 'AI Early Warning', $options: 'i' },
    recipient: { $in: [parent._id] },
  });

  if (afterTeacherOrParent > beforeTeacherOrParent) {
    pushResult('Early Warning Email Path', 'PASS', 'Parent/teacher risk notification created');
  } else {
    pushResult('Early Warning Email Path', 'FAIL', 'No new early warning notification found');
  }
}

async function testBroadcastPathScoped(student) {
  const originalFind = User.find;

  const before = await Notification.countDocuments({
    recipient: student._id,
    title: 'Broadcast Test Notification',
  });

  const req = {
    user: { id: student._id.toString(), role: 'admin' },
    body: {
      title: 'Broadcast Test Notification',
      message: 'Scoped broadcast test for 26AIDS001',
      type: 'system',
      notificationMethods: { inApp: true, email: true, push: false },
    },
    app: { get: () => null },
  };
  const res = createMockRes();

  try {
    User.find = async () => [student];

    await notificationController.broadcastNotification(req, res, () => {});
  } finally {
    User.find = originalFind;
  }

  const after = await Notification.countDocuments({
    recipient: student._id,
    title: 'Broadcast Test Notification',
  });

  if (res.statusCode === 201 && after > before) {
    pushResult('Broadcast Notification Email Path', 'PASS', 'Broadcast controller path executed in scoped mode');
  } else {
    pushResult(
      'Broadcast Notification Email Path',
      'FAIL',
      `Status ${res.statusCode}, notifications delta ${after - before}`
    );
  }
}

async function main() {
  await connectDB();

  const student = await User.findOne({ rollNumber: '26AIDS001' });
  if (!student) {
    console.error('Student 26AIDS001 not found.');
    process.exit(1);
  }

  console.log(`Testing with student: ${student.name} (${student.rollNumber}) <${student.email}>`);

  try {
    await testForgotPassword(student);
  } catch (err) {
    pushResult('Forgot Password Email', 'FAIL', err.message);
  }

  let cls;
  let teacher;
  let assignment;
  try {
    const setup = await ensureTeacherAndClass(student);
    cls = setup.cls;
    teacher = setup.teacher;
    assignment = await testAssignmentCreated(student, cls, teacher);
  } catch (err) {
    pushResult('Assignment Created Email Path', 'FAIL', err.message);
  }

  if (teacher && assignment) {
    try {
      await testAssignmentSubmitted(student, teacher, assignment);
    } catch (err) {
      pushResult('Assignment Submitted Email Path', 'FAIL', err.message);
    }
  }

  try {
    await testManualNotification(student);
  } catch (err) {
    pushResult('Manual Notification Email Path', 'FAIL', err.message);
  }

  try {
    await testEarlyWarning(student);
  } catch (err) {
    pushResult('Early Warning Email Path', 'FAIL', err.message);
  }

  try {
    await testBroadcastPathScoped(student);
  } catch (err) {
    pushResult('Broadcast Notification Email Path', 'FAIL', err.message);
  }

  console.log('\n=== SUMMARY ===');
  for (const r of results) {
    console.log(`${r.status}: ${r.name} | ${r.detail}`);
  }

  const failed = results.filter((r) => r.status === 'FAIL').length;
  process.exit(failed > 0 ? 2 : 0);
}

main().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});

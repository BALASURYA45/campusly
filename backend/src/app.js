const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: process.env.NODE_ENV === 'development' ? 1000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again in a few minutes' },
});
app.use('/api', limiter);

// Import Routes
const authRoutes = require('./routes/authRoutes');
const classRoutes = require('./routes/classRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const userRoutes = require('./routes/userRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const activityRoutes = require('./routes/activityRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const themeRoutes = require('./routes/themeRoutes');
const studentBulkImportRoutes = require('./routes/studentBulkImportRoutes');
const studentRoutes = require('./routes/studentRoutes');
const earlyWarningRoutes = require('./routes/earlyWarningRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const quizRoutes = require('./routes/quizRoutes');
const contentRoutes = require('./routes/contentRoutes');
const digitalTwinRoutes = require('./routes/digitalTwinRoutes');

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/classes', classRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/subjects', subjectRoutes);
app.use('/api/v1/assignments', assignmentRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/timetable', timetableRoutes);
app.use('/api/v1/activities', activityRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin/theme', themeRoutes);
app.use('/api/v1/students', studentBulkImportRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/early-warning', earlyWarningRoutes);
app.use('/api/v1/resources', resourceRoutes);
app.use('/api/v1/quizzes', quizRoutes);
app.use('/api/v1/content', contentRoutes);
app.use('/api/v1/digital-twin', digitalTwinRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Smart Curriculum Activity & Attendance API is running...' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

module.exports = app;

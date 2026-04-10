const express = require('express');
const multer = require('multer');
const path = require('path');
const { bulkImportStudents, getBulkImportTemplate, createAdminAccount } = require('../controllers/studentBulkImportController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.mimetype === 'application/vnd.ms-excel' ||
    file.mimetype === 'text/csv'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files (.xlsx, .xls) and CSV files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Routes
router.post(
  '/bulk-import',
  protect,
  authorize('admin', 'superadmin'),
  upload.single('file'),
  bulkImportStudents
);

router.get(
  '/bulk-import/template',
  protect,
  authorize('admin', 'superadmin'),
  getBulkImportTemplate
);

// Create ONE admin account (public - only works once)
router.post(
  '/create-admin',
  createAdminAccount
);

module.exports = router;

const XLSX = require('xlsx');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// @desc    Import students from Excel file
// @route   POST /api/v1/students/bulk-import
// @access  Private/Admin
exports.bulkImportStudents = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an Excel file' });
    }

    // Read Excel file
    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (!data || data.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: 'Excel file is empty' });
    }

    // Validate required columns - only Roll Number and Password are required
    const requiredColumns = ['Roll Number', 'Password'];
    const firstRow = data[0];
    const hasRequiredColumns = requiredColumns.every((col) => col in firstRow);

    if (!hasRequiredColumns) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        message: `Excel file must have columns: Roll Number, Password (Name and Email are optional and will be generated if not provided)`,
      });
    }

    // Process each row
    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // Row number in Excel (header is row 1)

      try {
        const { 'Roll Number': rollNumber, Password: password, Name: name, Email: email } = row;

        // Validate required fields - only Roll Number and Password are mandatory
        if (!rollNumber || !password) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            rollNumber: rollNumber || 'N/A',
            error: 'Missing required fields (Roll Number and Password are mandatory)',
          });
          continue;
        }

        // Generate temporary name and email if not provided
        const studentName = name && name.trim() ? name.trim() : `Student ${rollNumber.trim()}`;
        const studentEmail = email && email.trim() 
          ? email.trim().toLowerCase() 
          : `${rollNumber.trim().toLowerCase()}@student.edu`;

        // Check if roll number already exists
        let existingUser = await User.findOne({ rollNumber: rollNumber.trim() });
        if (existingUser) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            rollNumber: rollNumber,
            error: 'Roll number already registered',
          });
          continue;
        }

        // Check if email already exists
        existingUser = await User.findOne({ email: studentEmail });
        if (existingUser) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            rollNumber: rollNumber,
            error: `Email ${studentEmail} already registered`,
          });
          continue;
        }

        // Create new student
        const newStudent = await User.create({
          name: studentName,
          email: studentEmail,
          password: password.toString().trim(),
          role: 'student',
          rollNumber: rollNumber.trim().toUpperCase(),
          isVerified: true, // Auto-verify bulk imported students
          verificationToken: undefined,
        });

        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push({
          row: rowNumber,
          rollNumber: data[i]['Roll Number'] || 'N/A',
          error: err.message || 'Unknown error',
        });
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: `Import completed: ${results.success} students created, ${results.failed} failed`,
      data: results,
    });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Bulk import error:', err);
    res.status(500).json({ message: 'Error processing Excel file: ' + err.message });
  }
};

// @desc    Create ONE admin account
// @route   POST /api/v1/students/create-admin
// @access  Public (Only once)
exports.createAdminAccount = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Please provide name, email, and password' 
      });
    }

    // Check if any admin already exists
    const existingAdmin = await User.findOne({ role: { $in: ['admin', 'superadmin'] } });
    if (existingAdmin) {
      return res.status(400).json({ 
        message: 'Admin account already exists in the system. Only one admin account is allowed.' 
      });
    }

    // Check if email already exists
    let existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Email already registered' 
      });
    }

    // Create admin account
    const adminUser = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password.toString().trim(),
      role: 'admin',
      isVerified: true,
      verificationToken: undefined,
    });

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully!',
      data: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
      },
    });
  } catch (err) {
    console.error('Admin creation error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    res.status(500).json({ message: err.message || 'Error creating admin account' });
  }
};

// @desc    Get bulk import template
// @route   GET /api/v1/students/bulk-import/template
// @access  Public
exports.getBulkImportTemplate = (req, res) => {
  try {
    // Create a template workbook
    const XLSX = require('xlsx');
    const workbook = XLSX.utils.book_new();
    
    const templateData = [
      {
        'Roll Number': '23CS001',
        'Password': 'Password@123',
      },
      {
        'Roll Number': '23CS002',
        'Password': 'Password@123',
      },
      {
        'Roll Number': '23CS003',
        'Password': 'Password@123',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

    // Set column widths
    worksheet['!cols'] = [
      { wch: 15 },
      { wch: 20 },
      { wch: 25 },
      { wch: 20 },
    ];

    // Send file
    const fileName = 'student_import_template.xlsx';
    const filePath = path.join(__dirname, '../../exports', fileName);
    
    const exportsDir = path.join(__dirname, '../../exports');
    if (!require('fs').existsSync(exportsDir)) {
      require('fs').mkdirSync(exportsDir, { recursive: true });
    }

    XLSX.writeFile(workbook, filePath);

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Download error:', err);
      } else {
        require('fs').unlinkSync(filePath);
      }
    });
  } catch (err) {
    console.error('Template download error:', err);
    res.status(500).json({ message: 'Error generating template: ' + err.message });
  }
};

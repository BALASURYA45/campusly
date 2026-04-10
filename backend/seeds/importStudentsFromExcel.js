require('dotenv').config();
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const User = require('../src/models/User');
const path = require('path');

const importStudents = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB\n');

    const filePath = path.join(__dirname, '../../Credentials/studentuserdetails.xlsx');
    console.log(`Reading Excel file from: ${filePath}\n`);

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (!data || data.length === 0) {
      console.log('❌ Excel file is empty');
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log(`Found ${data.length} student records in Excel file\n`);
    console.log('Column names detected:');
    console.log(Object.keys(data[0]).join(', '));
    console.log('\n═══════════════════════════════════════════════════════════\n');

    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2;

      try {
        const columnKeys = Object.keys(row);
        
        const rollNumberKey = columnKeys.find(key => 
          key.toLowerCase().includes('roll') || 
          key.toLowerCase().includes('id') || 
          key.toLowerCase().includes('student') ||
          key === 'rollNumber'
        );
        const passwordKey = columnKeys.find(key => 
          key.toLowerCase().includes('password') || 
          key.toLowerCase().includes('pass') ||
          key === 'password'
        );
        const nameKey = columnKeys.find(key => 
          key.toLowerCase().includes('name') || 
          key.toLowerCase().includes('student name') ||
          key === 'name'
        );
        const emailKey = columnKeys.find(key => 
          key.toLowerCase().includes('email') || 
          key.toLowerCase().includes('mail') ||
          key === 'email'
        );

        const rollNumber = row[rollNumberKey];
        const password = row[passwordKey];
        const name = row[nameKey];
        const email = row[emailKey];

        if (!rollNumber || !password) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            rollNumber: rollNumber || 'N/A',
            error: 'Missing Roll Number or Password',
            debug: `rollNumberKey: ${rollNumberKey}, passwordKey: ${passwordKey}, availableKeys: ${columnKeys.join(', ')}`
          });
          continue;
        }

        const studentName = name && name.trim() ? name.trim() : `Student ${rollNumber.trim()}`;
        const studentEmail = email && email.trim() 
          ? email.trim().toLowerCase() 
          : `${rollNumber.trim().toLowerCase()}@student.edu`;

        let existingUser = await User.findOne({ rollNumber: rollNumber.trim() });
        if (existingUser) {
          console.log(`⚠️  Row ${rowNumber}: ${rollNumber} - Already exists (skipped)`);
          results.failed++;
          results.errors.push({
            row: rowNumber,
            rollNumber: rollNumber,
            error: 'Roll number already exists',
          });
          continue;
        }

        existingUser = await User.findOne({ email: studentEmail });
        if (existingUser) {
          console.log(`⚠️  Row ${rowNumber}: ${rollNumber} - Email already exists (skipped)`);
          results.failed++;
          results.errors.push({
            row: rowNumber,
            rollNumber: rollNumber,
            error: `Email already exists`,
          });
          continue;
        }

        const newStudent = await User.create({
          name: studentName,
          email: studentEmail,
          password: password.toString().trim(),
          role: 'student',
          rollNumber: rollNumber.trim().toUpperCase(),
          isVerified: true,
          verificationToken: undefined,
        });

        console.log(`✓ Row ${rowNumber}: ${rollNumber} - Created successfully`);
        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push({
          row: rowNumber,
          rollNumber: data[i]['Roll Number'] || 'N/A',
          error: err.message,
        });
        console.log(`❌ Row ${rowNumber}: Error - ${err.message}`);
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════\n');
    console.log(`\n📊 IMPORT SUMMARY\n`);
    console.log(`✓ Successfully Created: ${results.success} students`);
    console.log(`❌ Failed: ${results.failed} records\n`);

    if (results.errors.length > 0 && results.success === 0) {
      console.log('⚠️  ERRORS - First error details (for debugging):\n');
      const firstError = results.errors[0];
      console.log(`  Row ${firstError.row}: ${firstError.error}`);
      if (firstError.debug) {
        console.log(`  Debug info: ${firstError.debug}`);
      }
    } else if (results.errors.length > 0) {
      console.log(`⚠️  FAILED RECORDS (showing first 20):\n`);
      results.errors.slice(0, 20).forEach(err => {
        console.log(`  Row ${err.row} (${err.rollNumber}): ${err.error}`);
      });
    }

    console.log('\n═══════════════════════════════════════════════════════════\n');

    if (results.success > 0) {
      console.log('✅ Student import completed successfully!\n');
      console.log('Students can now login with:');
      console.log('  - Roll Number: As provided in Excel');
      console.log('  - Password: As provided in Excel\n');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during import:', error.message);
    process.exit(1);
  }
};

importStudents();

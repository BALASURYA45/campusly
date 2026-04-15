require('dotenv').config();
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const User = require('../src/models/User');
const path = require('path');
const COMMON_EMAIL = process.env.FROM_EMAIL || 'balasuryad13062006@gmail.com';

const importTeachers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB\n');

    const filePath = path.join(__dirname, '../../Credentials/teachercredentials.xlsx');
    console.log(`Reading Excel file from: ${filePath}\n`);

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    if (!data || data.length === 0) {
      console.log('❌ Excel file is empty');
      await mongoose.connection.close();
      process.exit(1);
    }

    // Delete existing teachers to avoid duplicates and fix the "undefined" issue
    console.log('Cleaning up existing teacher accounts...');
    const deleteResult = await User.deleteMany({ role: 'teacher' });
    console.log(`✓ Deleted ${deleteResult.deletedCount} existing teachers\n`);

    console.log(`Using sheet: "${sheetName}"`);
    console.log(`Found ${data.length} teacher records in Excel file\n`);
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
        
        // Find columns with flexible matching
        const nameKey = columnKeys.find(key => 
          key.toLowerCase().trim() === 'name' || 
          key.toLowerCase().trim() === 'teacher name' ||
          key.toLowerCase().includes('name')
        );
        
        const idKey = columnKeys.find(key => 
          key.toLowerCase().trim() === 'id' || 
          key.toLowerCase().trim() === 'employee id' || 
          key.toLowerCase().trim() === 'teacher id' ||
          key.toLowerCase().trim() === 'userid' ||
          key.toLowerCase().trim() === 'id' ||
          (key.toLowerCase().includes('id') && key.length < 15) // Avoid matching long descriptive keys
        );
        
        const passwordKey = columnKeys.find(key => 
          key.toLowerCase().trim() === 'password' || 
          key.toLowerCase().trim() === 'pass' ||
          key.toLowerCase().includes('password')
        );

        const name = row[nameKey];
        const id = row[idKey];
        const password = row[passwordKey];

        if (!name || !id || !password) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            name: name || 'N/A',
            id: id || 'N/A',
            error: `Missing Name, ID, or Password (found keys: name=${nameKey}, id=${idKey}, pass=${passwordKey})`,
            debug: `Available columns: ${columnKeys.join(', ')}`
          });
          continue;
        }

        const teacherName = String(name).trim();
        const employeeId = String(id).trim().toUpperCase();
        const teacherPassword = String(password).trim();

        // Check if teacher already exists by employeeId
        let existingUser = await User.findOne({ employeeId });
        if (existingUser) {
          console.log(`⚠️  Row ${rowNumber}: ${teacherName} (${employeeId}) - Already exists (skipped)`);
          results.failed++;
          results.errors.push({
            row: rowNumber,
            name: teacherName,
            employeeId: employeeId,
            error: 'Employee ID already exists',
          });
          continue;
        }

        // Create teacher account
        const newTeacher = await User.create({
          name: teacherName,
          email: COMMON_EMAIL,
          password: teacherPassword,
          employeeId: employeeId,
          role: 'teacher',
          isVerified: true,
          verificationToken: undefined,
        });

        console.log(`✓ Row ${rowNumber}: ${teacherName} - Employee ID: ${employeeId} - Created successfully`);
        results.success++;
      } catch (err) {
        results.failed++;
        console.log(`❌ Row ${rowNumber}: Error - ${err.message}`);
        results.errors.push({
          row: rowNumber,
          name: data[i][Object.keys(data[i]).find(k => k.toLowerCase().includes('name'))] || 'N/A',
          error: err.message,
        });
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════\n');
    console.log(`\n📊 IMPORT SUMMARY\n`);
    console.log(`✓ Successfully Created: ${results.success} teachers`);
    console.log(`❌ Failed/Skipped: ${results.failed} records\n`);

    if (results.errors.length > 0 && results.success === 0) {
      console.log('⚠️  ERRORS - First error details (for debugging):\n');
      const firstError = results.errors[0];
      console.log(`  Row ${firstError.row}: ${firstError.error}`);
      if (firstError.debug) {
        console.log(`  Debug info: ${firstError.debug}`);
      }
    }

    if (results.success > 0) {
      console.log('✅ Teacher import completed successfully!\n');
      console.log('Teachers can now login with:');
      console.log('  - Teacher ID: From Excel file (ID column)');
      console.log('  - Password: From Excel file\n');
      console.log('In the application:');
      console.log('  1. Click "Sign In Now"');
      console.log('  2. Select "Teacher Login"');
      console.log('  3. Enter: Employee ID + Password\n');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during import:', error.message);
    process.exit(1);
  }
};

importTeachers();

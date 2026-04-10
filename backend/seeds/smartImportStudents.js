require('dotenv').config();
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const User = require('../src/models/User');
const path = require('path');

const smartImportStudents = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB\n');

    const filePath = path.join(__dirname, '../../Credentials/studentuserdetails.xlsx');
    console.log(`Reading Excel file from: ${filePath}\n`);

    const workbook = XLSX.readFile(filePath);
    
    console.log('Available sheets:', workbook.SheetNames);
    
    let data = [];
    let sheetUsed = '';

    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const sheetData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      
      if (sheetData.length > 0) {
        console.log(`\nSheet "${sheetName}" has ${sheetData.length} rows`);
        console.log('Columns:', Object.keys(sheetData[0]));
        
        if (sheetData.length > data.length) {
          data = sheetData;
          sheetUsed = sheetName;
        }
      }
    }

    if (data.length === 0) {
      console.log('❌ No data found in Excel file');
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log(`\n✓ Using sheet: "${sheetUsed}" with ${data.length} records\n`);

    console.log('═══════════════════════════════════════════════════════════\n');

    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2;

      try {
        const rowValues = Object.values(row).map(v => v ? String(v).trim() : '').filter(v => v);
        
        if (rowValues.length < 2) {
          results.failed++;
          continue;
        }

        let rollNumber = '';
        let password = '';

        rowValues.forEach(val => {
          const lowerVal = val.toLowerCase();
          if ((lowerVal.match(/\d{2}[a-z]{2}\d{3}/i) || /^[A-Z0-9]{5,}$/.test(val)) && !rollNumber) {
            rollNumber = val;
          } else if (val.length >= 4 && !password && rollNumber) {
            password = val;
          }
        });

        if (!rollNumber && rowValues.length >= 2) {
          rollNumber = rowValues[0];
          password = rowValues[1];
        }

        if (!rollNumber || !password) {
          results.failed++;
          continue;
        }

        const studentName = `Student ${rollNumber}`;
        const studentEmail = `${rollNumber.toLowerCase()}@student.edu`;

        let existingUser = await User.findOne({ rollNumber: rollNumber.toUpperCase() });
        if (existingUser) {
          console.log(`⚠️  Row ${rowNumber}: ${rollNumber} - Already exists (skipped)`);
          results.failed++;
          continue;
        }

        const newStudent = await User.create({
          name: studentName,
          email: studentEmail,
          password: password,
          role: 'student',
          rollNumber: rollNumber.toUpperCase(),
          isVerified: true,
          verificationToken: undefined,
        });

        console.log(`✓ Row ${rowNumber}: ${rollNumber} - Created successfully`);
        results.success++;
      } catch (err) {
        results.failed++;
        console.log(`❌ Row ${rowNumber}: Error - ${err.message}`);
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════\n');
    console.log(`\n📊 IMPORT SUMMARY\n`);
    console.log(`✓ Successfully Created: ${results.success} students`);
    console.log(`⚠️  Failed/Skipped: ${results.failed} records\n`);

    if (results.success > 0) {
      console.log('✅ Student import completed successfully!\n');
      console.log('Students can now login with:');
      console.log('  - Roll Number: From Excel file');
      console.log('  - Password: From Excel file\n');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during import:', error.message);
    process.exit(1);
  }
};

smartImportStudents();

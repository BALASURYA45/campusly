require('dotenv').config();
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const User = require('../src/models/User');
const path = require('path');
const COMMON_EMAIL = process.env.FROM_EMAIL || 'balasuryad13062006@gmail.com';

const importFromDE = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB\n');

    const filePath = path.join(__dirname, '../../Credentials/studentuserdetails.xlsx');
    console.log(`Reading Excel file from: ${filePath}\n`);

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    console.log(`Using sheet: "${sheetName}"\n`);
    console.log('═══════════════════════════════════════════════════════════\n');

    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    const range = worksheet['!ref'];
    console.log(`Sheet range: ${range}\n`);

    let rowNum = 1;
    while (true) {
      const cellD = worksheet[`D${rowNum}`];
      const cellE = worksheet[`E${rowNum}`];

      if (!cellD || !cellE) {
        rowNum++;
        if (rowNum > 600) break;
        continue;
      }

      const rollNumber = cellD.v ? String(cellD.v).trim() : '';
      const password = cellE.v ? String(cellE.v).trim() : '';

      if (!rollNumber || !password) {
        rowNum++;
        continue;
      }

      try {
        let existingUser = await User.findOne({ rollNumber: rollNumber.toUpperCase() });
        if (existingUser) {
          console.log(`⚠️  Row ${rowNum}: ${rollNumber} - Already exists (skipped)`);
          results.failed++;
          rowNum++;
          continue;
        }

        const studentName = `Student ${rollNumber}`;
        const newStudent = await User.create({
          name: studentName,
          email: COMMON_EMAIL,
          password: password,
          role: 'student',
          rollNumber: rollNumber.toUpperCase(),
          isVerified: true,
          verificationToken: undefined,
        });

        console.log(`✓ Row ${rowNum}: ${rollNumber} - Created successfully`);
        results.success++;
      } catch (err) {
        results.failed++;
        console.log(`❌ Row ${rowNum}: ${rollNumber} - Error: ${err.message}`);
        results.errors.push({
          row: rowNum,
          rollNumber: rollNumber,
          error: err.message,
        });
      }

      rowNum++;
    }

    console.log('\n═══════════════════════════════════════════════════════════\n');
    console.log(`\n📊 IMPORT SUMMARY\n`);
    console.log(`✓ Successfully Created: ${results.success} students`);
    console.log(`⚠️  Failed/Skipped: ${results.failed} records\n`);

    if (results.success > 0) {
      console.log('✅ Student import completed successfully!\n');
      console.log('Students can now login with:');
      console.log('  - Roll Number: From Column D');
      console.log('  - Password: From Column E\n');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during import:', error.message);
    process.exit(1);
  }
};

importFromDE();




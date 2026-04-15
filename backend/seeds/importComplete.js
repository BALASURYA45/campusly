require('dotenv').config();
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const User = require('../src/models/User');
const path = require('path');
const COMMON_EMAIL = process.env.FROM_EMAIL || 'balasuryad13062006@gmail.com';

const importComplete = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB\n');

    const filePath = path.join(__dirname, '../../Credentials/studentuserdetails.xlsx');
    console.log(`Reading Excel file from: ${filePath}\n`);

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    console.log(`Using sheet: "${sheetName}"\n`);

    // Delete existing students to ensure a clean import
    console.log('Cleaning up existing student accounts...');
    const deleteResult = await User.deleteMany({ role: 'student' });
    console.log(`✓ Deleted ${deleteResult.deletedCount} existing students\n`);

    console.log('═══════════════════════════════════════════════════════════\n');

    const results = {
      success: 0,
      failed: 0,
      errors: [],
      columnA: 0,
      columnDE: 0,
    };

    let rowNum = 3; // Start from row 3 (skip headers)
    const processedRollNumbers = new Set();
    let consecutiveEmptyRows = 0;

    async function createStudent(rollNumber, password, source, currentLine) {
      if (!rollNumber || !password) return;
      
      const rollNumberUpper = String(rollNumber).trim().toUpperCase();
      const studentPassword = String(password).trim();

      if (!rollNumberUpper || !studentPassword) return;

      // Skip header text if somehow caught
      if (rollNumberUpper.includes('ROLLNO') || rollNumberUpper === '' || rollNumberUpper.length < 3) return;

      if (processedRollNumbers.has(rollNumberUpper)) {
        return;
      }

      try {
        await User.create({
          name: `Student ${rollNumberUpper}`,
          email: COMMON_EMAIL,
          password: studentPassword,
          role: 'student',
          rollNumber: rollNumberUpper,
          isVerified: true,
          verificationToken: undefined,
        });

        processedRollNumbers.add(rollNumberUpper);
        results.success++;
        if (source === 'A-B') results.columnA++;
        else results.columnDE++;
        
        if (results.success % 100 === 0) {
          console.log(`✓ Processed ${results.success} students...`);
        }
      } catch (err) {
        // If it's a duplicate error that wasn't caught by the Set (shouldn't happen with deleteMany but just in case)
        if (err.code === 11000) {
           return;
        }
        results.failed++;
        results.errors.push(`Row ${currentLine} (${source}): ${err.message}`);
      }
    }

    while (consecutiveEmptyRows < 50) { // Scan up to 50 consecutive empty rows to be safe
      const cellA = worksheet[`A${rowNum}`];
      const cellB = worksheet[`B${rowNum}`];
      const cellD = worksheet[`D${rowNum}`];
      const cellE = worksheet[`E${rowNum}`];

      let rowHasData = false;

      // Process Column A-B (2023-2027)
      if (cellA && cellB && cellA.v !== undefined && cellB.v !== undefined) {
        const rv = String(cellA.v).trim();
        const pv = String(cellB.v).trim();
        if (rv && pv) {
          await createStudent(rv, pv, 'A-B', rowNum);
          rowHasData = true;
        }
      }

      // Process Column D-E (2024-2028)
      if (cellD && cellE && cellD.v !== undefined && cellE.v !== undefined) {
        const rv = String(cellD.v).trim();
        const pv = String(cellE.v).trim();
        if (rv && pv) {
          await createStudent(rv, pv, 'D-E', rowNum);
          rowHasData = true;
        }
      }

      if (rowHasData) {
        consecutiveEmptyRows = 0;
      } else {
        consecutiveEmptyRows++;
      }

      rowNum++;
      if (rowNum > 5000) break; // Absolute limit
    }

    console.log('\n═══════════════════════════════════════════════════════════\n');
    console.log(`\n📊 IMPORT SUMMARY\n`);
    console.log(`✓ Successfully Created: ${results.success} students`);
    console.log(`  - From Columns A-B: ${results.columnA} students`);
    console.log(`  - From Columns D-E: ${results.columnDE} students`);
    console.log(`⚠️  Failed/Skipped: ${results.failed} records\n`);

    if (results.errors.length > 0 && results.success < 10) {
       console.log('Sample Errors:');
       results.errors.slice(0, 5).forEach(e => console.log(` - ${e}`));
    }

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

importComplete();

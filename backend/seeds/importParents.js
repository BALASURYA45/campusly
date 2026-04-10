require('dotenv').config();
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const User = require('../src/models/User');
const path = require('path');

const importParents = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB\n');

    const filePath = path.join(__dirname, '../../Credentials/ParentCredentials.xlsx');
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

    console.log(`Using sheet: "${sheetName}"`);
    
    // Delete existing parents to ensure a clean import
    console.log('Cleaning up existing parent accounts...');
    const deleteResult = await User.deleteMany({ role: 'parent' });
    console.log(`✓ Deleted ${deleteResult.deletedCount} existing parents\n`);

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
        const parentId = String(row['ParentID']).trim().toUpperCase();
        const studentId = String(row['StudentID']).trim().toUpperCase();
        const password = String(row['Password']).trim();

        if (!parentId || !studentId || !password) {
          continue;
        }

        // Find the student
        const student = await User.findOne({ rollNumber: studentId, role: 'student' });
        
        if (!student) {
          results.failed++;
          results.errors.push(`Row ${rowNumber}: Student with roll number ${studentId} not found`);
          continue;
        }

        const parentEmail = `parent_${parentId.replace(/[^a-z0-9]/gi, '')}@parent.edu`;

        // Create parent account
        await User.create({
          name: `Parent of ${student.name}`,
          email: parentEmail,
          password: password,
          role: 'parent',
          parentId: parentId,
          children: [student._id],
          isVerified: true,
          verificationToken: undefined,
        });

        results.success++;
        if (results.success % 100 === 0) {
          console.log(`✓ Processed ${results.success} parents...`);
        }
      } catch (err) {
        results.failed++;
        results.errors.push(`Row ${rowNumber}: ${err.message}`);
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════\n');
    console.log(`\n📊 IMPORT SUMMARY\n`);
    console.log(`✓ Successfully Created: ${results.success} parents`);
    console.log(`❌ Failed/Skipped: ${results.failed} records\n`);

    if (results.errors.length > 0 && results.success < 10) {
      console.log('Sample Errors:');
      results.errors.slice(0, 5).forEach(e => console.log(` - ${e}`));
    }

    if (results.success > 0) {
      console.log('✅ Parent import completed successfully!\n');
      console.log('Parents can now login with:');
      console.log('  - Parent ID: From Excel file');
      console.log('  - Password: From Excel file\n');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during import:', error.message);
    process.exit(1);
  }
};

importParents();

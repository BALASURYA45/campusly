const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../Credentials/studentuserdetails.xlsx');
const workbook = XLSX.readFile(filePath);

console.log('Sheet names:', workbook.SheetNames);

workbook.SheetNames.forEach(sheetName => {
  console.log(`\n\n=== Sheet: ${sheetName} ===`);
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  console.log('Total rows:', data.length);
  console.log('Column names:', Object.keys(data[0]));
  
  console.log('\nFirst 10 rows (raw):');
  data.slice(0, 10).forEach((row, idx) => {
    console.log(`\nRow ${idx + 2}:`, JSON.stringify(row, null, 2));
  });
});

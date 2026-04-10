const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, '../Credentials/studentuserdetails.xlsx');
const workbook = XLSX.readFile(filePath);

let output = '';
output += 'Sheet names: ' + workbook.SheetNames.join(', ') + '\n\n';

workbook.SheetNames.forEach(sheetName => {
  output += `\n\n=== Sheet: ${sheetName} ===\n`;
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  
  output += 'Total rows: ' + data.length + '\n';
  output += 'Column names: ' + Object.keys(data[0]).join(', ') + '\n';
  
  output += '\n--- First 5 rows ---\n';
  data.slice(0, 5).forEach((row, idx) => {
    output += `\nRow ${idx + 1}:\n`;
    for (const [key, value] of Object.entries(row)) {
      output += `  ${key}: ${value}\n`;
    }
  });
});

fs.writeFileSync(path.join(__dirname, 'excel-structure.txt'), output);
console.log('File written to excel-structure.txt');

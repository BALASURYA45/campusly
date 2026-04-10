const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../Credentials/studentuserdetails.xlsx');

try {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);

  let output = '';
  output += `Sheet Name: ${sheetName}\n`;
  output += `Total Rows: ${data.length}\n`;
  output += `\nColumn Names:\n`;
  output += JSON.stringify(Object.keys(data[0]), null, 2) + '\n';
  output += `\nFirst 3 rows:\n`;
  data.slice(0, 3).forEach((row, idx) => {
    output += `\nRow ${idx + 2}:\n`;
    output += JSON.stringify(row, null, 2) + '\n';
  });

  fs.writeFileSync(path.join(__dirname, 'columns-output.txt'), output);
  console.log('Output written to columns-output.txt');
} catch (error) {
  console.error('Error:', error.message);
}

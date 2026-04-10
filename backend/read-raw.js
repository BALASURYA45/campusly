const XLSX = require('xlsx');
const path = require('path');

const readRaw = (filePath) => {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log(`--- Raw rows for ${path.basename(filePath)} ---`);
    rawData.slice(0, 5).forEach((row, i) => console.log(`Row ${i + 1}:`, row));
};

readRaw(path.join(__dirname, '../Credentials/studentuserdetails.xlsx'));
readRaw(path.join(__dirname, '../Credentials/ParentCredentials.xlsx'));
readRaw(path.join(__dirname, '../Credentials/teachercredentials.xlsx'));

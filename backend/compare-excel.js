const XLSX = require('xlsx');
const path = require('path');

const compare = () => {
    const sFile = path.join(__dirname, '../Credentials/studentuserdetails.xlsx');
    const pFile = path.join(__dirname, '../Credentials/ParentCredentials.xlsx');

    const sWorkbook = XLSX.readFile(sFile);
    const pWorkbook = XLSX.readFile(pFile);

    const sData = XLSX.utils.sheet_to_json(sWorkbook.Sheets[sWorkbook.SheetNames[0]], { defval: '' });
    const pData = XLSX.utils.sheet_to_json(pWorkbook.Sheets[pWorkbook.SheetNames[0]], { defval: '' });

    console.log('--- Student Data Row 2 (headers) ---');
    console.log(sData[1]);
    console.log('--- Parent Data Row 2 (headers) ---');
    console.log(pData[1]);

    console.log('--- Student Data Row 3 ---');
    console.log(sData[2]);
    console.log('--- Parent Data Row 3 ---');
    console.log(pData[2]);
};

compare();

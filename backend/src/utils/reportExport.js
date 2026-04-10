const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const exportDir = path.join(__dirname, '../../exports');

if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });
}

const sanitizeFileName = (title) => {
  const sanitized = String(title)
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/[. ]+$/, '')
    .trim();

  return sanitized || 'report';
};

const generateCSV = (data, title) => {
  const fileName = `${sanitizeFileName(title)}_${Date.now()}.csv`;
  const filePath = path.join(exportDir, fileName);

  let csv = `"${title}"\n`;
  csv += `"Generated on: ${new Date().toLocaleString()}"\n\n`;

  if (data.summary) {
    csv += '"Summary"\n';
    Object.entries(data.summary).forEach(([key, value]) => {
      csv += `"${key}","${value}"\n`;
    });
    csv += '\n';
  }

  if (data.details && Array.isArray(data.details)) {
    if (data.details.length > 0) {
      const headers = Object.keys(data.details[0]);
      csv += '"' + headers.join('","') + '"\n';
      data.details.forEach(row => {
        const values = headers.map(h => {
          const val = row[h];
          return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
        });
        csv += '"' + values.join('","') + '"\n';
      });
    }
  }

  fs.writeFileSync(filePath, csv);
  return { fileName, filePath };
};

const generateExcel = async (data, title) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Report');

  worksheet.columns = [
    { header: 'Report', key: 'report', width: 30 }
  ];

  worksheet.getCell('A1').value = title;
  worksheet.getCell('A1').font = { bold: true, size: 14 };
  worksheet.getCell('A2').value = `Generated: ${new Date().toLocaleString()}`;
  worksheet.getCell('A2').font = { italic: true };

  let rowNum = 4;

  if (data.summary) {
    worksheet.getCell(`A${rowNum}`).value = 'Summary';
    worksheet.getCell(`A${rowNum}`).font = { bold: true };
    rowNum++;

    Object.entries(data.summary).forEach(([key, value]) => {
      worksheet.getCell(`A${rowNum}`).value = key;
      worksheet.getCell(`B${rowNum}`).value = value;
      rowNum++;
    });

    rowNum += 2;
  }

  if (data.details && Array.isArray(data.details)) {
    if (data.details.length > 0) {
      worksheet.getCell(`A${rowNum}`).value = 'Details';
      worksheet.getCell(`A${rowNum}`).font = { bold: true };
      rowNum++;

      const headers = Object.keys(data.details[0]);
      headers.forEach((header, idx) => {
        const cell = worksheet.getCell(rowNum, idx + 1);
        cell.value = header;
        cell.font = { bold: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } };
      });
      rowNum++;

      data.details.forEach(row => {
        headers.forEach((header, idx) => {
          worksheet.getCell(rowNum, idx + 1).value = row[header];
        });
        rowNum++;
      });
    }
  }

  if (data.statistics) {
    rowNum += 2;
    worksheet.getCell(`A${rowNum}`).value = 'Statistics';
    worksheet.getCell(`A${rowNum}`).font = { bold: true };
    rowNum++;

    Object.entries(data.statistics).forEach(([key, value]) => {
      worksheet.getCell(`A${rowNum}`).value = key;
      worksheet.getCell(`B${rowNum}`).value = value;
      rowNum++;
    });
  }

  worksheet.columns.forEach(column => {
    column.width = 20;
  });

  const fileName = `${sanitizeFileName(title)}_${Date.now()}.xlsx`;
  const filePath = path.join(exportDir, fileName);

  await workbook.xlsx.writeFile(filePath);
  return { fileName, filePath };
};

const generatePDF = (data, title) => {
  return new Promise((resolve, reject) => {
    const fileName = `${sanitizeFileName(title)}_${Date.now()}.pdf`;
    const filePath = path.join(exportDir, fileName);

    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    doc.fontSize(20).font('Helvetica-Bold').text(title, { align: 'center' });
    doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown();

    if (data.summary) {
      doc.fontSize(14).font('Helvetica-Bold').text('Summary');
      Object.entries(data.summary).forEach(([key, value]) => {
        doc.fontSize(11).font('Helvetica').text(`${key}: ${value}`);
      });
      doc.moveDown();
    }

    if (data.details && Array.isArray(data.details)) {
      if (data.details.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold').text('Details');

        const headers = Object.keys(data.details[0]);
        const colWidth = (doc.page.width - 100) / headers.length;

        const tableTop = doc.y;
        const rowHeight = 20;
        const pageHeight = doc.page.height;

        doc.fontSize(10).font('Helvetica-Bold');
        headers.forEach((header, idx) => {
          doc.text(header, 50 + idx * colWidth, tableTop, {
            width: colWidth,
            align: 'left',
          });
        });

        doc.fontSize(10).font('Helvetica');
        let yPosition = tableTop + rowHeight;

        data.details.slice(0, 20).forEach(row => {
          if (yPosition + rowHeight > pageHeight - 50) {
            doc.addPage();
            yPosition = 50;
          }

          headers.forEach((header, idx) => {
            doc.text(String(row[header]), 50 + idx * colWidth, yPosition, {
              width: colWidth,
              align: 'left',
            });
          });

          yPosition += rowHeight;
        });

        if (data.details.length > 20) {
          doc.fontSize(10).text(`... and ${data.details.length - 20} more rows`);
        }

        doc.moveDown();
      }
    }

    if (data.statistics) {
      doc.fontSize(14).font('Helvetica-Bold').text('Statistics');
      Object.entries(data.statistics).forEach(([key, value]) => {
        doc.fontSize(11).font('Helvetica').text(`${key}: ${value}`);
      });
    }

    doc.end();

    stream.on('finish', () => {
      resolve({ fileName, filePath });
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });
};

module.exports = {
  generateCSV,
  generateExcel,
  generatePDF,
  exportDir,
  sanitizeFileName,
};

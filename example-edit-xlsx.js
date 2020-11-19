const Excel = require('exceljs');
const workbook = new Excel.Workbook();

const fileTemplate = 'documentos/TEMPLATE.xlsx';
const fileDocument = `documentos/${'ID_12121212'}.xlsx`
console.log(fileDocument);

workbook.xlsx.readFile(fileTemplate)
    .then(function() {
        var worksheet = workbook.getWorksheet(2);
        var row = worksheet.getRow(5);
        row.getCell(1).value = 'hola mundo'; // A5's value set to 5
        row.commit();
        return workbook.xlsx.writeFile(fileDocument);
    })
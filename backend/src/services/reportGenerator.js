import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

export const generateReportPDF = async (type, data) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // Header
            doc.fontSize(20).text(`${type.toUpperCase()} REPORT`, { align: 'center' });
            doc.moveDown();
            doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
            doc.moveDown(2);

            // Report content based on type
            doc.fontSize(12).text(JSON.stringify(data, null, 2));

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

export const generateReportExcel = async (type, data) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`${type} Report`);

        // Add header
        worksheet.addRow([`${type.toUpperCase()} REPORT`]);
        worksheet.addRow([`Generated: ${new Date().toLocaleString()}`]);
        worksheet.addRow([]);

        // Add data based on type
        if (type === 'sales' && data.salesOverTime) {
            worksheet.addRow(['Date', 'Orders', 'Revenue']);
            data.salesOverTime.forEach(row => {
                worksheet.addRow([row.date, row.orders, row.revenue]);
            });
        } else if (type === 'inventory' && data.inventory) {
            worksheet.addRow(['SKU', 'Name', 'Stock', 'Min Level', 'Value', 'Status']);
            data.inventory.forEach(item => {
                worksheet.addRow([
                    item.sku,
                    item.name,
                    item.stockQuantity,
                    item.minStockLevel,
                    item.value,
                    item.status
                ]);
            });
        }

        // Style header row
        worksheet.getRow(1).font = { bold: true, size: 14 };
        worksheet.getRow(4).font = { bold: true };

        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;
    } catch (error) {
        throw error;
    }
};

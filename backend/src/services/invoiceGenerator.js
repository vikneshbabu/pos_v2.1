import PDFDocument from 'pdfkit';

export const generateReceipt = async (order) => {
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
            doc.fontSize(20).text('RECEIPT', { align: 'center' });
            doc.moveDown();

            // Business Info
            doc.fontSize(12).text('POS System v2.1', { align: 'center' });
            doc.fontSize(10).text('Your Business Address', { align: 'center' });
            doc.text('Phone: +91 XXXXXXXXXX', { align: 'center' });
            doc.moveDown();

            // Order Info
            doc.fontSize(10);
            doc.text(`Order Number: ${order.orderNumber}`);
            doc.text(`Date: ${new Date(order.orderDate).toLocaleString()}`);
            doc.text(`Cashier ID: ${order.cashierId}`);
            doc.moveDown();

            // Line separator
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            // Items header
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('Item', 50, doc.y, { width: 200, continued: true });
            doc.text('Qty', 250, doc.y, { width: 50, continued: true });
            doc.text('Price', 300, doc.y, { width: 100, continued: true });
            doc.text('Total', 400, doc.y, { width: 100, align: 'right' });
            doc.moveDown();

            // Line separator
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            // Items
            doc.font('Helvetica');
            for (const item of order.items) {
                const y = doc.y;
                doc.text(item.productName || 'Product', 50, y, { width: 200 });
                doc.text(item.quantity.toString(), 250, y, { width: 50 });
                doc.text(`₹${parseFloat(item.unitPrice).toFixed(2)}`, 300, y, { width: 100 });
                doc.text(`₹${parseFloat(item.subtotal).toFixed(2)}`, 400, y, { width: 100, align: 'right' });
                doc.moveDown();
            }

            // Line separator
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            // Totals
            doc.font('Helvetica');
            const totalsX = 400;
            doc.text('Subtotal:', totalsX, doc.y, { width: 100, continued: true });
            doc.text(`₹${parseFloat(order.subtotal).toFixed(2)}`, { align: 'right' });

            if (order.discountAmount > 0) {
                doc.text('Discount:', totalsX, doc.y, { width: 100, continued: true });
                doc.text(`-₹${parseFloat(order.discountAmount).toFixed(2)}`, { align: 'right' });
            }

            doc.text('Tax:', totalsX, doc.y, { width: 100, continued: true });
            doc.text(`₹${parseFloat(order.taxAmount).toFixed(2)}`, { align: 'right' });

            doc.moveDown();
            doc.font('Helvetica-Bold').fontSize(12);
            doc.text('Total:', totalsX, doc.y, { width: 100, continued: true });
            doc.text(`₹${parseFloat(order.totalAmount).toFixed(2)}`, { align: 'right' });

            doc.moveDown();
            doc.font('Helvetica').fontSize(10);
            doc.text(`Payment Method: ${order.paymentMethod.toUpperCase()}`, totalsX, doc.y);

            // Footer
            doc.moveDown(2);
            doc.fontSize(10).text('Thank you for your business!', { align: 'center' });
            doc.fontSize(8).text('Please visit again', { align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

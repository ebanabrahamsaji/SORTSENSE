import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fs from 'fs';

async function testPDF() {
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream('test_report.pdf'));

    doc.fontSize(20).text('SortSense Test PDF', 100, 100);

    const qr = await QRCode.toDataURL('https://google.com');
    doc.image(qr, 100, 150, { width: 100 });

    doc.end();
    console.log("PDF generated: test_report.pdf");
}

testPDF();

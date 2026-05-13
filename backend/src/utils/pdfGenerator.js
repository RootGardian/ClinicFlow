const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generatePrescriptionPDF = (data, outputPath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(outputPath);

    doc.pipe(stream);

    // Header
    doc
      .fillColor('#357a87')
      .fontSize(25)
      .text('ClinicFlow', 50, 50, { bold: true })
      .fontSize(10)
      .fillColor('#666666')
      .text('Plateforme de Télémédecine', 50, 80)
      .moveDown();

    // Doctor Info
    doc
      .fillColor('#000000')
      .fontSize(14)
      .text(`Dr. ${data.doctorName}`, { align: 'right' })
      .fontSize(10)
      .text(data.doctorSpecialty, { align: 'right' })
      .text(data.doctorEmail, { align: 'right' })
      .moveDown(2);

    // Title
    doc
      .fillColor('#357a87')
      .fontSize(20)
      .text('ORDONNANCE MÉDICALE', { align: 'center', underline: true })
      .moveDown(2);

    // Patient Info
    doc
      .fillColor('#000000')
      .fontSize(12)
      .text(`Patient: ${data.patientName}`, 50, 250)
      .text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 50, 270)
      .moveDown(2);

    // Prescription Content
    doc
      .fontSize(14)
      .fillColor('#333333')
      .text('Prescription:', 50, 320, { bold: true })
      .moveDown()
      .fontSize(12)
      .fillColor('#000000')
      .text(data.content, { lineGap: 10 })
      .moveDown(4);

    // Digital Signature Placeholder
    doc
      .fontSize(10)
      .text('Signé numériquement via ClinicFlow', { align: 'center', italic: true })
      .moveDown()
      .rect(200, 600, 200, 100)
      .stroke('#357a87');

    doc.end();

    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
};

module.exports = { generatePrescriptionPDF };

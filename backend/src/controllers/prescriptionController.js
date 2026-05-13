const prisma = require('../config/db');
const PDFDocument = require('pdfkit');

const fs = require('fs');
const path = require('path');
const sendEmail = require('../utils/mailSender');

// Créer une ordonnance
exports.createPrescription = async (req, res) => {
  try {
    const { appointmentId, content, advice } = req.body;

    // Vérifier si l'ordonnance existe déjà
    const existing = await prisma.prescription.findUnique({
      where: { appointment_id: parseInt(appointmentId) }
    });

    if (existing) {
      return res.status(400).json({ message: "Une ordonnance existe déjà pour ce rendez-vous." });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(appointmentId) },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } }
      }
    });

    if (!appointment) return res.status(404).json({ message: 'RDV non trouvé.' });

    // Générer un numéro de référence unique
    const referenceNum = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const prescription = await prisma.prescription.create({
      data: {
        appointment_id: parseInt(appointmentId),
        content: content,
        advice: advice,
        reference_num: referenceNum
      }
    });

    // Marquer le rendez-vous comme terminé
    await prisma.appointment.update({
      where: { id: parseInt(appointmentId) },
      data: { status: 'completed' }
    });

    // --- GÉNÉRER LE PDF SUR LE DISQUE ---
    const { doctor, patient } = appointment;
    const pdfName = `ordonnance-${referenceNum}.pdf`;
    
    // S'assurer que le dossier existe
    const prescriptionsDir = path.join(__dirname, '../../uploads/prescriptions');
    if (!fs.existsSync(prescriptionsDir)) {
      fs.mkdirSync(prescriptionsDir, { recursive: true });
    }
    
    const pdfPath = path.join(prescriptionsDir, pdfName);
    
    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4',
      info: {
        Title: `Ordonnance ${referenceNum}`,
        Author: `Dr. ${doctor.user.last_name}`,
      }
    });

    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    // Header background
    doc.rect(0, 0, 600, 20).fill('#0D9488');
    doc.fillColor('#0D9488').fontSize(26).text('ClinicFlow', 50, 40, { bold: true });
    doc.fillColor('#9CA3AF').fontSize(9).text('SANTÉ CONNECTÉE MAROC', 50, 70);
    
    // Doctor Details
    doc.fillColor('#1F2937').fontSize(12).text(`Dr. ${doctor.user.first_name} ${doctor.user.last_name}`, 350, 40, { align: 'right' });
    doc.fillColor('#6B7280').fontSize(10).text(doctor.specialty || 'Médecin Généraliste', 350, 55, { align: 'right' });
    doc.text(`Licence: ${doctor.license_number || '---'}`, 350, 68, { align: 'right' });
    doc.moveDown(4);
    
    // Separator
    doc.moveTo(50, 110).lineTo(545, 110).stroke('#E5E7EB');
    
    // Patient
    doc.rect(50, 130, 495, 80).fill('#F9FAFB');
    doc.fillColor('#4B5563').fontSize(10).text('DESTINATAIRE', 70, 145);
    doc.fillColor('#111827').fontSize(14).text(`${patient.user.first_name} ${patient.user.last_name}`, 70, 160, { bold: true });
    
    doc.fillColor('#4B5563').fontSize(10).text('DATE', 350, 145);
    doc.fillColor('#111827').fontSize(12).text(new Date(prescription.created_at).toLocaleDateString('fr-FR'), 350, 160);
    doc.text(`RÉF: ${referenceNum}`, 350, 175, { fontSize: 9 });
    
    doc.moveDown(6);
    doc.fillColor('#0D9488').fontSize(20).text('ORDONNANCE MÉDICALE', { align: 'center', underline: true });
    doc.moveDown(2);
    
    const meds = Array.isArray(content) ? content : JSON.parse(content);
    meds.forEach((item, index) => {
      doc.fillColor('#0D9488').fontSize(12).text(`${index + 1}.`, 50, doc.y, { continued: true });
      doc.fillColor('#1F2937').text(`  ${item.med}`, { bold: true });
      doc.fillColor('#6B7280').fontSize(10).text(`      Posologie : ${item.dosage}`);
      doc.moveDown(1);
      if (doc.y > 700) doc.addPage();
    });
    
    if (advice) {
      doc.moveDown(2);
      doc.rect(50, doc.y, 495, 60).stroke('#F3F4F6');
      doc.fillColor('#0D9488').fontSize(11).text(' CONSEILS ET RECOMMANDATIONS :', 60, doc.y + 10, { bold: true });
      doc.fillColor('#4B5563').fontSize(10).text(advice, 60, doc.y + 5);
    }
    
    // Footer
    const footerY = 750;
    doc.moveTo(50, footerY).lineTo(545, footerY).stroke('#E5E7EB');
    doc.fillColor('#9CA3AF').fontSize(8).text('Ce document a été généré via la plateforme ClinicFlow. La validité de cette ordonnance peut être vérifiée en ligne.', 50, footerY + 15, { align: 'center' });
    doc.text('ClinicFlow Maroc SARL - Casablanca - www.clinicflow.ma', { align: 'center' });
    
    doc.rect(420, 650, 100, 60).stroke('#0D9488');
    doc.fillColor('#0D9488').fontSize(7).text('VALIDE SANS SIGNATURE', 425, 660, { width: 90, align: 'center' });
    doc.fontSize(8).text('SIGNÉ ÉLECTRONIQUEMENT', 425, 680, { width: 90, align: 'center' , bold: true });

    doc.end();

    // Attendre la fin de l'écriture du fichier
    await new Promise((resolve) => stream.on('finish', resolve));

    // --- ENREGISTRER COMME DOCUMENT MÉDICAL ---
    await prisma.medicalDocument.create({
      data: {
        patient_id: patient.id,
        title: `Ordonnance - Dr. ${doctor.user.last_name}`,
        file_url: `/uploads/prescriptions/${pdfName}`,
        file_type: 'PDF'
      }
    });

    // --- TEMPS RÉEL (SOCKET.IO) ---
    if (req.app.get('io')) {
      req.app.get('io').emit('prescription_generated', { 
        appointmentId: appointment.id,
        patientId: patient.id,
        doctorId: doctor.id
      });
    }

    // --- ENVOYER EMAIL AU PATIENT ---
    try {
      await sendEmail({
        to: patient.user.email,
        subject: `Votre ordonnance numérique - Dr. ${doctor.user.last_name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #0284c7;">Votre ordonnance ClinicFlow</h2>
            <p>Bonjour <strong>${patient.user.first_name}</strong>,</p>
            <p>Veuillez trouver ci-joint votre ordonnance numérique suite à votre consultation avec le <strong>Dr. ${doctor.user.last_name}</strong>.</p>
            <p>Cette ordonnance est signée numériquement et peut être présentée en pharmacie.</p>
            <br/>
            <p>Cordialement,<br/>L'équipe ClinicFlow</p>
          </div>
        `,
        attachments: [{ filename: pdfName, path: pdfPath }]
      });
    } catch (mailError) {
      console.error("Erreur envoi email ordonnance:", mailError.message);
    }

    res.status(201).json({ message: "Ordonnance créée avec succès.", prescription });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la création de l'ordonnance." });
  }
};

// Télécharger le PDF de l'ordonnance
exports.downloadPrescriptionPDF = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await prisma.prescription.findUnique({
      where: { id: parseInt(id) },
      include: {
        appointment: {
          include: {
            doctor: { include: { user: true } },
            patient: { include: { user: true } }
          }
        }
      }
    });

    if (!prescription) {
      return res.status(404).json({ message: "Ordonnance non trouvée." });
    }

    const { appointment } = prescription;
    const { doctor, patient } = appointment;

    // Créer le document PDF
    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4',
      info: {
        Title: `Ordonnance ${prescription.reference_num}`,
        Author: `Dr. ${doctor.user.last_name}`,
      }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ordonnance-${prescription.reference_num}.pdf`);

    doc.pipe(res);

    // --- DESIGN PREMIUM ---
    
    // Header background (Ligne de couleur)
    doc.rect(0, 0, 600, 20).fill('#0D9488');
    
    // Logo / Brand
    doc.fillColor('#0D9488').fontSize(26).text('ClinicFlow', 50, 40, { bold: true });
    doc.fillColor('#9CA3AF').fontSize(9).text('SANTÉ CONNECTÉE MAROC', 50, 70);
    
    // Doctor Details (Haut Droite)
    doc.fillColor('#1F2937').fontSize(12).text(`Dr. ${doctor.user.first_name} ${doctor.user.last_name}`, 350, 40, { align: 'right' });
    doc.fillColor('#6B7280').fontSize(10).text(doctor.specialty || 'Médecin Généraliste', 350, 55, { align: 'right' });
    doc.text(`Licence: ${doctor.license_number || '---'}`, 350, 68, { align: 'right' });
    
    doc.moveDown(4);
    
    // Separator line
    doc.moveTo(50, 110).lineTo(545, 110).stroke('#E5E7EB');
    
    // Patient & Date Box
    doc.rect(50, 130, 495, 80).fill('#F9FAFB');
    doc.fillColor('#4B5563').fontSize(10).text('DESTINATAIRE', 70, 145);
    doc.fillColor('#111827').fontSize(14).text(`${patient.user.first_name} ${patient.user.last_name}`, 70, 160, { bold: true });
    
    doc.fillColor('#4B5563').fontSize(10).text('DATE', 350, 145);
    doc.fillColor('#111827').fontSize(12).text(new Date(prescription.created_at).toLocaleDateString('fr-FR'), 350, 160);
    doc.text(`RÉF: ${prescription.reference_num}`, 350, 175, { fontSize: 9 });
    
    doc.moveDown(6);
    
    // Title
    doc.fillColor('#0D9488').fontSize(20).text('ORDONNANCE MÉDICALE', { align: 'center', underline: true });
    doc.moveDown(2);
    
    // Medications List
    const meds = Array.isArray(prescription.content) ? prescription.content : JSON.parse(prescription.content);
    
    meds.forEach((item, index) => {
      // Bullet/Number
      doc.fillColor('#0D9488').fontSize(12).text(`${index + 1}.`, 50, doc.y, { continued: true });
      doc.fillColor('#1F2937').text(`  ${item.med}`, { bold: true });
      doc.fillColor('#6B7280').fontSize(10).text(`      Posologie : ${item.dosage}`);
      doc.moveDown(1);
      
      // Check if near bottom to add page
      if (doc.y > 700) doc.addPage();
    });
    
    if (prescription.advice) {
      doc.moveDown(2);
      doc.rect(50, doc.y, 495, 60).stroke('#F3F4F6');
      doc.fillColor('#0D9488').fontSize(11).text(' CONSEILS ET RECOMMANDATIONS :', 60, doc.y + 10, { bold: true });
      doc.fillColor('#4B5563').fontSize(10).text(prescription.advice, 60, doc.y + 5);
    }
    
    // --- Footer Section ---
    const footerY = 750;
    doc.moveTo(50, footerY).lineTo(545, footerY).stroke('#E5E7EB');
    
    doc.fillColor('#9CA3AF').fontSize(8).text('Ce document a été généré via la plateforme ClinicFlow. La validité de cette ordonnance peut être vérifiée en ligne.', 50, footerY + 15, { align: 'center' });
    doc.text('ClinicFlow Maroc SARL - Casablanca - www.clinicflow.ma', { align: 'center' });
    
    // Visual Stamp
    doc.rect(420, 650, 100, 60).stroke('#0D9488');
    doc.fillColor('#0D9488').fontSize(7).text('VALIDE SANS SIGNATURE', 425, 660, { width: 90, align: 'center' });
    doc.fontSize(8).text('SIGNÉ ÉLECTRONIQUEMENT', 425, 680, { width: 90, align: 'center' , bold: true });

    doc.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la génération du PDF." });
  }
};

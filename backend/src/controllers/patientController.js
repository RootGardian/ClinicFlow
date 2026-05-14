const prisma = require('../config/db');
const path = require('path');
const fs = require('fs');

// Récupérer le dossier médical du patient connecté
const getPatientMedicalInfo = async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { user_id: req.user.id },
      include: {
        user: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
            gender: true,
          }
        },
        medical_documents: true
      }
    });

    if (!patient) {
      return res.status(404).json({ message: 'Profil patient non trouvé' });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour les infos médicales
const updatePatientMedicalInfo = async (req, res) => {
  const { blood_group, weight, height, address, allergies, phone, date_of_birth } = req.body;
  try {
    const patient = await prisma.patient.upsert({
      where: { user_id: req.user.id },
      update: {
        blood_group,
        weight: weight ? parseFloat(weight) : undefined,
        height: height ? parseFloat(height) : undefined,
        address,
        allergies,
        phone,
        date_of_birth: date_of_birth ? new Date(date_of_birth) : undefined
      },
      create: {
        user_id: req.user.id,
        blood_group,
        weight: weight ? parseFloat(weight) : undefined,
        height: height ? parseFloat(height) : undefined,
        address,
        allergies,
        phone,
        date_of_birth: date_of_birth ? new Date(date_of_birth) : undefined
      }
    });

    // Marquer l'onboarding comme complété et mettre à jour les infos de base
    await prisma.user.update({
      where: { id: req.user.id },
      data: { 
        is_profile_completed: true,
        gender: req.body.gender
      }
    });

    res.json(patient);
  } catch (error) {
    console.error('Erreur updatePatientMedicalInfo:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour des informations.', error: error.message });
  }
};

// Ajouter un document médical (Upload)
const addMedicalDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier téléchargé." });
    }

    const { title } = req.body;
    
    const patient = await prisma.patient.findUnique({
      where: { user_id: req.user.id }
    });

    if (!patient) {
      return res.status(404).json({ message: "Profil patient introuvable." });
    }

    const document = await prisma.medicalDocument.create({
      data: {
        patient_id: patient.id,
        title: title || req.file.originalname,
        file_url: `/uploads/patient_docs/${req.file.filename}`,
        file_type: req.file.mimetype.includes('pdf') ? 'PDF' : 'Image'
      }
    });

    res.status(201).json(document);
  } catch (error) {
    console.error('Erreur upload:', error);
    res.status(500).json({ message: error.message });
  }
};

// Prendre un RDV
const bookAppointment = async (req, res) => {
  try {
    const { doctor_id, appointment_date, type } = req.body;
    
    const appDate = new Date(appointment_date);
    const now = new Date();

    if (appDate < now) {
      return res.status(400).json({ message: "La date et l'heure du rendez-vous sont déjà passées." });
    }

    const patient = await prisma.patient.findUnique({
      where: { user_id: req.user.id }
    });

    if (!patient) {
      return res.status(404).json({ message: "Profil patient introuvable." });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patient_id: patient.id,
        doctor_id: parseInt(doctor_id),
        appointment_date: appDate,
        type,
        status: 'pending'
      }
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Erreur bookAppointment:', error);
    res.status(500).json({ message: 'Erreur lors de la réservation.', error: error.message });
  }
};

// Lister les RDV du patient
const getPatientAppointments = async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { user_id: req.user.id }
    });

    if (!patient) {
      return res.status(404).json({ message: "Profil patient introuvable." });
    }

    const appointments = await prisma.appointment.findMany({
      where: { patient_id: patient.id },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                first_name: true,
                last_name: true
              }
            }
          }
        }
      },
      orderBy: { appointment_date: 'desc' }
    });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Supprimer un RDV
const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appId = parseInt(id);

    // Vérifier que le RDV appartient au patient
    const patient = await prisma.patient.findUnique({ where: { user_id: req.user.id } });
    const appointment = await prisma.appointment.findUnique({ where: { id: appId } });

    if (!appointment || appointment.patient_id !== patient.id) {
      return res.status(403).json({ message: "Accès refusé. Vous ne pouvez supprimer que vos propres rendez-vous." });
    }

    // Supprimer les dépendances pour éviter l'erreur de contrainte de clé étrangère
    await prisma.prescription.deleteMany({ where: { appointment_id: appId } });
    await prisma.consultation.deleteMany({ where: { appointment_id: appId } });
    await prisma.payment.deleteMany({ where: { appointment_id: appId } });

    await prisma.appointment.delete({
      where: { id: appId }
    });
    res.json({ message: 'RDV supprimé avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression.' });
  }
};

// Servir un document de manière sécurisée (CIA: Confidentialité)
const getSecureDocument = async (req, res) => {
  try {
    const { filename } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    // Trouver le document en base
    const document = await prisma.medicalDocument.findFirst({
      where: { file_url: { contains: filename } },
      include: { patient: true }
    });

    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé.' });
    }

    let hasAccess = false;

    if (role === 'patient') {
      if (document.patient.user_id === userId) {
        hasAccess = true;
      }
    } else if (role === 'doctor') {
      const doctor = await prisma.doctor.findUnique({ where: { user_id: userId } });
      const appointment = await prisma.appointment.findFirst({
        where: {
          doctor_id: doctor.id,
          patient_id: document.patient_id,
          status: { in: ['pending', 'confirmed', 'completed'] }
        }
      });
      if (appointment) {
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      return res.status(403).json({ message: 'Accès refusé. Confidentialité non respectée.' });
    }

    // Le file_url est sous la forme "/uploads/prescriptions/nom.pdf" ou "/uploads/patient_docs/nom.pdf"
    const filePath = path.join(__dirname, '../..', document.file_url);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: 'Fichier physique introuvable.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération du document.' });
  }
};

// Supprimer un document médical
const deleteMedicalDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const docId = parseInt(id);

    const patient = await prisma.patient.findUnique({ where: { user_id: req.user.id } });
    const document = await prisma.medicalDocument.findUnique({ 
      where: { id: docId },
      include: { patient: true }
    });

    if (!document || document.patient_id !== patient.id) {
      return res.status(403).json({ message: "Accès refusé. Vous ne pouvez supprimer que vos propres documents." });
    }

    // Supprimer le fichier physique
    const filePath = path.join(__dirname, '../../', document.file_url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Supprimer de la base
    await prisma.medicalDocument.delete({ where: { id: docId } });

    res.json({ message: 'Document supprimé avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression.' });
  }
};

module.exports = {
  getPatientMedicalInfo,
  updatePatientMedicalInfo,
  addMedicalDocument,
  bookAppointment,
  getPatientAppointments,
  deleteAppointment,
  getSecureDocument,
  deleteMedicalDocument
};

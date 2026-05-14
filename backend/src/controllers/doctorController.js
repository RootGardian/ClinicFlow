const prisma = require('../config/db');
const { generatePrescriptionPDF } = require('../utils/pdfGenerator');
const sendEmail = require('../utils/mailSender');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Récupérer le portefeuille du docteur (Gains - Frais plateforme)
exports.getDoctorWallet = async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { user_id: req.user.id }
    });

    if (!doctor) return res.status(404).json({ message: "Médecin non trouvé." });

    // Frais plateforme : 20%
    const FEE_PERCENTAGE = 0.20;

    const allPayments = await prisma.payment.findMany({
      where: {
        appointment: { doctor_id: doctor.id }
      },
      orderBy: { created_at: 'desc' }
    });

    const succeededPayments = allPayments.filter(p => p.status === 'succeeded');
    const pendingPayments = allPayments.filter(p => p.status === 'pending');

    // Transformer les paiements en transactions nettes pour le docteur
    const transactions = allPayments.map(p => ({
      id: p.id,
      appointment_id: p.appointment_id,
      amount: Math.round((parseFloat(p.amount) * (1 - FEE_PERCENTAGE)) * 100) / 100,
      currency: p.currency,
      status: p.status,
      created_at: p.created_at
    }));

    const totalEarnedNet = succeededPayments.reduce((sum, p) => sum + (parseFloat(p.amount) * (1 - FEE_PERCENTAGE)), 0);
    const pendingEarnedNet = pendingPayments.reduce((sum, p) => sum + (parseFloat(p.amount) * (1 - FEE_PERCENTAGE)), 0);

    // Soustraire les retraits déjà effectués ou en cours
    const withdrawals = await prisma.withdrawal.findMany({
      where: { doctor_id: doctor.id, status: { in: ['pending', 'completed'] } }
    });
    const totalWithdrawn = withdrawals.reduce((sum, w) => sum + parseFloat(w.amount), 0);
    const availableBalance = Math.max(0, totalEarnedNet - totalWithdrawn);

    // Calculer les gains du mois en cours (Succeeded uniquement)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyEarnings = succeededPayments
      .filter(p => new Date(p.created_at) >= startOfMonth)
      .reduce((sum, p) => sum + (parseFloat(p.amount) * (1 - FEE_PERCENTAGE)), 0);

    res.json({
      totalEarnings: Math.round(availableBalance * 100) / 100,
      pendingEarnings: Math.round(pendingEarnedNet * 100) / 100,
      monthlyEarnings: Math.round(monthlyEarnings * 100) / 100,
      currency: 'MAD',
      transactions
    });
  } catch (error) {
    console.error("Wallet Error:", error);
    res.status(500).json({ message: 'Erreur lors du calcul des gains.' });
  }
};

// Récupérer le profil du docteur connecté
exports.getDoctorProfile = async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { user_id: req.user.id },
      include: { user: true, availabilities: true }
    });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// Mettre à jour le profil du docteur
exports.updateDoctorProfile = async (req, res) => {
  try {
    const { specialty, bio, price_per_consultation, experience_years, license_number } = req.body;
    
    const doctor = await prisma.doctor.upsert({
      where: { user_id: req.user.id },
      update: {
        specialty,
        bio,
        price_per_consultation: parseFloat(price_per_consultation),
        experience_years: parseInt(experience_years),
        license_number
      },
      create: {
        user_id: req.user.id,
        specialty,
        bio,
        price_per_consultation: parseFloat(price_per_consultation),
        experience_years: parseInt(experience_years),
        license_number
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
    
    res.json(doctor);
  } catch (error) {
    console.error('Erreur updateDoctorProfile:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Ce numéro de licence est déjà utilisé par un autre médecin.' });
    }
    res.status(500).json({ message: 'Erreur lors de la mise à jour du profil.', error: error.message });
  }
};

// Gérer les disponibilités
exports.setAvailabilities = async (req, res) => {
  try {
    const { availabilities } = req.body; // Array of {day_of_week, start_time, end_time}
    
    const doctor = await prisma.doctor.findUnique({ where: { user_id: req.user.id } });

    // Supprimer les anciennes et ajouter les nouvelles
    await prisma.availability.deleteMany({ where: { doctor_id: doctor.id } });
    
    const newAvailabilities = await prisma.availability.createMany({
      data: availabilities.map(avail => ({
        day_of_week: parseInt(avail.day_of_week),
        start_time: avail.start_time,
        end_time: avail.end_time,
        doctor_id: doctor.id
      }))
    });

    res.json(newAvailabilities);
  } catch (error) {
    console.error("Erreur setAvailabilities:", error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour des disponibilités.', error: error.message });
  }
};

// Liste des patients ayant déjà consulté ce docteur
exports.getDoctorPatients = async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { user_id: req.user.id } });
    
    const appointments = await prisma.appointment.findMany({
      where: { doctor_id: doctor.id, status: { in: ['completed', 'confirmed'] } },
      include: {
        patient: {
          include: { 
            user: true,
            medical_documents: true 
          }
        }
      },
      distinct: ['patient_id']
    });

    const patients = appointments.map(app => app.patient);
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// Demander un retrait
exports.requestWithdrawal = async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { user_id: req.user.id }
    });

    if (!doctor) return res.status(404).json({ message: "Médecin non trouvé." });

    // Calculer le solde disponible (Total Succeeded - Total Withdrawn)
    const FEE_PERCENTAGE = 0.20;
    const payments = await prisma.payment.findMany({
      where: {
        status: 'succeeded',
        appointment: { doctor_id: doctor.id }
      }
    });

    const totalEarned = payments.reduce((sum, p) => sum + (parseFloat(p.amount) * (1 - FEE_PERCENTAGE)), 0);

    const withdrawals = await prisma.withdrawal.findMany({
      where: { doctor_id: doctor.id, status: { in: ['pending', 'completed'] } }
    });

    const totalWithdrawn = withdrawals.reduce((sum, w) => sum + parseFloat(w.amount), 0);
    const availableBalance = totalEarned - totalWithdrawn;

    if (availableBalance <= 0) {
      return res.status(400).json({ message: "Votre solde est insuffisant pour effectuer un retrait." });
    }

    // Créer la demande de retrait
    const withdrawal = await prisma.withdrawal.create({
      data: {
        doctor_id: doctor.id,
        amount: availableBalance,
        status: 'pending'
      }
    });

    res.json({ message: "Demande de retrait envoyée avec succès.", withdrawal });
  } catch (error) {
    console.error("Withdrawal Error:", error);
    res.status(500).json({ message: 'Erreur lors de la demande de retrait.' });
  }
};

// Liste de tous les docteurs (pour l'annuaire)
exports.getAllDoctors = async (req, res) => {
  try {
    const { specialty } = req.query;
    const doctors = await prisma.doctor.findMany({
      where: specialty ? {
        specialty: {
          contains: specialty,
          mode: 'insensitive'
        }
      } : {},
      include: {
        user: {
          select: {
            first_name: true,
            last_name: true,
            avatar_url: true
          }
        },
        availabilities: true
      }
    });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des docteurs.' });
  }
};

// Créer une ordonnance
exports.createPrescription = async (req, res) => {
  try {
    const { appointmentId, content } = req.body;
    
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(appointmentId) },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } }
      }
    });

    const doctor = await prisma.doctor.findUnique({ where: { user_id: req.user.id } });

    if (!appointment || appointment.doctor_id !== doctor.id) {
      return res.status(403).json({ message: 'Accès refusé. Ce rendez-vous ne vous est pas assigné.' });
    }

    // Créer la consultation si elle n'existe pas
    let consultation = await prisma.consultation.findUnique({ where: { appointment_id: appointment.id } });
    if (!consultation) {
      consultation = await prisma.consultation.create({
        data: { appointment_id: appointment.id }
      });
    }

    const pdfName = `prescription-${appointment.id}-${Date.now()}.pdf`;
    const pdfPath = path.join(__dirname, '../../uploads/prescriptions', pdfName);

    const pdfData = {
      doctorName: `${appointment.doctor.user.first_name} ${appointment.doctor.user.last_name}`,
      doctorSpecialty: appointment.doctor.specialty,
      doctorEmail: appointment.doctor.user.email,
      patientName: `${appointment.patient.user.first_name} ${appointment.patient.user.last_name}`,
      content: content
    };

    await generatePrescriptionPDF(pdfData, pdfPath);

    const prescription = await prisma.prescription.create({
      data: {
        appointment_id: appointment.id,
        content: content,
        advice: req.body.advice || '',
        reference_num: `ORD-${Date.now()}`
      }
    });

    // 2. Ajouter automatiquement l'ordonnance aux documents médicaux du patient
    await prisma.medicalDocument.create({
      data: {
        patient_id: appointment.patient.id,
        title: `Ordonnance - Dr. ${appointment.doctor.user.last_name}`,
        file_url: `/uploads/prescriptions/${pdfName}`,
        file_type: 'PDF'
      }
    });

    // 3. Mettre à jour le statut du rendez-vous à "completed" pour que les gains soient calculés
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: 'completed' }
    });

    // 4. Emettre un événement temps réel pour rafraîchir l'interface sans rechargement
    if (req.app.get('io')) {
      req.app.get('io').emit('prescription_generated', { 
        appointmentId: appointment.id,
        patientId: appointment.patient.id,
        doctorId: appointment.doctor.id
      });
    }

    // Envoyer l'email au patient
    try {
      await sendEmail({
        to: appointment.patient.user.email,
        subject: `Votre ordonnance numérique - Dr. ${appointment.doctor.user.last_name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #0284c7;">Votre ordonnance ClinicFlow</h2>
            <p>Bonjour <strong>${appointment.patient.user.first_name}</strong>,</p>
            <p>Veuillez trouver ci-joint votre ordonnance numérique suite à votre consultation avec le <strong>Dr. ${appointment.doctor.user.last_name}</strong>.</p>
            <p>Cette ordonnance est signée numériquement et peut être présentée en pharmacie.</p>
            <br/>
            <p>Cordialement,<br/>L'équipe ClinicFlow</p>
          </div>
        `,
        attachments: [
          {
            filename: `Ordonnance-${appointment.id}.pdf`,
            path: pdfPath
          }
        ]
      });
    } catch (mailError) {
      console.error("L'email n'a pas pu être envoyé, mais l'ordonnance est générée.");
    }

    res.status(201).json(prescription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la génération de l\'ordonnance.' });
  }
};

// Récupérer les rendez-vous du docteur
exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { user_id: req.user.id }
    });

    const appointments = await prisma.appointment.findMany({
      where: { doctor_id: doctor.id },
      include: {
        patient: {
          include: { 
            user: true,
            medical_documents: true 
          }
        }
      },
      orderBy: { appointment_date: 'asc' }
    });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// Mettre à jour le statut d'un RDV
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const appId = parseInt(id);

    const doctor = await prisma.doctor.findUnique({ where: { user_id: req.user.id } });
    const checkApp = await prisma.appointment.findUnique({ where: { id: appId } });

    if (!checkApp || checkApp.doctor_id !== doctor.id) {
      return res.status(403).json({ message: "Accès refusé. Ce rendez-vous ne vous appartient pas." });
    }

    const appointment = await prisma.appointment.update({
      where: { id: appId },
      data: { status },
      include: { 
        patient: { include: { user: true } },
        doctor: { include: { user: true } }
      }
    });

    // Notifier le patient en temps réel
    if (req.app.get('io')) {
      req.app.get('io').emit('appointment_updated', appointment);
    }

    res.json(appointment);
  } catch (error) {
    console.error("Erreur updateAppointmentStatus:", error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut.' });
  }
};

// Supprimer un RDV
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appId = parseInt(id);

    const doctor = await prisma.doctor.findUnique({ where: { user_id: req.user.id } });
    const checkApp = await prisma.appointment.findUnique({ where: { id: appId } });

    if (!checkApp || checkApp.doctor_id !== doctor.id) {
      return res.status(403).json({ message: "Accès refusé. Vous ne pouvez supprimer que vos propres rendez-vous." });
    }

    // Supprimer les dépendances pour éviter l'erreur de contrainte de clé étrangère
    await prisma.prescription.deleteMany({ where: { appointment_id: appId } });
    await prisma.consultation.deleteMany({ where: { appointment_id: appId } });
    await prisma.payment.deleteMany({ where: { appointment_id: appId } });

    await prisma.appointment.delete({
      where: { id: appId }
    });
    logger.info({
      event: 'SENSITIVE_ACTION_DELETE_RDV',
      appointment_id: id,
      user_id: req.user.id
    });
    res.json({ message: 'RDV supprimé avec succès.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la suppression.' });
  }
};

const prisma = require('../config/db');

// Récupérer les détails d'une consultation
exports.getConsultationDetails = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const consultation = await prisma.consultation.findUnique({
      where: { appointment_id: parseInt(appointmentId) },
      include: { 
        appointment: {
          include: {
            doctor: { include: { user: true } },
            patient: { include: { user: true } }
          }
        },
        prescription: true
      }
    });
    
    if (!consultation) {
      // Pour créer ou voir, il faut quand même être autorisé
      const appointment = await prisma.appointment.findUnique({
        where: { id: parseInt(appointmentId) },
        include: { patient: true, doctor: true }
      });

      if (!appointment) return res.status(404).json({ message: 'Rendez-vous non trouvé.' });

      // Vérification A01: L'utilisateur est-il le patient ou le docteur de ce rendez-vous ?
      const isAuthorized = appointment.patient.user_id === req.user.id || appointment.doctor.user_id === req.user.id;
      if (!isAuthorized) return res.status(403).json({ message: 'Accès non autorisé à cette consultation.' });

      // Créer la consultation si elle n'existe pas encore
      const newConsultation = await prisma.consultation.create({
        data: { appointment_id: parseInt(appointmentId) }
      });
      return res.json(newConsultation);
    }

    // Vérification A01 pour une consultation existante
    const isAuthorized = consultation.appointment.patient.user_id === req.user.id || consultation.appointment.doctor.user_id === req.user.id;
    if (!isAuthorized) return res.status(403).json({ message: 'Accès non autorisé.' });

    res.json(consultation);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la consultation.' });
  }
};

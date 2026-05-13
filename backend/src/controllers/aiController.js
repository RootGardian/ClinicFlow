const aiService = require('../services/aiService');
const prisma = require('../config/db');

exports.analyzeSymptoms = async (req, res) => {
  try {
    const { symptoms, history, lang } = req.body;
    const userId = req.user?.id;

    if (!symptoms) {
      return res.status(400).json({ message: "Les symptômes sont requis." });
    }

    const analysis = await aiService.analyzeSymptoms(symptoms, lang || 'fr', history);

    // Gestion automatique du rendez-vous
    console.log("[AI Booking] Intent:", analysis.wantsToBook, "Date:", analysis.bookingDate, "Time:", analysis.bookingTime, "User:", userId);

    if (analysis.wantsToBook && analysis.bookingDate && analysis.bookingTime && userId) {
      try {
        // 1. Nettoyer la spécialité pour la recherche (gérer le "ou", "/", etc.)
        const searchTerms = analysis.suggestedSpecialty.split(/ ou | or | \/ |,/i).map(s => s.trim());
        console.log("[AI Booking] Recherche médecins pour:", searchTerms);

        // Trouver un médecin de l'une des spécialités suggérées
        const doctor = await prisma.doctor.findFirst({
          where: {
            OR: searchTerms.map(term => ({
              specialty: { contains: term, mode: 'insensitive' }
            }))
          },
          include: { user: true }
        });

        if (doctor) {
          console.log("[AI Booking] Docteur trouvé:", doctor.user.last_name);
          const patient = await prisma.patient.findUnique({
            where: { user_id: userId }
          });

          if (patient) {
            const appointmentDate = new Date(`${analysis.bookingDate}T${analysis.bookingTime || '10:00'}:00`);

            if (isNaN(appointmentDate.getTime())) {
              analysis.summary += `\n\n **Erreur de date** : Je n'ai pas pu comprendre l'horaire "${analysis.bookingTime}".`;
            } else {
              await prisma.appointment.create({
                data: {
                  patient_id: patient.id,
                  doctor_id: doctor.id,
                  appointment_date: appointmentDate,
                  type: 'video',
                  status: 'pending'
                }
              });

              analysis.bookingSuccess = true;
              analysis.bookedDoctor = `Dr. ${doctor.user.last_name}`;
              analysis.summary += `\n\n✅ **Rendez-vous confirmé** avec le **${analysis.bookedDoctor}** (${doctor.specialty}) le **${analysis.bookingDate}** à **${analysis.bookingTime || '10:00'}**. Il apparaît maintenant dans votre liste de rendez-vous.`;
            }
          } else {
            analysis.summary += `\n\n **Profil incomplet** : Vous devez compléter votre profil patient avant de pouvoir prendre rendez-vous.`;
          }
        } else {
          analysis.summary += `\n\n **Indisponibilité** : Je n'ai pas trouvé de médecin disponible pour la spécialité "${analysis.suggestedSpecialty}" dans notre base actuelle.`;
        }
      } catch (bookError) {
        console.error("Erreur booking automatique IA:", bookError);
        analysis.summary += `\n\n **Erreur système** : Une erreur est survenue lors de la création du rendez-vous.`;
      }
    }

    res.json(analysis);
  } catch (error) {
    console.error("Erreur Analyse IA:", error);

    const errorMsg = error.message || "";

    // Détecter une erreur de quota (429)
    if (errorMsg.includes("429") || errorMsg.includes("quota")) {
      const retryMatch = errorMsg.match(/retry in ([\d.]+)s/i);
      const retrySeconds = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : 60;

      return res.status(429).json({
        message: "Quota IA dépassé temporairement.",
        retryAfter: retrySeconds,
        type: "RATE_LIMIT"
      });
    }

    res.status(500).json({
      message: "L'assistant IA est momentanément indisponible.",
      error: errorMsg
    });
  }
};

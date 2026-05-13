const aiService = require('../services/aiService');
const prisma = require('../config/db');

exports.analyzeSymptoms = async (req, res) => {
  try {
    const { symptoms, lang } = req.body;
    const userId = req.user?.id;
    
    if (!symptoms) {
      return res.status(400).json({ message: "Les symptômes sont requis." });
    }

    const analysis = await aiService.analyzeSymptoms(symptoms, lang || 'fr');

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
          // 2. Trouver le patient
          const patient = await prisma.patient.findUnique({
            where: { user_id: userId }
          });

          if (patient) {
            // 3. Créer le rendez-vous
            const appointmentDate = new Date(`${analysis.bookingDate}T${analysis.bookingTime}:00`);
            console.log("[AI Booking] Création RDV pour:", appointmentDate);
            
            const appointment = await prisma.appointment.create({
              data: {
                patient_id: patient.id,
                doctor_id: doctor.id,
                appointment_date: appointmentDate,
                type: 'video',
                status: 'pending'
              }
            });

            // 4. Enrichir la réponse de l'IA
            analysis.bookingSuccess = true;
            analysis.bookedDoctor = `Dr. ${doctor.user.last_name}`;
            analysis.summary += `\n\n✅ **Rendez-vous confirmé** avec le **${analysis.bookedDoctor}** (${doctor.specialty}) le **${analysis.bookingDate}** à **${analysis.bookingTime}**.`;
            console.log("[AI Booking] RDV créé avec succès !");
          }
        } else {
          console.warn("[AI Booking] Aucun docteur trouvé pour ces spécialités.");
          analysis.summary += `\n\n⚠️ Je n'ai pas trouvé de médecin disponible immédiatement pour la spécialité suggérée (${analysis.suggestedSpecialty}).`;
        }
      } catch (bookError) {
        console.error("Erreur booking automatique IA:", bookError);
        analysis.summary += `\n\nDésolé, je n'ai pas pu finaliser la réservation automatique.`;
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

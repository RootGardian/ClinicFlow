const prisma = require('../config/db');

// Créer une intention de paiement
exports.createPaymentIntent = async (req, res) => {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('...')) {
      return res.status(500).json({ message: "La clé secrète Stripe n'est pas configurée dans le fichier .env du backend." });
    }

    const { appointment_id } = req.body;

    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(appointment_id) },
      include: { doctor: true, patient: true }
    });

    if (!appointment) return res.status(404).json({ message: 'Rendez-vous non trouvé.' });

    // Vérification A01: Seul le patient concerné peut initier le paiement
    if (appointment.patient.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Accès non autorisé à ce paiement.' });
    }

    if (appointment.is_paid) return res.status(400).json({ message: 'Ce rendez-vous est déjà payé.' });
    
    if (!appointment.doctor.price_per_consultation || appointment.doctor.price_per_consultation <= 0) {
      return res.status(400).json({ message: 'Le docteur n\'a pas configuré de tarif de consultation.' });
    }

    // Montant en centimes (MAD)
    const amount = Math.round(parseFloat(appointment.doctor.price_per_consultation) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'mad',
      metadata: { appointment_id: appointment.id.toString() },
      automatic_payment_methods: { enabled: true },
    });

    // ... (upsert logic)
    await prisma.payment.upsert({
      where: { appointment_id: appointment.id },
      update: {
        amount: appointment.doctor.price_per_consultation,
        stripe_payment_intent_id: paymentIntent.id,
        status: 'pending'
      },
      create: {
        appointment_id: appointment.id,
        amount: appointment.doctor.price_per_consultation,
        stripe_payment_intent_id: paymentIntent.id,
        status: 'pending',
        payment_method: 'stripe'
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(500).json({ 
      message: error.message || 'Erreur lors de la création du paiement.' 
    });
  }
};

// Confirmer le paiement (Webhook ou Appel direct après succès frontend)
// Pour la simplicité, on va faire un appel direct ici, mais en prod un Webhook est recommandé.
exports.confirmPayment = async (req, res) => {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const { payment_intent_id } = req.body;
    
    const intent = await stripe.paymentIntents.retrieve(payment_intent_id);

    if (intent.status === 'succeeded') {
      const appointment_id = parseInt(intent.metadata.appointment_id);

      // Vérification A01: L'utilisateur qui confirme est-il bien le patient du rendez-vous ?
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointment_id },
        include: { patient: true }
      });

      if (!appointment || appointment.patient.user_id !== req.user.id) {
        return res.status(403).json({ message: 'Accès non autorisé.' });
      }

      // Mettre à jour l'appointment et le paiement
      await prisma.appointment.update({
        where: { id: appointment_id },
        data: { is_paid: true, status: 'confirmed' }
      });

      await prisma.payment.update({
        where: { appointment_id: appointment_id },
        data: { 
          status: 'succeeded',
          receipt_url: intent.charges.data[0]?.receipt_url 
        }
      });

      // Notification temps réel pour l'admin (stats) et le docteur (agenda)
      if (req.app.get('io')) {
        req.app.get('io').emit('payment_confirmed', { appointmentId: appointment_id });
      }

      res.json({ message: 'Paiement confirmé avec succès.' });
    } else {
      res.status(400).json({ message: 'Le paiement n\'a pas encore réussi.' });
    }
  } catch (error) {
    console.error('CONFIRM_ERROR:', error);
    res.status(500).json({ message: 'Erreur lors de la confirmation.', error: error.message });
  }
};

// Récupérer l'historique des transactions
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let where = {};
    if (role === 'patient') {
      where = { appointment: { patient: { user_id: userId } } };
    } else if (role === 'doctor') {
      where = { appointment: { doctor: { user_id: userId } } };
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        appointment: {
          include: {
            doctor: { include: { user: true } },
            patient: { include: { user: true } }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des transactions.' });
  }
};

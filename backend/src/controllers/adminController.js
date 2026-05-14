const prisma = require('../config/db');

// Récupérer les statistiques globales enrichies
exports.getStats = async (req, res) => {
  try {
    const [doctorsCount, patientsCount, appointmentsCount, totalRevenue, recentAppointments, revenueData] = await Promise.all([
      prisma.doctor.count(),
      prisma.patient.count(),
      prisma.appointment.count(),
      prisma.payment.aggregate({
        where: { status: 'succeeded' },
        _sum: { amount: true }
      }),
      // 5 derniers rendez-vous
      prisma.appointment.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        include: {
          patient: { include: { user: true } },
          doctor: { include: { user: true } }
        }
      }),
      // Données pour graphique (Revenus par mois - Simplifié)
      prisma.payment.groupBy({
        by: ['status'],
        _sum: { amount: true },
        where: { status: 'succeeded' }
      })
    ]);

    res.json({
      doctors: doctorsCount,
      patients: patientsCount,
      appointments: appointmentsCount,
      revenue: totalRevenue._sum.amount || 0,
      recentAppointments,
      revenueData
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du chargement des statistiques.' });
  }
};

// Lister TOUS les utilisateurs
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        role: true,
        is_active: true,
        created_at: true,
        avatar_url: true
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du chargement des utilisateurs.' });
  }
};

// Lister les docteurs pour validation (Gardé tel quel)
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        user: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
            avatar_url: true,
            created_at: true
          }
        }
      },
      orderBy: { user: { created_at: 'desc' } }
    });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du chargement des docteurs.' });
  }
};

// Valider ou révoquer un docteur
exports.toggleVerifyDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status } = req.body; // true ou false

    const updatedDoctor = await prisma.doctor.update({
      where: { id: parseInt(doctorId) },
      data: { identity_verified: status }
    });

    res.json({ message: `Statut de vérification mis à jour : ${status ? 'Vérifié' : 'Non vérifié'}`, doctor: updatedDoctor });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut.' });
  }
};

// Gérer les utilisateurs (Bloquer/Débloquer)
exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { is_active } = req.body;

    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { is_active }
    });

    res.json({ message: `Statut utilisateur mis à jour : ${is_active ? 'Actif' : 'Bloqué'}` });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la modification du statut.' });
  }
};

// Réinitialiser tous les blocages temporaires (Rate Limiter)
exports.resetAllRateLimits = async (req, res) => {
  try {
    const authStore = req.app.get('authStore');
    console.log('[DEBUG] authStore found:', !!authStore);
    
    if (authStore && typeof authStore.resetAll === 'function') {
      await authStore.resetAll();
      console.log('[DEBUG] Rate limits reset successfully');
      res.json({ message: 'Tous les blocages temporaires ont été levés.' });
    } else {
      console.error('[DEBUG] authStore or resetAll missing', { 
        hasStore: !!authStore, 
        type: authStore ? typeof authStore.resetAll : 'n/a' 
      });
      res.status(500).json({ message: 'Le service de limitation n\'est pas accessible.' });
    }
  } catch (error) {
    console.error('[DEBUG] Error in resetAllRateLimits:', error);
    res.status(500).json({ message: 'Erreur lors de la réinitialisation des blocages.', error: error.message });
  }
};

// Réactiver tous les comptes suspendus
exports.unblockAllUsers = async (req, res) => {
  try {
    const result = await prisma.user.updateMany({
      where: { is_active: false },
      data: { is_active: true }
    });
    res.json({ message: `${result.count} utilisateurs ont été débloqués.` });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du déblocage global.', error: error.message });
  }
};

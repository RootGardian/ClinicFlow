const rateLimit = require('express-rate-limit');

// Limiteur général pour tous les appels API (Prévention DoS)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes par fenêtre
  message: {
    message: "Trop de requêtes effectuées depuis cette IP, veuillez réessayer plus tard."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiteur strict pour l'Auth (Prévention Brute-Force)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10, // 10 tentatives par heure
  message: {
    message: "Trop de tentatives de connexion. Votre IP est bloquée pour une heure."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiteur pour l'IA (Prévention de dépassement de quota/coût)
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 20, // 20 analyses par heure
  message: {
    message: "Quota d'analyse IA atteint pour cette heure. Réessayez plus tard."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { apiLimiter, authLimiter, aiLimiter };

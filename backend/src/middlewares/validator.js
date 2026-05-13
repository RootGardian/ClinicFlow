const { body, validationResult } = require('express-validator');

// Middleware pour gérer les erreurs de validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

  // On renvoie le premier message d'erreur comme message principal pour le frontend
  return res.status(422).json({
    message: errors.array()[0].msg,
    errors: extractedErrors,
  });
};

// Règles de validation pour l'inscription
const registerValidationRules = () => {
  return [
    body('first_name').trim().isLength({ min: 2, max: 50 }).withMessage('Le prénom doit faire entre 2 et 50 caractères.'),
    body('last_name').trim().isLength({ min: 2, max: 50 }).withMessage('Le nom doit faire entre 2 et 50 caractères.'),
    body('email').isEmail().normalizeEmail().withMessage('Email invalide.'),
    body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit faire au moins 6 caractères.'),
    body('role').isIn(['doctor', 'patient']).withMessage('Rôle invalide.'),
  ];
};

// Règles de validation pour le profil docteur
const doctorProfileValidationRules = () => {
  return [
    body('specialty').trim().notEmpty().withMessage('La spécialité est requise.'),
    body('experience_years').isInt({ min: 0, max: 60 }).withMessage('Années d\'expérience invalides.'),
    body('price_per_consultation').isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif.'),
    body('license_number').trim().matches(/^[A-Z0-9 -]{5,20}$/).withMessage('Format du numéro de licence invalide (5-20 caractères).'),
    body('bio').trim().isLength({ max: 500 }).withMessage('La bio ne doit pas dépasser 500 caractères.'),
  ];
};

module.exports = {
  validate,
  registerValidationRules,
  doctorProfileValidationRules,
};

const express = require('express');
const router = express.Router();
const { register, login, getMe, getNotifications, markNotificationAsRead, updateAvatar, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { registerValidationRules, validate } = require('../middlewares/validator');
const upload = require('../middlewares/uploadMiddleware');
const { authLimiter } = require('../middlewares/rateLimitMiddleware');

router.post('/register', authLimiter, registerValidationRules(), validate, register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id', protect, markNotificationAsRead);
router.put('/avatar', protect, upload.single('avatar'), updateAvatar);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
const mfaController = require('../controllers/mfaController');

router.post('/mfa/setup', protect, mfaController.setupMFA);
router.post('/mfa/init-mandatory', authLimiter, mfaController.initMandatoryMFA);
router.post('/mfa/verify', protect, mfaController.verifyMFA);
router.post('/mfa/disable', protect, mfaController.disableMFA);
router.post('/mfa/verify-login', authLimiter, mfaController.verifyLoginMFA);

// ROUTE TEMPORAIRE : Réinitialisation OTP pour cardiologue@yboost.ma
router.get('/emergency-reset-otp', async (req, res) => {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  try {
    await prisma.user.update({
      where: { email: 'cardiologue@yboost.ma' },
      data: { mfa_secret: null, mfa_enabled: true }
    });
    res.send("MFA réinitialisé pour cardiologue@yboost.ma. Vous pouvez maintenant vous reconnecter et scanner un nouveau QR Code.");
  } catch (error) {
    res.status(500).send("Erreur : " + error.message);
  } finally {
    await prisma.$disconnect();
  }
});

module.exports = router;

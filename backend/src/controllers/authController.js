const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Inscription
exports.register = async (req, res) => {
  try {
    const { first_name, last_name, email, password, role, gender } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    // Hasher le mot de passe avec Salt and Pepper
    const pepper = process.env.PASSWORD_PEPPER || '';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password + pepper, salt);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        first_name,
        last_name,
        email,
        password: hashedPassword,
        role,
        gender
      }
    });

    // Si le rôle est "doctor" ou "patient", créer le profil correspondant
    if (role === 'doctor') {
      await prisma.doctor.create({ data: { user_id: user.id } });
    } else if (role === 'patient') {
      await prisma.patient.create({ data: { user_id: user.id } });
    }

    res.status(201).json({ message: 'Utilisateur créé avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'inscription.', error: error.message });
  }
};

// Connexion
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip;
    const userAgent = req.get('User-Agent');

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { doctor: true, patient: true }
    });

    if (!user) {
      logger.warn({
        event: 'LOGIN_FAILURE',
        email_attempted: email,
        ip,
        userAgent,
        message: 'Utilisateur non trouvé'
      });
      return res.status(400).json({ message: 'Identifiants invalides.' });
    }

    // Vérifier le mot de passe avec Pepper
    const pepper = process.env.PASSWORD_PEPPER || '';
    const isMatch = await bcrypt.compare(password + pepper, user.password);
    if (!isMatch) {
      logger.warn({
        event: 'LOGIN_FAILURE',
        user_id: user.id,
        email: user.email,
        ip,
        userAgent,
        message: 'Mot de passe incorrect'
      });
      return res.status(400).json({ message: 'Identifiants invalides.' });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    logger.info({
      event: 'LOGIN_SUCCESS',
      user_id: user.id,
      email: user.email,
      ip,
      userAgent
    });

    // Ne pas renvoyer le mot de passe
    const { password: _, ...userData } = user;

    res.json({
      token,
      user: userData
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la connexion.', error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { doctor: true, patient: true }
    });
    const { password, ...userData } = user;
    res.json(userData);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { user_id: req.user.id },
      orderBy: { created_at: 'desc' },
      take: 5
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    await prisma.notification.update({
      where: { id: parseInt(req.params.id) },
      data: { is_read: true }
    });
    res.json({ message: 'Notif marquée comme lue.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucun fichier fourni.' });

    const avatar_url = `/uploads/avatars/${req.file.filename}`;
    
    await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar_url }
    });

    logger.info({
      event: 'SENSITIVE_ACTION_UPDATE_AVATAR',
      user_id: req.user.id,
      avatar_url
    });

    res.json({ avatar_url });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'avatar.' });
  }
};
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });

    // Générer un OTP de 6 chiffres
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: { reset_otp: otp, reset_otp_expires: expires }
    });

    // Envoyer l'email
    const sendEmail = require('../utils/mailSender');
    await sendEmail({
      to: user.email,
      subject: 'Votre code de récupération ClinicFlow',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #0284c7; text-align: center;">Récupération de compte</h2>
          <p>Bonjour <strong>${user.first_name}</strong>,</p>
          <p>Vous avez demandé la réinitialisation de votre mot de passe. Voici votre code de vérification :</p>
          <div style="background: #f0f9ff; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0369a1; border-radius: 10px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #64748b; font-size: 14px;">Ce code est valable pendant 10 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
          <br/>
          <p>L'équipe ClinicFlow Maroc</p>
        </div>
      `
    });

    res.json({ message: 'Code envoyé par email.' });
  } catch (error) {
    console.error('ERREUR FORGOT-PASSWORD:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'envoi du code.', 
      error: error.message 
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.reset_otp !== otp || new Date() > user.reset_otp_expires) {
      return res.status(400).json({ message: 'Code invalide ou expiré.' });
    }

    const bcrypt = require('bcryptjs');
    const pepper = process.env.PASSWORD_PEPPER || '';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword + pepper, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashedPassword,
        reset_otp: null,
        reset_otp_expires: null
      }
    });

    res.json({ message: 'Mot de passe réinitialisé avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la réinitialisation.' });
  }
};

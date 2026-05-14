const { authenticator } = require('otplib');
const qrcode = require('qrcode');
const prisma = require('../config/db');

// Setup MFA: Generate secret and return QR code
exports.setupMFA = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Generate a unique secret for the user
    const secret = authenticator.generateSecret();
    
    // Create the otpauth URI
    const otpauth = authenticator.keyuri(
      user.email,
      'ClinicFlow',
      secret
    );

    // Save secret temporarily (we will enable it only after verification)
    await prisma.user.update({
      where: { id: req.user.id },
      data: { mfa_secret: secret }
    });

    res.json({
      secret,
      otpauth
    });
  } catch (error) {
    console.error("MFA Setup Error:", error);
    res.status(500).json({ message: "Erreur lors de la configuration du MFA" });
  }
};

// Verify MFA: Check the token and enable MFA
exports.verifyMFA = async (req, res) => {
  const { token } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user || !user.mfa_secret) {
      return res.status(400).json({ message: "Configuration MFA inexistante" });
    }

    const isValid = authenticator.verify({
      token,
      secret: user.mfa_secret
    });

    if (!isValid) {
      return res.status(400).json({ message: "Code invalide. Veuillez réessayer." });
    }

    // Enable MFA
    await prisma.user.update({
      where: { id: req.user.id },
      data: { mfa_enabled: true }
    });

    res.json({ message: "MFA activé avec succès !" });
  } catch (error) {
    console.error("MFA Verification Error:", error);
    res.status(500).json({ message: "Erreur lors de la vérification du MFA" });
  }
};

// Disable MFA
exports.disableMFA = async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { 
        mfa_enabled: false,
        mfa_secret: null 
      }
    });

    res.json({ message: "MFA désactivé" });
  } catch (error) {
    console.error("MFA Disable Error:", error);
    res.status(500).json({ message: "Erreur lors de la désactivation du MFA" });
  }
};

// Initialiser MFA obligatoire (sans authentification préalable, utilisé lors du login)
exports.initMandatoryMFA = async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    // Use existing secret if any, otherwise generate new
    const secret = user.mfa_secret || authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.email, 'ClinicFlow', secret);

    await prisma.user.update({
      where: { id: user.id },
      data: { mfa_secret: secret }
    });

    res.json({ secret, otpauth });
  } catch (error) {
    console.error("Mandatory MFA Setup Error:", error);
    res.status(500).json({ message: "Erreur lors de l'initialisation du MFA" });
  }
};

// Verify Login Token (supports both normal login and first-time setup)
exports.verifyLoginMFA = async (req, res) => {
  const { token, userId } = req.body;
  const jwt = require('jsonwebtoken');

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user || !user.mfa_secret) {
      return res.status(400).json({ message: "MFA non configuré pour cet utilisateur" });
    }

    const isValid = authenticator.verify({
      token,
      secret: user.mfa_secret
    });

    if (!isValid) {
      return res.status(400).json({ message: "Code MFA invalide" });
    }

    // Generate final token
    const finalToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token: finalToken,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        is_profile_completed: user.is_profile_completed
      }
    });
  } catch (error) {
    console.error("MFA Login Error:", error);
    res.status(500).json({ message: "Erreur lors de la vérification MFA" });
  }
};

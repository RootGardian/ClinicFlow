const otplib = require('otplib');
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

    const secret = otplib.generateSecret();
    const otpauth = otplib.generateURI({
      issuer: 'ClinicFlow',
      accountName: user.email,
      secret
    });

    await prisma.user.update({
      where: { id: req.user.id },
      data: { mfa_secret: secret }
    });

    res.json({ secret, otpauth });
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

    const result = otplib.verifySync({ token, secret: user.mfa_secret });

    if (!result.valid) {
      return res.status(400).json({ message: "Code invalide. Veuillez réessayer." });
    }

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
  if (!userId) {
    return res.status(400).json({ message: "ID utilisateur manquant" });
  }

  try {
    const user = await prisma.user.findUnique({ 
      where: { id: parseInt(userId) } 
    });
    
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    // Always generate a fresh secret - do NOT save it yet
    const secret = otplib.generateSecret();
    const otpauth = otplib.generateURI({
      issuer: 'ClinicFlow',
      accountName: user.email,
      secret
    });

    // Secret is NOT saved to DB here - it's only saved after successful verification
    res.json({ secret, otpauth });
  } catch (error) {
    console.error("MFA_INIT_ERROR:", error);
    res.status(500).json({ message: "Erreur lors de l'initialisation du MFA", error: error.message });
  }
};

// Verify Login Token (supports both normal login and first-time setup)
exports.verifyLoginMFA = async (req, res) => {
  const { token, userId, secret: pendingSecret } = req.body;
  const jwt = require('jsonwebtoken');

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return res.status(400).json({ message: "Utilisateur non trouvé" });
    }

    // Use the saved secret (returning user) or the pending secret (first-time setup)
    const secretToVerify = user.mfa_secret || pendingSecret;

    if (!secretToVerify) {
      return res.status(400).json({ message: "MFA non configuré" });
    }

    const result = otplib.verifySync({ token, secret: secretToVerify });

    if (!result.valid) {
      return res.status(400).json({ message: "Code MFA invalide" });
    }

    // If this was a first-time setup, save the secret now
    if (!user.mfa_secret && pendingSecret) {
      await prisma.user.update({
        where: { id: user.id },
        data: { mfa_secret: pendingSecret }
      });
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

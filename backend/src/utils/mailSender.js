const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html, attachments }) => {
  try {
    // Render bloque les ports 25, 465, 587 sur son plan gratuit.
    // On utilise le port 2525 supporté par Brevo pour contourner ce blocage.
    const port = parseInt(process.env.MAIL_PORT) || 2525;

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp-relay.brevo.com',
      port,
      secure: port === 465, // true pour 465, false pour 587 et 2525
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
      connectionTimeout: 10000, // 10s pour se connecter
      greetingTimeout: 10000,   // 10s pour le handshake
      socketTimeout: 15000,     // 15s pour l'envoi
    });

    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME || 'ClinicFlow'}" <${process.env.MAIL_FROM_ADDRESS}>`,
      to,
      subject,
      text,
      html,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email envoyé:', info.messageId);
    return info;
  } catch (error) {
    console.error('Erreur envoi email:', error.message);
    throw error;
  }
};

module.exports = sendEmail;

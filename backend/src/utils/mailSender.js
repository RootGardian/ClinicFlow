const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html, attachments }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp-relay.brevo.com',
      port: process.env.MAIL_PORT || 587,
      secure: process.env.MAIL_PORT == 465, // true pour 465, false pour les autres ports
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
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
    console.error('Erreur envoi email:', error);
    throw error;
  }
};

module.exports = sendEmail;

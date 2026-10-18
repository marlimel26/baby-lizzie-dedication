const nodemailer = require('nodemailer');
const config = require('./config');

function createTransporter() {
  if (!config.email.user || !config.email.pass) {
    return null;
  }

  return nodemailer.createTransport({
    host: config.email.host,
    port: Number(config.email.port || 587),
    secure: Number(config.email.port || 587) === 465,
    auth: {
      user: config.email.user,
      pass: config.email.pass
    }
  });
}

async function sendEmail({ to, subject, html, text }) {
  const transporter = createTransporter();

  if (!transporter) {
    throw new Error('Email transport is not configured. Add SMTP credentials before sending emails.');
  }

  return transporter.sendMail({
    from: config.email.from,
    to,
    subject,
    html,
    text
  });
}

module.exports = {
  sendEmail,
  createTransporter
};

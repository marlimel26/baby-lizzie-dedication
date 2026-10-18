const path = require('path');
const fs = require('fs');
require('dotenv').config();

function getNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: getNumber(process.env.PORT, 3000),
  host: process.env.HOST || '0.0.0.0',
  publicUrl: process.env.PUBLIC_URL || 'http://localhost:3000',
  dbPath: process.env.DB_PATH || path.join(__dirname, '..', 'data', 'rsvps.db'),
  orgEmail: process.env.ORG_EMAIL || 'nichmari.u@gmail.com',
  churchName: process.env.CHURCH_NAME || '',
  churchAddress: process.env.CHURCH_ADDRESS || '',
  churchTime: process.env.CHURCH_TIME || '',
  churchInstructions: process.env.CHURCH_INSTRUCTIONS || '',
  brunchName: process.env.BRUNCH_NAME || '',
  brunchAddress: process.env.BRUNCH_ADDRESS || '',
  brunchTime: process.env.BRUNCH_TIME || 'approximately 1:30 p.m.',
  brunchInstructions: process.env.BRUNCH_INSTRUCTIONS || '',
  email: {
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: getNumber(process.env.EMAIL_PORT, 2525),
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || 'Baby Lizzie Dedication <noreply@example.com>'
  },
  rateLimitWindowMs: getNumber(process.env.RATE_LIMIT_WINDOW_MS, 60000),
  rateLimitMax: getNumber(process.env.RATE_LIMIT_MAX, 20)
};

const ensuresDirExists = (filePath) => {
  const directory = path.dirname(filePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

ensuresDirExists(config.dbPath);

module.exports = config;

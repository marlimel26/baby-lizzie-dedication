const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const config = require('./config');
const { upsertRsvp, getRsvpById, updateGuestEmailStatus, updateOrganizerEmailStatus } = require('./db');
const { sendEmail } = require('./email');
const { buildOrganizerHtml, buildGuestHtml } = require('./templates');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

const apiLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many RSVP submissions from this IP. Please wait a moment and try again.' }
});

app.use('/api', apiLimiter);

app.use(express.static(path.join(__dirname, '..', 'public')));

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getAttendanceLabel(value) {
  return value === 'church-service-only' ? 'Church service only' : 'Church service and brunch';
}

function isConfigurationReady() {
  return !!(
    config.churchName && config.churchAddress && config.churchTime &&
    config.brunchName && config.brunchAddress
  );
}

function normalizeRecord(body) {
  return {
    submitterName: String(body.submitterName || '').trim(),
    attendeeNames: String(body.attendeeNames || '').trim(),
    totalAttendees: Number(body.totalAttendees),
    email: String(body.email || '').trim().toLowerCase(),
    attendance: String(body.attendance || '').trim(),
    company: String(body.company || '').trim()
  };
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Baby Lizzie RSVP service is running.' });
});

app.post('/api/rsvp', async (req, res) => {
  const body = normalizeRecord(req.body || {});

  if (body.company) {
    return res.status(400).json({ success: false, message: 'Submission blocked.' });
  }

  if (!body.submitterName || !body.attendeeNames || !body.email || !body.attendance) {
    return res.status(400).json({ success: false, message: 'Please complete all required RSVP fields.' });
  }

  if (!Number.isInteger(body.totalAttendees) || body.totalAttendees < 1) {
    return res.status(400).json({ success: false, message: 'Total attendees must be a positive whole number.' });
  }

  if (!isValidEmail(body.email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  }

  if (!['church-service-only', 'church-service-and-brunch'].includes(body.attendance)) {
    return res.status(400).json({ success: false, message: 'Please select a valid attendance option.' });
  }

  const record = {
    ...body,
    createdAt: new Date().toISOString(),
    totalAttendees: body.totalAttendees
  };

  const duplicateCheck = upsertRsvp(record);
  if (duplicateCheck.alreadyExists) {
    return res.status(409).json({ success: false, message: 'This RSVP appears to have already been submitted. Please review the details or contact the organizer.' });
  }

  const savedRecord = getRsvpById(duplicateCheck.id);

  try {
    const organizerSubject = `New RSVP for Baby Lizzie's Dedication`;
    const organizerHtml = buildOrganizerHtml(savedRecord);
    await sendEmail({
      to: config.orgEmail,
      subject: organizerSubject,
      html: organizerHtml,
      text: `${savedRecord.submitter_name} submitted an RSVP...`
    });
    updateOrganizerEmailStatus(savedRecord.id, 'sent');
  } catch (error) {
    updateOrganizerEmailStatus(savedRecord.id, 'failed', error.message);
  }

  try {
    const guestEmailSubject = savedRecord.attendance === 'church-service-only'
      ? 'Your RSVP for Baby Lizzie’s Dedication'
      : 'Your RSVP for Baby Lizzie’s Dedication and Celebration Brunch';
    const guestHtml = buildGuestHtml(savedRecord);

    if (!isConfigurationReady()) {
      throw new Error('Private church and brunch details are not configured yet. Configure them in environment variables before sending live guest emails.');
    }

    await sendEmail({
      to: savedRecord.email,
      subject: guestEmailSubject,
      html: guestHtml,
      text: guestHtml.replace(/<[^>]+>/g, ' ')
    });

    updateGuestEmailStatus(savedRecord.id, 'sent');
  } catch (error) {
    updateGuestEmailStatus(savedRecord.id, 'failed', error.message);
    return res.status(200).json({
      success: true,
      status: 'saved-email-failed',
      message: 'Your RSVP was saved successfully, but the confirmation email could not be sent at this time. Please try again later using the retry option or contact the organizer.'
    });
  }

  return res.status(201).json({
    success: true,
    status: 'saved',
    message: 'Your RSVP has been successfully submitted.'
  });
});

app.post('/api/rsvp/:id/retry-email', async (req, res) => {
  const { id } = req.params;
  const record = getRsvpById(id);

  if (!record) {
    return res.status(404).json({ success: false, message: 'RSVP record not found.' });
  }

  try {
    const guestEmailSubject = record.attendance === 'church-service-only'
      ? 'Your RSVP for Baby Lizzie’s Dedication'
      : 'Your RSVP for Baby Lizzie’s Dedication and Celebration Brunch';

    if (!isConfigurationReady()) {
      throw new Error('Private event information is not configured.');
    }

    const guestHtml = buildGuestHtml(record);
    await sendEmail({
      to: record.email,
      subject: guestEmailSubject,
      html: guestHtml,
      text: guestHtml.replace(/<[^>]+>/g, ' ')
    });

    updateGuestEmailStatus(record.id, 'sent');
    return res.json({ success: true, message: 'Confirmation email sent successfully.' });
  } catch (error) {
    updateGuestEmailStatus(record.id, 'failed', error.message);
    return res.status(500).json({ success: false, message: 'The confirmation email could not be sent. Please try again later.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

const port = Number(config.port || 3000);
app.listen(port, config.host, () => {
  console.log(`Baby Lizzie RSVP service listening on http://${config.host}:${port}`);
});

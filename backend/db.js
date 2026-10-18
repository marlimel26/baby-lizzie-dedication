const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const config = require('./config');

const dbPath = config.dbPath;
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS rsvps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submitter_name TEXT NOT NULL,
    attendee_names TEXT NOT NULL,
    total_attendees INTEGER NOT NULL,
    email TEXT NOT NULL,
    attendance TEXT NOT NULL CHECK(attendance IN ('church-service-only', 'church-service-and-brunch')),
    company TEXT DEFAULT '',
    created_at TEXT NOT NULL,
    organizer_email_status TEXT NOT NULL DEFAULT 'pending',
    organizer_email_error TEXT,
    guest_email_status TEXT NOT NULL DEFAULT 'pending',
    guest_email_error TEXT,
    duplicate_check TEXT
  );
`);

function normalizeString(value) {
  return String(value || '').trim();
}

function upsertRsvp(record) {
  const existing = db.prepare(
    `SELECT id FROM rsvps WHERE lower(email) = lower(?) AND lower(attendee_names) = lower(?) AND attendance = ? AND created_at > datetime('now', '-1 hour') LIMIT 1;`
  ).get(record.email, record.attendeeNames, record.attendance);

  if (existing) {
    return { alreadyExists: true, id: existing.id };
  }

  const stmt = db.prepare(`
    INSERT INTO rsvps (
      submitter_name,
      attendee_names,
      total_attendees,
      email,
      attendance,
      company,
      created_at,
      organizer_email_status,
      guest_email_status,
      duplicate_check
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?)
  `);

  const duplicateCheck = `${normalizeString(record.email).toLowerCase()}|${normalizeString(record.attendeeNames).toLowerCase()}|${record.attendance}`;
  const result = stmt.run(
    record.submitterName,
    record.attendeeNames,
    record.totalAttendees,
    record.email,
    record.attendance,
    record.company || '',
    record.createdAt,
    duplicateCheck
  );
 
  return { alreadyExists: false, id: result.lastInsertRowid };
}

function getRsvpById(id) {
  return db.prepare('SELECT * FROM rsvps WHERE id = ?').get(id);
}

function updateGuestEmailStatus(id, status, errorText = null) {
  db.prepare(`
    UPDATE rsvps
    SET guest_email_status = ?, guest_email_error = ?
    WHERE id = ?
  `).run(status, errorText || '', id);
}

function updateOrganizerEmailStatus(id, status, errorText = null) {
  db.prepare(`
    UPDATE rsvps
    SET organizer_email_status = ?, organizer_email_error = ?
    WHERE id = ?
  `).run(status, errorText || '', id);
}

module.exports = {
  db,
  upsertRsvp,
  getRsvpById,
  updateGuestEmailStatus,
  updateOrganizerEmailStatus
};

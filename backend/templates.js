const config = require('./config');

function formatDateForEmail(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

function buildOrganizerHtml(record) {
  return `
    <h2>New RSVP for Baby Lizzie’s Dedication</h2>
    <p><strong>Submitter:</strong> ${record.submitterName}</p>
    <p><strong>Attendees:</strong> ${record.attendeeNames}</p>
    <p><strong>Total attendees:</strong> ${record.totalAttendees}</p>
    <p><strong>Email:</strong> ${record.email}</p>
    <p><strong>Attendance:</strong> ${record.attendance === 'church-service-only' ? 'Church service only' : 'Church service and brunch'}</p>
    <p><strong>Submitted:</strong> ${formatDateForEmail(record.createdAt)}</p>
  `;
}

function buildGuestHtml(record) {
  const churchDetails = `
    <p><strong>Event date:</strong> November 7, 2026</p>
    <p><strong>Church:</strong> ${config.churchName || 'Pending church details'}</p>
    <p><strong>Church address:</strong> ${config.churchAddress || 'Pending church address'}</p>
    <p><strong>Service time:</strong> ${config.churchTime || 'Pending service time'}</p>
    ${config.churchInstructions ? `<p><strong>Arrival instructions:</strong> ${config.churchInstructions}</p>` : ''}
  `;

  const brunchDetails = `
    ${config.brunchName ? `<p><strong>Brunch venue:</strong> ${config.brunchName}</p>` : ''}
    ${config.brunchAddress ? `<p><strong>Brunch address:</strong> ${config.brunchAddress}</p>` : ''}
    <p><strong>Brunch start time:</strong> ${config.brunchTime || 'Approximately 1:30 p.m.'}</p>
    ${config.brunchInstructions ? `<p><strong>Brunch instructions:</strong> ${config.brunchInstructions}</p>` : ''}
  `;

  const isChurchOnly = record.attendance === 'church-service-only';

  const title = isChurchOnly ? 'Your RSVP for Baby Lizzie’s Dedication' : 'Your RSVP for Baby Lizzie’s Dedication and Celebration Brunch';

  return `
    <h2>${title}</h2>
    <p>Thank you for your RSVP. We are grateful for your support and joy as we celebrate this meaningful occasion.</p>
    <p><strong>Attendance selection:</strong> ${isChurchOnly ? 'Church service only' : 'Church service and brunch'}</p>
    <p><strong>Attendee names:</strong> ${record.attendeeNames}</p>
    <p><strong>Total attendees:</strong> ${record.totalAttendees}</p>
    ${churchDetails}
    ${isChurchOnly ? '' : brunchDetails}
    <p>We look forward to celebrating with you.</p>
  `;
}

module.exports = {
  buildOrganizerHtml,
  buildGuestHtml
};

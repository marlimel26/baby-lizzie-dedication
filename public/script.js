const form = document.getElementById('rsvp-form');
const formMessage = document.getElementById('form-message');
const submitBtn = document.querySelector('.submit-btn');

const setMessage = (type, text) => {
  formMessage.className = `form-message ${type}`;
  formMessage.textContent = text;
};

const validateForm = () => {
  const submitterName = document.getElementById('submitter-name').value.trim();
  const attendeeNames = document.getElementById('attendee-names').value.trim();
  const totalAttendees = Number(document.getElementById('total-attendees').value);
  const email = document.getElementById('email').value.trim();
  const attendance = document.querySelector('input[name="attendance"]:checked');

  if (!submitterName) {
    return 'Please enter the name of the person submitting the RSVP.';
  }

  if (!attendeeNames) {
    return 'Please list the names of all attendees.';
  }

  if (!Number.isInteger(totalAttendees) || totalAttendees < 1) {
    return 'Please enter a positive whole number for the total number of attendees.';
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Please enter a valid email address.';
  }

  if (!attendance) {
    return 'Please choose church service only or church service and brunch.';
  }

  return '';
};

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const validationError = validateForm();
  if (validationError) {
    setMessage('error', validationError);
    return;
  }

  const payload = {
    submitterName: document.getElementById('submitter-name').value.trim(),
    attendeeNames: document.getElementById('attendee-names').value.trim(),
    totalAttendees: Number(document.getElementById('total-attendees').value),
    email: document.getElementById('email').value.trim(),
    attendance: document.querySelector('input[name="attendance"]:checked').value,
    company: document.getElementById('company').value.trim(),
  };

  if (payload.company) {
    setMessage('error', 'Submission blocked.');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';
  setMessage('success', 'Submitting your RSVP…');

  try {
    const response = await fetch('/api/rsvp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Your RSVP could not be submitted.');
    }

    const isChurchOnly = payload.attendance === 'church-service-only';

    if (result.status === 'saved-email-failed') {
      setMessage(
        'error',
        'Your RSVP was saved, but the confirmation email could not be sent at this time. Please try again later or contact the organizer. Your RSVP remains on file.'
      );
      return;
    }

    setMessage(
      'success',
      isChurchOnly
        ? 'Thank you for your RSVP! We look forward to celebrating Baby Lizzie’s dedication with you. The church service details will be sent to the email address you provided.'
        : 'Thank you for your RSVP! We look forward to celebrating Baby Lizzie’s dedication with you at church and brunch. The church and brunch details will be sent to the email address you provided.'
    );

    form.reset();
  } catch (error) {
    setMessage('error', error.message || 'There was a problem submitting your RSVP. Please try again.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'RSVP';
  }
});

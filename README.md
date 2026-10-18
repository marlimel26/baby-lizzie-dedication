# Baby Lizzie's Dedication

A warm, reverent invitation site for Baby Lizzie’s church dedication and celebration brunch.

## What is included
- Responsive, mobile-friendly invitation website
- Accessible RSVP form with validation and duplicate prevention
- Server-side RSVP storage using SQLite for local development
- Organizer email notifications and conditional guest confirmation emails
- Private configuration for church and brunch details via environment variables
- Temporary illustration placeholder, ready to be replaced with the final art

## Local development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Update the values in `.env` for your local setup.

4. Start the app:
   ```bash
   npm start
   ```

5. Open the site in a browser:
   - Public site: http://localhost:3000
   - API health: http://localhost:3000/api/health

## Production deployment

### Frontend
Use GitHub Pages or Netlify/Vercel to serve the static frontend from `public/`.

Recommended public setup:
- GitHub Pages for the public invitation site
- Separate backend hosting for the API (Render, Railway, or Vercel Functions)

### Backend
The API is in `backend/server.js` and can be deployed separately from the static frontend.

Recommended deployment options:
- Render or Railway: deploy the Node app directly
- Vercel: use a serverless function or Node runtime if the plan supports it
- Supabase or another Postgres host: swap the local SQLite storage for durable Postgres-based storage

### Required production configuration
Before live launch, provide values for:
- `CHURCH_NAME`
- `CHURCH_ADDRESS`
- `CHURCH_TIME`
- `CHURCH_INSTRUCTIONS` (optional)
- `BRUNCH_NAME`
- `BRUNCH_ADDRESS`
- `BRUNCH_TIME` (approx. 1:30 p.m.)
- `BRUNCH_INSTRUCTIONS` (optional)
- `ORG_EMAIL` = nichmari.u@gmail.com
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`
- Verified sender address for the email provider

Do not put private venue details into the public HTML or browser JS.

## Privacy notes
- RSVP data is stored in `data/rsvps.db` locally and should be moved to a durable encrypted database in production.
- Private event data and email credentials remain in environment variables.
- No guest names or attendee information are exposed on the public website.

## Files
- `public/index.html` – the public invitation page
- `public/styles.css` – styling and responsive layout
- `public/script.js` – client-side form logic and validation
- `backend/server.js` – Express API and RSVP handling
- `backend/config.js` – environment configuration
- `backend/db.js` – SQLite table creation and RSVP storage
- `backend/email.js` – organizer and guest email delivery
- `backend/templates.js` – conditional guest confirmation templates
- `data/` – local SQLite storage

## Missing details before launch
The following details are not included in this code and must be supplied before production launch:
- Church name
- Church address
- Church service time
- Optional church arrival instructions
- Brunch venue name
- Brunch address
- Optional brunch instructions
- Verified sender email for email delivery

## Testing summary
Implemented and checked:
- Mobile-friendly design layout
- Client-side validation for attendee count and email format
- Server-side validation for adverse or incomplete submissions
- Duplicate suppression and honeypot spam protection
- Conditional organizer and guest email content based on attendance selection
- RSVP preservation when email delivery fails
- Local SQLite data storage

Email delivery was not exercised against a real production sender during this scaffold; use a sandbox or test SMTP account before live sending.

## License
This project is a custom invitation website for private event use.

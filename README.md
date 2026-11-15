# ElderCare 360

**Proactive Elderly Care & Medication Management Platform** — a React + Vite hackathon demonstration.

## Features

- Health overview dashboard with adherence, vitals, symptoms, mood and appointment summaries.
- Medication management with prescription CRUD, scheduled doses, dose history and adherence tracking.
- Inventory tracking with stock deduction only when a dose is marked taken, low-stock and estimated two-day depletion reminders, expiry warnings and restocking.
- Automatic missed-dose recording after a 60-minute grace period while the app is open; missed doses do not deduct stock.
- Notification Center for medication, inventory, symptom, emotional-wellness and appointment alerts, with caregiver review/acknowledgement.
- Caregiver Portal with safety alerts, vitals entry, and appointment create/edit/delete.
- Symptom monitoring with conservative escalation rules and Emergency SOS (India 112).
- Emotional Wellness, AURA companion, Family Connect and accessibility controls.

## Visual design and accessibility

- Uses a clean **navy blue and white** visual theme.
- DM Sans provides readable interface typography, while Lora is used for page headings.
- Spacious layouts, larger cards, comfortable controls, and subtle blue accents improve readability.
- Accessibility options include large and extra-large text modes.

## Run locally

Requirements: Node.js 20.19+ or 22.12+ and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

Production build:

```bash
npm run build
npm run preview
```

## Deploy to Netlify

The included `netlify.toml` configures Node.js 22, the `npm run build` command, and `dist` as the publish directory. Connect the GitHub repository to Netlify to enable continuous deployment.

## Demo and safety notes

- This hackathon version stores information in the browser's `localStorage`. Data is local to the browser/device and does not synchronize to other caregivers or devices. Clearing browser data removes the demo records.
- Alerts are in-app demo alerts. They are not SMS, WhatsApp, email, native push notifications, or background monitoring. Automatic missed-dose checks run while the web app is open.
- AURA is a local, rule-based conversational companion, not a connected clinical AI or medical professional.
- The application is a demonstration, not a medical device. It does not diagnose, prescribe, or replace professional medical advice. In an emergency in India, contact 112 and local emergency services.
- Use fictional demo data only. Do not enter real patient information into this demo.

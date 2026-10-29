# Explorer Offer Submission

Single-page offer submission portal for ALL Accor+ Explorer. A successful submission packages the form data and optional translations into a ZIP archive, stores it in Google Drive, and opens a dedicated confirmation page. Asana task creation is temporarily disabled by default.

## Authentication

The form and all sensitive Netlify Functions are protected by Clerk. The custom passwordless flow validates the email domain before contacting Clerk. Only exact `accor.com` and `accorplus.com` addresses are permitted, and the server repeats the domain check after authentication.

Configure these Netlify environment variables:

- `CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

Use Clerk's Open access mode, enable email-code authentication for sign-in and sign-up, and enable strict user-enumeration protection.

## Google Drive archive

The Netlify `submit-offer` function verifies the Clerk session and Cloudflare Turnstile token before creating a ZIP containing:

- the generated Explorer Offer ID;
- hotel or partner and submitter information;
- offer content, dates, booking details, benefits, and terms;
- every translation explicitly saved in the translation section; and
- a readable submission summary.

Translations are optional and generated only when requested. Any text present in the translation preview is included automatically. Uploaded media is not included in this text archive because those files can exceed Netlify's request-size limit.

Configure these Netlify environment variables:

- `GOOGLE_APPS_SCRIPT_WEBHOOK_URL`
- `GOOGLE_APPS_SCRIPT_SECRET`
- `ENABLE_ASANA_TASK_CREATION` (optional; defaults to `false`)
- `TURNSTILE_SECRET_KEY`
- `TURNSTILE_ALLOWED_HOSTNAMES` (optional; defaults to `hotelsoffer.netlify.app`)
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (optional; defaults to `gemini-3.5-flash-lite`)

The Cloudflare Turnstile site key is browser-safe and is configured in `app.js`.

The companion script in `integrations/google-apps-script/` runs as the Google account owner, saves the ZIP in the configured Drive folder, and appends a tracking row to the configured Sheet. Its Script Properties hold the folder ID, spreadsheet ID, and matching webhook secret.

## Images

Users can upload one master image, which the browser resizes into:

- banner: 2048 x 1366px;
- listing tile: 400 x 250px; and
- social: 1080 x 1080px.

Users can also upload each placement separately. The applicable rate and booking screenshots are attached to the Asana task alongside the marketing images.

## Local development

Copy `.env.example` to `.env`, add Clerk development keys and the other required service credentials, then run:

```bash
npx netlify-cli dev
```

Netlify Dev normally serves the application at `http://localhost:8888`.

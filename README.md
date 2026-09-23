# Explorer Offer Submission

Single-page offer submission portal for ALL Accor+ Explorer. A successful submission creates an Asana task, adds every saved translation to the task description, attaches the selected images, and opens a dedicated confirmation page.

## Authentication

The form and all sensitive Netlify Functions are protected by Clerk. The custom passwordless flow validates the email domain before contacting Clerk. Only exact `accor.com` and `accorplus.com` addresses are permitted, and the server repeats the domain check after authentication.

Configure these Netlify environment variables:

- `CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

Use Clerk's Open access mode, enable email-code authentication for sign-in and sign-up, and enable strict user-enumeration protection.

## Asana submission

The Netlify `submit-offer` function verifies the Clerk session and Cloudflare Turnstile token before creating a task. The task includes:

- the generated Explorer Offer ID;
- hotel or partner and submitter information;
- offer content, dates, booking details, benefits, and terms;
- every translation explicitly saved in the translation section; and
- selected and browser-resized images as direct Asana attachments.

Translations are generated only when the user requests a preview. The user can edit the draft and must click **Save translation** for it to be included in the Asana task.

Configure these Netlify environment variables:

- `ASANA_ACCESS_TOKEN`
- `ASANA_PROJECT_GID`
- `ASANA_ASSIGNEE_GID` (optional)
- `TURNSTILE_SECRET_KEY`
- `TURNSTILE_ALLOWED_HOSTNAMES` (optional; defaults to `hotelsoffer.netlify.app`)
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (optional; defaults to `gemini-3.5-flash-lite`)

The Cloudflare Turnstile site key is browser-safe and is configured in `app.js`.

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

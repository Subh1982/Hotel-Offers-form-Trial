# Testing Guide

## Automated tests

From the repository root:

```bash
npm ci
npm test
```

The test suite uses Node's built-in test runner and covers authentication-domain validation, booking-link validation, AI fallbacks, translations, language switching, offer types, upload requirements, shared header behaviour, and confirmation-page languages.

Add focused regression coverage in `tests/` for every corrected defect or changed rule. Tests should not require production credentials or mutate external services.

## Local integration testing

1. Copy `.env.example` to `.env` and supply development or sandbox credentials.
2. Run `npx netlify-cli dev`.
3. Open the local URL reported by Netlify Dev (normally `http://localhost:8888`).
4. Use test accounts and non-production Drive, Sheet, Clerk, Gemini, Turnstile, and Asana configuration.

## Manual regression checklist

- Review changed user-facing copy and presentation against `docs/brand-style-guide.md`.
- Sign in with each permanent permitted domain and reject an unapproved domain.
- Confirm the stakeholder-domain fallback behaviour when the Apps Script service is unavailable.
- Switch interface languages and verify the confirmation page.
- Exercise each offer type and its conditional required fields.
- Upload a master image and separate placement images; verify dimensions and previews.
- Exercise any applicable image, PDF, rate, and booking-proof requirements.
- Validate an acceptable public booking URL and reject local/private/invalid URLs.
- Request brand-tone alignment and translations; verify graceful failure when Gemini is unavailable.
- Submit to a sandbox and verify the Drive folder, child folders, uploaded assets, ZIP contents, and tracking-sheet row.
- When Asana is deliberately enabled, verify the task and attachments without treating Asana as the primary record.

## Completion evidence

Record the command and result of automated tests, manual scenarios exercised, environment used, and integrations not tested. A passing unit suite alone does not prove that external service configuration is correct.


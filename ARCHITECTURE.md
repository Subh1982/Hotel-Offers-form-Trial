# Explorer Offer Submission architecture

## Overview

The application is a Google Drive-backed offer intake workflow. It does not persist submissions in an application database or send package emails. Asana integration remains in the codebase but is disabled unless explicitly enabled.

```text
Hotel user
  -> Clerk passwordless authentication
  -> Static single-page form on Netlify
  -> Gemini-assisted brand tone and translations (on request)
  -> Cloudflare Turnstile verification
  -> Netlify submit-offer function
  -> ZIP archive uploaded to Google Drive
  -> Dedicated confirmation page
```

## Browser application

`index.html`, `styles.css`, and `app.js` provide the branded form, conditional offer fields, browser-side image resizing, Gemini translation preview, and submission flow.

`auth.js` validates exact `accor.com` and `accorplus.com` domains before contacting Clerk, manages the passwordless email-code session, and adds a Clerk bearer token to protected requests.

A generated translation remains editable in the preview and is added automatically to `auto_translations`. Multiple optional target languages can be included before submission.

## Netlify Functions

| Function | Responsibility |
| --- | --- |
| `_auth.js` | Verifies Clerk session tokens and repeats the allowed-domain check. |
| `auth-config.js` | Returns the browser-safe Clerk publishable key. |
| `align-brand-tone.js` | Rewrites offer descriptions through Gemini using the supplied brand prompt. |
| `translate-content.js` | Produces glossary-aware Gemini translation drafts. |
| `_drive-archive.js` | Builds the ZIP and sends it to the protected Apps Script webhook. |
| `submit-offer.js` | Verifies authentication and Turnstile, uploads the Drive archive, and conditionally runs the disabled-by-default Asana integration. |

## Drive archive creation

`submit-offer.js` generates a timestamp-based Explorer Offer ID. `_drive-archive.js` packages `submission.json`, `submission-summary.txt`, and one text file per optional translation, then sends the ZIP to a Google Apps Script web app. The script runs as its owner, saves the ZIP in Drive, and appends a tracking row to Google Sheets.

ZIP filenames use `YYYY-MM-DD_offer-type_hotel-rid.zip`. Asana task creation can be restored later by setting `ENABLE_ASANA_TASK_CREATION=true` and retaining the existing Asana environment variables.

## Security boundaries

- Clerk authenticates users; the browser and server both enforce the exact corporate-domain allowlist.
- Turnstile verification is mandatory for every submission.
- Clerk, Gemini, Turnstile, and Asana secrets exist only in Netlify environment variables.
- The browser receives only Clerk's publishable key and the public Turnstile site key.
- The submitter email used in Asana comes from the verified Clerk account, not editable request data.

## Required environment variables

| Variable | Purpose |
| --- | --- |
| `CLERK_PUBLISHABLE_KEY` | Initializes Clerk in the browser. |
| `CLERK_SECRET_KEY` | Verifies sessions and retrieves the verified email. |
| `GOOGLE_APPS_SCRIPT_WEBHOOK_URL` | Receives the ZIP and tracking metadata in the owner-authorized Apps Script. |
| `GOOGLE_APPS_SCRIPT_SECRET` | Authenticates server-to-server webhook requests. |
| `ASANA_ACCESS_TOKEN` | Creates tasks and uploads attachments. |
| `ASANA_PROJECT_GID` | Selects the destination project. |
| `ASANA_ASSIGNEE_GID` | Optionally assigns every task. |
| `TURNSTILE_SECRET_KEY` | Verifies submission tokens. |
| `TURNSTILE_ALLOWED_HOSTNAMES` | Optionally overrides the production hostname allowlist. |
| `GEMINI_API_KEY` | Powers brand-tone alignment and translations. |
| `GEMINI_MODEL` | Optionally overrides `gemini-3.5-flash-lite`. |

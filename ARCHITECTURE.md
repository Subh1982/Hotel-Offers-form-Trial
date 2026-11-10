# Explorer Offer Submission architecture

## Overview

The application is a Google Drive-backed offer intake workflow. It does not use an application database or send submission packages by email. Asana integration is implemented in the codebase but is disabled unless explicitly enabled.

```text
Hotel or partner user
  -> Clerk passwordless authentication
  -> Static single-page application on Netlify
  -> Gemini-assisted brand-tone alignment and translations (on request)
  -> Cloudflare Turnstile verification
  -> Optional booking-link validation
  -> Netlify submit-offer function
  -> Submission folder created in Google Drive
  -> Images and documents uploaded to the submission folder
  -> ZIP archive uploaded and tracking row appended to Google Sheets
  -> Optional Asana task creation (disabled by default)
  -> Dedicated confirmation page
```

## Browser application

`index.html`, `styles.css`, and `app.js` provide the branded form, conditional offer fields, browser-side image resizing, Gemini translation preview, booking-link confirmation, staged file upload, and submission flow.

`auth.js` obtains the browser-safe Clerk configuration, validates the user's email domain before contacting Clerk, manages the passwordless email-code session, and adds a Clerk bearer token to protected requests.

`accor.com` and `accorplus.com` are permanent allowed domains. Additional stakeholder domains can be enabled, annotated, and optionally given an expiry date in the stakeholder-managed **Explorer Offers - Allowed Domains** Google Sheet. The browser and server retrieve this list through the protected Google Apps Script webhook; Netlify caches it for five minutes and falls back to the permanent Accor domains if the external list is unavailable.

Gemini-generated content remains editable before submission. Brand-tone alignment is optional, translations are generated only when requested, and multiple target languages can be saved with an offer.

When a booking URL is supplied, the browser calls a protected server-side validator. It accepts only public HTTP or HTTPS destinations, blocks local and private network addresses, follows a limited number of redirects, and reports whether the destination responds. The user reviews the result before continuing.

## Netlify hosting and functions

Netlify hosts the static application and runs the server-side functions. Sensitive credentials are stored in Netlify environment variables and are not exposed to the browser.

| Function | Responsibility |
| --- | --- |
| `_auth.js` | Verifies Clerk session tokens, retrieves the verified user email, and repeats the allowed-domain check. |
| `_allowed-domains.js` | Retrieves stakeholder-managed domains through Google Apps Script, combines them with the permanent domains, validates them, and caches the result. |
| `auth-config.js` | Returns the browser-safe Clerk publishable key and current allowed-domain list. |
| `_gemini.js` | Provides the shared Gemini API client, model selection, timeout, retry, and public error handling. |
| `align-brand-tone.js` | Rewrites offer descriptions through Gemini using the supplied brand prompt. |
| `translate-content.js` | Produces glossary-aware Gemini translation drafts. |
| `validate-booking-link.js` | Safely checks public booking URLs after Clerk and Turnstile verification. |
| `_drive-archive.js` | Creates the submission folder, uploads assets through Apps Script, builds the final ZIP, and sends it for storage. |
| `submit-offer.js` | Orchestrates Turnstile verification, staged Drive storage, finalisation, and the disabled-by-default Asana integration. |

## Submission and storage flow

Submission uses three stages so that uploaded media does not have to be embedded in the final ZIP request:

1. `submit-offer.js` verifies the Clerk session and Turnstile token, generates a timestamp-based Explorer Offer ID, and requests a new Google Drive submission folder.
2. The browser resizes applicable images and uploads each image or PDF separately. Images are stored in the submission's `images` folder and PDFs in its `documents` folder.
3. The browser requests finalisation. `_drive-archive.js` creates a ZIP containing `submission.json`, `submission-summary.txt`, and one text file per saved automatic translation. Google Apps Script stores the ZIP in the submission folder and appends the offer metadata and file links to the tracking Google Sheet.

ZIP filenames use `YYYY-MM-DD_offer-type_hotel-rid.zip`. Each submission folder contains the uploaded assets and final ZIP, while the tracking sheet provides the operational register and links back to those files.

## Google Apps Script integration

The companion web app in `integrations/google-apps-script/Code.gs` runs as its Google account owner and provides the authorised bridge from Netlify to Google Drive and Google Sheets. A shared webhook secret authenticates server-to-server requests.

The Apps Script integration:

- creates the submission folder and its `images` and `documents` subfolders;
- stores uploaded images and PDFs;
- stores the final ZIP archive;
- appends the completed submission to the configured tracking sheet; and
- creates and reads the stakeholder-managed allowed-domain spreadsheet.

Its Script Properties hold the webhook secret, destination Drive folder ID, tracking spreadsheet ID, optional sheet name, and the automatically managed allowed-domain spreadsheet ID.

## Asana integration

Asana task creation and image attachment upload are implemented but disabled by default. They can be activated by setting `ENABLE_ASANA_TASK_CREATION=true` and providing the required Asana credentials and project configuration.

When enabled, the finalisation stage creates an Asana task containing the offer details and saved translations. The browser then requests attachment of the submitted images to that task. Google Drive and Google Sheets remain the primary storage and tracking system regardless of whether Asana is enabled.

## Security boundaries

- Clerk provides passwordless authentication and verified user identity.
- The browser performs an early email-domain check, and protected Netlify Functions repeat the check using the verified Clerk account.
- `accor.com` and `accorplus.com` are permanent fallback domains; additional access is managed in Google Sheets and cached for five minutes.
- Turnstile verification is mandatory for submission and booking-link validation requests.
- Booking-link validation rejects local, private-network, credential-bearing, and non-HTTP(S) destinations.
- The Google Apps Script endpoint requires a shared server-to-server secret.
- Clerk, Gemini, Turnstile, Google Apps Script, and Asana secrets exist only in server-side configuration.
- The browser receives only Clerk's publishable key, the allowed-domain list, and the public Turnstile site key.
- The stored submitter email and any Asana submitter identity come from the verified Clerk account, not editable request data.

## Configuration

### Required Netlify environment variables

| Variable | Purpose |
| --- | --- |
| `CLERK_PUBLISHABLE_KEY` | Initializes Clerk in the browser. |
| `CLERK_SECRET_KEY` | Verifies Clerk sessions and retrieves the verified user email. |
| `GOOGLE_APPS_SCRIPT_WEBHOOK_URL` | Identifies the deployed Apps Script web app used for Drive, Sheets, and allowed-domain operations. |
| `GOOGLE_APPS_SCRIPT_SECRET` | Authenticates Netlify's requests to the Apps Script webhook. |
| `TURNSTILE_SECRET_KEY` | Verifies Turnstile tokens on the server. |
| `GEMINI_API_KEY` | Powers brand-tone alignment and translations. |

The public Turnstile site key is configured in `app.js`.

### Optional Netlify environment variables

| Variable | Purpose |
| --- | --- |
| `GEMINI_MODEL` | Overrides the default Gemini model, `gemini-3.5-flash-lite`. |
| `TURNSTILE_ALLOWED_HOSTNAMES` | Overrides the production hostname allowlist used during Turnstile verification. |
| `ENABLE_ASANA_TASK_CREATION` | Enables Asana task creation when set to `true`; defaults to disabled. |
| `ASANA_ACCESS_TOKEN` | Authorises Asana task creation and attachment upload when Asana is enabled. |
| `ASANA_PROJECT_GID` | Selects the destination Asana project when Asana is enabled. |
| `ASANA_ASSIGNEE_GID` | Optionally assigns each created Asana task. |

### Google Apps Script properties

| Property | Purpose |
| --- | --- |
| `WEBHOOK_SECRET` | Must match `GOOGLE_APPS_SCRIPT_SECRET`. |
| `DRIVE_FOLDER_ID` | Selects the parent Drive folder for submissions and the allowed-domain spreadsheet. |
| `SPREADSHEET_ID` | Selects the offer tracking spreadsheet. |
| `SHEET_NAME` | Optionally overrides the tracking tab name; defaults to `Offers`. |
| `ALLOWED_DOMAINS_SPREADSHEET_ID` | Identifies the allowed-domain spreadsheet; created and stored automatically on first use. |

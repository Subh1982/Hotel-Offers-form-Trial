# Explorer Offer Submission architecture

## Overview

The application is an Asana-first offer intake workflow. It does not persist submissions in an application database, generate ZIP files, synchronise Google Sheets, or send package emails.

```text
Hotel user
  -> Clerk passwordless authentication
  -> Static single-page form on Netlify
  -> Gemini-assisted brand tone and translations (on request)
  -> Cloudflare Turnstile verification
  -> Netlify submit-offer function
  -> Asana task plus direct image attachments
  -> Dedicated confirmation page
```

## Browser application

`index.html`, `styles.css`, and `app.js` provide the branded form, conditional offer fields, browser-side image resizing, Gemini translation preview, and submission flow.

`auth.js` validates exact `accor.com` and `accorplus.com` domains before contacting Clerk, manages the passwordless email-code session, and adds a Clerk bearer token to protected requests.

A generated translation remains editable in the preview. It is added to `auto_translations` only when the user clicks **Save translation**. Multiple target languages can be saved before submission.

## Netlify Functions

| Function | Responsibility |
| --- | --- |
| `_auth.js` | Verifies Clerk session tokens and repeats the allowed-domain check. |
| `auth-config.js` | Returns the browser-safe Clerk publishable key. |
| `align-brand-tone.js` | Rewrites offer descriptions through Gemini using the supplied brand prompt. |
| `translate-content.js` | Produces glossary-aware Gemini translation drafts. |
| `submit-offer.js` | Verifies authentication and Turnstile, creates the Asana task, and attaches images. |

## Asana task creation

`submit-offer.js` generates a timestamp-based Explorer Offer ID and builds the task title and description. The description contains the source offer, offer-specific details, terms, and a **Saved translations** section. Each saved translation is labelled with its target and source language.

After task creation, the function uploads the selected marketing images and applicable screenshots directly to the task through the Asana attachments API. Attachment failures are returned separately so the confirmation page can distinguish task creation from image-upload results.

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
| `ASANA_ACCESS_TOKEN` | Creates tasks and uploads attachments. |
| `ASANA_PROJECT_GID` | Selects the destination project. |
| `ASANA_ASSIGNEE_GID` | Optionally assigns every task. |
| `TURNSTILE_SECRET_KEY` | Verifies submission tokens. |
| `TURNSTILE_ALLOWED_HOSTNAMES` | Optionally overrides the production hostname allowlist. |
| `GEMINI_API_KEY` | Powers brand-tone alignment and translations. |
| `GEMINI_MODEL` | Optionally overrides `gemini-3.5-flash-lite`. |

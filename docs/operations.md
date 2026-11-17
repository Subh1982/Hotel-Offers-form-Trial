# Operations Runbook

## Services and ownership

The application depends on Netlify, Clerk, Cloudflare Turnstile, Google Apps Script, Google Drive, Google Sheets, and Gemini. Asana is optional. The receiving team must record named business and technical owners, account locations, billing ownership, and support contacts in its approved internal system; do not commit personal contact details or secrets here.

## Configuration

Netlify holds server-side environment variables. Google Apps Script configuration is held in Script Properties. Use `.env.example` only as a key inventory; it must never contain real values.

After changing a credential or service identifier, validate the smallest affected workflow in a non-production environment before production use. Rotate both sides of the Apps Script shared secret together.

## Deployment

Before deployment:

1. Review the diff and confirm the intended branch/site.
2. Run `npm ci` and `npm test`.
3. Confirm required Netlify environment variables exist without printing their values.
4. Verify that Apps Script and its Script Properties are compatible with the application revision.
5. Use a deploy preview to run the relevant manual regression checks.

Production deployment must follow the team's Netlify release and approval process. This repository does not define who may approve or promote a release; the receiving team must document that governance before taking ownership.

## Post-deployment checks

- Load the application and authentication configuration.
- Sign in with an approved test identity.
- Verify an affected non-destructive path such as language switching or booking-link validation.
- For releases touching submission, complete a clearly marked sandbox/test submission and verify Drive and Sheet results.
- Check Netlify Function logs for unexpected errors without logging tokens or submitted content.

## Monitoring

At minimum, monitor:

- Netlify deployment and Function failures;
- Clerk authentication failures and allowed-domain retrieval errors;
- Apps Script execution failures or quota exhaustion;
- missing Drive archives or tracking rows;
- Gemini timeouts and fallback rates;
- Turnstile verification failures; and
- Asana errors when the optional integration is enabled.

The receiving team must choose alert destinations, thresholds, retention, and on-call ownership. These are current handover gaps, not application defaults.

## Incident triage

1. Establish whether the failure affects authentication, content assistance, validation, upload, finalisation, or an optional integration.
2. Record the deployment version, timestamp, offer ID where safe, and relevant request/function correlation data.
3. Check Netlify Function and Apps Script logs without copying secrets or customer content into tickets.
4. Confirm third-party service status and quotas.
5. Avoid resubmitting blindly: retries may create duplicate Drive folders, Sheet rows, or Asana tasks.
6. Escalate data exposure, unauthorised access, or credential leakage through the organisation's security process immediately.

## Rollback

- Roll application code back through the team's approved Netlify/Git release mechanism.
- Configuration and Apps Script changes may need a coordinated independent rollback.
- Do not delete Drive folders or Sheet rows as part of a code rollback.
- After rollback, repeat post-deployment checks and document any submissions requiring reconciliation.


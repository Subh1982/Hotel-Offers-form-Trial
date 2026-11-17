# Known Issues and Handover Gaps

## Known constraints

- The application relies on multiple external services, so a successful local unit suite does not validate production integration configuration.
- The allowed-domain service uses a five-minute in-memory cache and falls back to permanent Accor domains when its external source is unavailable.
- Gemini features can fail independently of core submission and are expected to degrade gracefully.
- Asana support exists but is disabled by default and is not the authoritative store.
- Submission processing is staged. A failure between stages can leave a partially populated Drive folder that needs reconciliation.
- Retrying a finalisation or submission without first checking external results may create duplicate operational records.

## Receiving-team decisions required

- Name business owner, technical owner, Netlify release approvers, and incident/on-call contacts.
- Confirm the production Git repository, default branch, Netlify site, and release workflow.
- Confirm ownership and recovery access for Clerk, Turnstile, Google Apps Script, Drive, Sheets, Gemini, and optional Asana accounts.
- Define monitoring, alert thresholds, log retention, privacy classification, and incident response requirements.
- Define data retention, deletion, access-review, and backup/recovery policies for submissions and tracking data.
- Confirm whether Asana should remain disabled.
- Run and record a disaster-recovery exercise for Apps Script configuration, the Drive hierarchy, and the tracking Sheet.

Resolve these items in the team's controlled operational systems and link to them from this document only when the links are safe to store in source control.


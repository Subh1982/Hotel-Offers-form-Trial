# 0001: Use Google Drive and Google Sheets as the primary operational record

- Status: accepted
- Date: 2026-11-17
- Owners: Explorer Offers product and technical owners

## Context

The offer intake workflow must retain structured submission content and uploaded media while giving operational stakeholders an accessible register. Uploaded media can exceed practical Netlify Function request sizes, and the workflow already operates in the Google Workspace ecosystem.

## Decision

Store each submission and its assets in a dedicated Google Drive folder through an authenticated Google Apps Script bridge. Append the completed submission to a Google Sheet that acts as the operational register. Keep Asana optional and non-authoritative.

## Consequences

- Netlify does not need to retain application data or large uploads.
- Google Apps Script credentials and quotas are part of the production boundary.
- Submission finalisation is staged and can leave partial folders requiring reconciliation.
- Drive and Sheet ownership, retention, recovery, and access reviews are operational requirements.

## Alternatives considered

An earlier design used Supabase database and object storage. The maintained implementation instead uses existing Google Workspace services and does not require an application database.


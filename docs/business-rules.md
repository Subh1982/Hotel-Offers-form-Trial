# Business Rules

## Purpose

Explorer Offers Collection lets an authorised hotel or partner user prepare and submit an Explorer offer, supporting material, and optional translated content for operational processing.

## Access

- `accor.com` and `accorplus.com` are permanently permitted email domains.
- Additional stakeholder domains are maintained in the Explorer Offers allowed-domains Google Sheet.
- The browser performs an early domain check for usability; protected Netlify Functions make the authoritative check using the verified Clerk identity.
- If the external allowed-domain list is unavailable, access falls back to the permanent Accor domains.

## Submission

- A submission receives an Explorer Offer ID during the initial server-side stage.
- The user's identity comes from the verified Clerk session, not an editable form field.
- Applicable marketing images are resized in the browser for banner, listing-tile, and social placements.
- Images and PDFs are uploaded separately to avoid Netlify request-size limits.
- Finalisation creates a ZIP containing structured submission data, a readable summary, and saved translation text.
- Google Drive stores the submission folder, assets, documents, and ZIP.
- Google Sheets is the operational register and links back to stored files.

## Content assistance

- Gemini brand-tone alignment is optional.
- Translations are generated only when requested and remain editable before submission.
- Only translation content present in the saved preview is included in the final archive.
- AI-generated content is a draft and remains the submitter's responsibility to review.

## Booking links

- Only public HTTP or HTTPS destinations are eligible for server-side validation.
- Local, private-network, credential-bearing, and unsupported-protocol destinations are rejected.
- Redirects are limited and the user reviews the validation result before continuing.

## Asana

- Google Drive and Google Sheets remain authoritative even when Asana is enabled.
- Asana task creation is disabled by default.
- Enabling Asana requires an explicit environment setting and valid server-side credentials.

## Change control

Changes to authentication domains, required submission fields, offer types, storage layout, file naming, tracking columns, or integration ownership are business-contract changes. Confirm them with the product owner and update tests and documentation in the same change.


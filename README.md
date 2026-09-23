# Explorer Offer Submission

> Current test mode: form submission creates an Asana task, attaches selected images directly to it, and opens a dedicated confirmation page. Supabase, Google Sheets, ZIP generation, and package email are temporarily skipped.

Offer collection form for Pacific hotel offer submissions.

## Clerk authentication

The form and every sensitive Netlify Function are protected by Clerk. The public `auth-config` function exposes only Clerk's publishable key, which is designed for browser use. Only authenticated users whose verified primary email ends exactly in `@accor.com` or `@accorplus.com` can use the application. The submitter email stored with an offer always comes from the verified Clerk account rather than editable browser data.

Create a Clerk application, set its access mode to Open, enable email-code authentication for both sign-in and sign-up, and enable strict user-enumeration protection. The embedded Clerk component uses a unified passwordless sign-in-or-up flow: first-time users are verified by email and receive an internal Clerk user record without seeing a separate registration or password screen. Then add these environment variables in Netlify and redeploy:

- `CLERK_PUBLISHABLE_KEY`: the Clerk publishable key (`pk_...`);
- `CLERK_SECRET_KEY`: the Clerk secret key (`sk_...`). Never expose this value in browser code.

The Hobby plan does not include Clerk's production domain allowlist. This application therefore enforces the two permitted domains in both `auth.js` and the shared server-side function guard. The server-side check is authoritative.

Hotels complete the form in the browser and download a ZIP package containing:

- `submission.json`
- `submission-summary.txt`
- entered offer details for Red Hot Rooms, More Escapes, Hotel stay, Dining, Events, or Partners
- saved translation previews for English, Thai, Vietnamese, Bahasa Indonesia, or Japanese
- selected proof files, screenshots, menu PDFs, and resized images

Images can be uploaded individually, or the hotel can upload one master image that is resized into:

- banner image: 2048 x 1366px
- listing tile image: 400 x 250px
- social image: minimum 1080 x 1080px

Image source files must not exceed 200 MB.
If a different-sized image is uploaded for banner, listing tile, or social, the app automatically resizes it to the required output size.

The page interface can be displayed in English, Thai, Vietnamese, Bahasa Indonesia, or Japanese. The selected page language is treated as the source language for entered content. The bottom translation preview uses Gemini to generate a draft translation, shows it for review/editing, and saves the approved preview into the submission package.

Offer content is sent to Gemini through a Netlify Function only when the hotel clicks the preview translation button.

## Asana task creation

Each successful offer submission can create a task in an Asana project. The task is created immediately after the core Supabase record, before image uploads and spreadsheet synchronisation. It includes the generated Explorer Offer ID, hotel or partner information, submitter, booking link, offer content, offer-specific details, and terms. Image files and image links are not included in this first iteration.

Add these environment variables in Netlify and redeploy:

- `ASANA_ACCESS_TOKEN`: a secret Asana access token with permission to create tasks;
- `ASANA_PROJECT_GID`: the destination Asana project ID; and
- `ASANA_ASSIGNEE_GID`: optional user ID to assign every new task.
- `GEMINI_API_KEY`: Gemini API key used server-side for brand-tone alignment.
- `GEMINI_MODEL`: optional model override; defaults to `gemini-3.5-flash-lite`.
- `TURNSTILE_SECRET_KEY`: Cloudflare Turnstile secret used to verify submissions before Asana task creation.
- `TURNSTILE_ALLOWED_HOSTNAMES`: optional comma-separated hostname allowlist; defaults to `hotelsoffer.netlify.app`.

If Asana is not configured or task creation fails, the offer submission still succeeds and the confirmation panel displays the integration warning. This avoids duplicate offers caused by resubmission.

## Supabase storage

This Netlify version includes a serverless function that stores structured offer data in Supabase before downloading the ZIP package.

1. In Supabase, run `supabase-schema.sql` in the SQL editor.
2. In Netlify, add these environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Redeploy the site from Netlify.

The function stores structured form data in Supabase. Resized marketing images can also be stored in Supabase Storage when the storage bucket is configured.

## Supabase image storage

This version can store the resized marketing images and generated ZIP packages in Supabase Storage and write their links to the Google Sheet.

1. In Supabase, run `supabase-storage-setup.sql` in the SQL editor.
2. This creates a public bucket called `offer-assets`.
3. Optional: in Netlify, add this environment variable if you want a different bucket name:
   - `SUPABASE_STORAGE_BUCKET`
4. Redeploy the site from Netlify.

The app uploads these files:

- banner image
- listing tile image
- social image
- generated ZIP package

Proof files such as rate screenshots, menu PDFs, and booking screenshots remain in the downloaded ZIP package for now.

## Google Sheets sync

This version can also write each saved offer to a Google Sheet after the Supabase save succeeds.

1. Create or open the target Google Sheet.
2. Go to Extensions > Apps Script.
3. Paste the contents of `google-sheets-apps-script.js`.
4. Deploy the script as a Web App.
5. Set access to allow the web app to receive requests.
6. Copy the Web App URL.
7. In Netlify, add this environment variable:
   - `GOOGLE_SHEETS_WEBHOOK_URL`
8. Redeploy the site from Netlify.

New offers append a row. Edited offers update the matching row by `offer_id`.

The Sheet includes these image URL columns when Supabase Storage is configured:

- `banner_image_url`
- `listing_tile_image_url`
- `social_image_url`
- `package_zip_url`

## Email ZIP package

This version can email a download link for the generated ZIP package to:

`subh.bhatt22@gmail.com`

The email is sent through the same Google Apps Script Web App used for Google Sheets sync.

1. Paste the latest `google-sheets-apps-script.js` into Apps Script.
2. Deploy a new Web App version. This is required; the old deployment may accept the request without sending the email.
3. Confirm Netlify still has:
   - `GOOGLE_SHEETS_WEBHOOK_URL`
4. Redeploy the site from Netlify.

After a successful submission, the browser downloads the ZIP package, uploads the same ZIP directly to Supabase Storage, saves the package link back to Supabase and Google Sheets, then emails the link.

The package is emailed as a link rather than an attachment to avoid Netlify and Google Apps Script request-size limits.

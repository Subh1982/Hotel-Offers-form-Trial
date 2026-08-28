# Explorer Offer Submission

Offer collection form for Pacific hotel offer submissions.

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

The page interface can be displayed in English, Thai, Vietnamese, Bahasa Indonesia, or Japanese. The selected page language is treated as the source language for entered content. The bottom translation preview can generate a draft translation through the public MyMemory translation endpoint, show it for review/editing, and save the approved preview into the ZIP package.

Offer content is stored in Supabase when the Netlify environment variables are configured. Offer content is sent to the public MyMemory translation endpoint only when the hotel clicks the preview translation button.

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
2. Deploy a new Web App version.
3. Confirm Netlify still has:
   - `GOOGLE_SHEETS_WEBHOOK_URL`
4. Redeploy the site from Netlify.

After a successful submission, the browser downloads the ZIP package, uploads the same ZIP directly to Supabase Storage, saves the package link back to Supabase and Google Sheets, then emails the link.

The package is emailed as a link rather than an attachment to avoid Netlify and Google Apps Script request-size limits.

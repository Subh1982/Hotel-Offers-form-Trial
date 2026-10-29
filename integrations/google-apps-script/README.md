# Google Apps Script storage webhook

1. Create a Google Drive folder for ZIP archives and a Google Sheet for the submission register.
2. Open [script.google.com](https://script.google.com), create a project, and replace `Code.gs` with this folder's `Code.gs`.
3. In **Project Settings → Script Properties**, add:
   - `WEBHOOK_SECRET`: a long random value; use the same value for Netlify `GOOGLE_APPS_SCRIPT_SECRET`.
   - `DRIVE_FOLDER_ID`: the value after `/folders/` in the Drive folder URL.
   - `SPREADSHEET_ID`: the value between `/d/` and `/edit` in the Sheet URL.
   - `SHEET_NAME`: optional; defaults to `Offers`.
4. Select **Deploy → New deployment → Web app**.
5. Set **Execute as** to **Me** and access to **Anyone**. The webhook secret protects the endpoint.
6. Authorize Drive and Sheets access, deploy, and copy the `/exec` URL.
7. Add the URL to Netlify as `GOOGLE_APPS_SCRIPT_WEBHOOK_URL`.

Never commit or paste the webhook secret into this repository.

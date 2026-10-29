/**
 * Explorer Offers storage webhook.
 *
 * Required Script Properties:
 * - WEBHOOK_SECRET: same value as Netlify GOOGLE_APPS_SCRIPT_SECRET
 * - DRIVE_FOLDER_ID: destination Google Drive folder
 * - SPREADSHEET_ID: tracking spreadsheet
 * - SHEET_NAME: optional, defaults to "Offers"
 */
function doPost(event) {
  try {
    var payload = JSON.parse(event.postData.contents || '{}');
    var properties = PropertiesService.getScriptProperties();
    var expectedSecret = properties.getProperty('WEBHOOK_SECRET');
    if (!expectedSecret || payload.secret !== expectedSecret) {
      return jsonResponse_({ ok: false, error: 'Unauthorized request.' });
    }

    var folderId = properties.getProperty('DRIVE_FOLDER_ID');
    var spreadsheetId = properties.getProperty('SPREADSHEET_ID');
    if (!folderId || !spreadsheetId) {
      return jsonResponse_({ ok: false, error: 'Drive folder or spreadsheet is not configured.' });
    }
    if (!payload.filename || !payload.archive_base64) {
      return jsonResponse_({ ok: false, error: 'ZIP archive data is missing.' });
    }

    var bytes = Utilities.base64Decode(payload.archive_base64);
    var blob = Utilities.newBlob(bytes, payload.mime_type || 'application/zip', payload.filename);
    var file = DriveApp.getFolderById(folderId).createFile(blob);
    var offer = payload.offer || {};

    var lock = LockService.getScriptLock();
    lock.waitLock(15000);
    try {
      var sheetName = properties.getProperty('SHEET_NAME') || 'Offers';
      var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      var sheet = spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['Offer ID', 'Submission date', 'Created at', 'Offer type', 'Hotel RID code', 'Hotel name', 'Offer title', 'Submitter email', 'ZIP filename', 'Drive URL']);
        sheet.setFrozenRows(1);
      }
      sheet.appendRow([
        offer.offer_id || '',
        offer.submission_date || '',
        offer.generated_at || '',
        offer.offer_type || '',
        offer.hotel_rid_code || '',
        offer.hotel_name || '',
        offer.offer_title || '',
        offer.submitter_email || '',
        file.getName(),
        file.getUrl(),
      ]);
    } finally {
      lock.releaseLock();
    }

    return jsonResponse_({ ok: true, file_id: file.getId(), file_name: file.getName(), file_size: file.getSize(), file_url: file.getUrl(), sheet_updated: true });
  } catch (error) {
    return jsonResponse_({ ok: false, error: error && error.message ? error.message : 'Storage webhook failed.' });
  }
}

function jsonResponse_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}

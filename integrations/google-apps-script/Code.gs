/**
 * Explorer Offers storage webhook.
 *
 * Required Script Properties:
 * - WEBHOOK_SECRET: same value as Netlify GOOGLE_APPS_SCRIPT_SECRET
 * - DRIVE_FOLDER_ID: destination Google Drive folder
 * - SPREADSHEET_ID: tracking spreadsheet
 * - SHEET_NAME: optional, defaults to "Offers"
 * - ALLOWED_DOMAINS_SPREADSHEET_ID: created automatically on first use
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
    var offer = payload.offer || {};
    var rootFolder = DriveApp.getFolderById(folderId);

    if (payload.action === 'get_allowed_domains') {
      var allowedDomainsFile = getOrCreateAllowedDomainsFile_(properties, rootFolder);
      return jsonResponse_({ ok: true, domains: readAllowedDomains_(allowedDomainsFile.spreadsheet), file_id: allowedDomainsFile.spreadsheet.getId(), file_url: allowedDomainsFile.spreadsheet.getUrl() });
    }

    if (payload.action === 'create_submission') {
      var createdAt = offer.generated_at ? new Date(offer.generated_at) : new Date();
      if (isNaN(createdAt.getTime())) createdAt = new Date();
      var timestamp = Utilities.formatDate(createdAt, 'UTC', 'yyyyMMdd_HHmmss');
      var folderName = [timestamp, offer.offer_id || 'offer', offer.hotel_rid_code || 'no-rid'].join('_').replace(/_test$/i, '');
      var submissionFolder = rootFolder.createFolder(folderName);
      var imagesFolder = submissionFolder.createFolder('images');
      var documentsFolder = submissionFolder.createFolder('documents');
      return jsonResponse_({ ok: true, folder_id: submissionFolder.getId(), folder_url: submissionFolder.getUrl(), images_folder_id: imagesFolder.getId(), documents_folder_id: documentsFolder.getId() });
    }

    if (payload.action === 'upload_asset') {
      if (!payload.folder_id || !payload.filename || !payload.data_base64) return jsonResponse_({ ok: false, error: 'Asset data is missing.' });
      var assetBytes = Utilities.base64Decode(payload.data_base64);
      var assetBlob = Utilities.newBlob(assetBytes, payload.mime_type || 'application/octet-stream', payload.filename);
      var assetFile = DriveApp.getFolderById(payload.folder_id).createFile(assetBlob);
      return jsonResponse_({ ok: true, file_id: assetFile.getId(), file_name: assetFile.getName(), file_size: assetFile.getSize(), file_url: assetFile.getUrl() });
    }

    if (payload.action !== 'finalize_submission' || !payload.folder_id || !payload.filename || !payload.archive_base64) {
      return jsonResponse_({ ok: false, error: 'Final ZIP archive data is missing.' });
    }
    var bytes = Utilities.base64Decode(payload.archive_base64);
    var blob = Utilities.newBlob(bytes, payload.mime_type || 'application/zip', payload.filename);
    var submissionFolder = DriveApp.getFolderById(payload.folder_id);
    var file = submissionFolder.createFile(blob);

    var lock = LockService.getScriptLock();
    lock.waitLock(15000);
    try {
      var sheetName = properties.getProperty('SHEET_NAME') || 'Offers';
      var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      var sheet = spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
      var trackerHeaders = trackerHeaders_();
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(trackerHeaders);
      } else if (sheet.getLastColumn() < trackerHeaders.length) {
        sheet.getRange(1, 1, 1, trackerHeaders.length).setValues([trackerHeaders]);
      }
      sheet.setFrozenRows(1);
      var details = offer.offer_details || {};
      var translations = offer.auto_translations || {};
      var assetLinks = (offer.assets || []).reduce(function(links, asset) {
        if (asset.field) links[asset.field] = asset.webViewLink || asset.file_url || '';
        return links;
      }, {});
      sheet.appendRow([
        offer.generated_at || '',
        offer.submission_date || '',
        offer.offer_id || '',
        'Submitted',
        offer.offer_type || '',
        offer.hotel_rid_code || '',
        offer.hotel_name || '',
        offer.city_country || '',
        offer.person_in_charge_name || '',
        offer.email || '',
        offer.offer_tile_title || '',
        offer.offer_banner_title || '',
        offer.offer_subtitle || '',
        offer.meta_description || '',
        offer.offer_description || '',
        details.booking_start_date || '',
        details.booking_end_date || '',
        details.stay_start_date || '',
        details.stay_end_date || '',
        details.offer_validity_start_date || '',
        details.offer_validity_end_date || '',
        details.event_date || '',
        details.event_time || '',
        details.venue || '',
        details.room_type || '',
        details.partner_name || '',
        details.member_benefits || '',
        details.package_details || '',
        details.accommodation_details || '',
        details.original_price || '',
        details.discounted_price || '',
        details.member_package_price || '',
        details.public_package_value || '',
        details.member_price_per_night || '',
        details.public_price_per_night || '',
        details.price || '',
        details.public_price || '',
        details.member_price || '',
        details.booking_method || '',
        offer.booking_link || '',
        details.booking_email || '',
        details.translation_required || '',
        details.translation_languages || '',
        offer.terms || '',
        Object.keys(translations).join(', '),
        submissionFolder.getUrl(),
        file.getUrl(),
        file.getName(),
        assetLinks.banner_image || '',
        assetLinks.listing_tile_image || '',
        assetLinks.social_image || '',
        assetLinks.rate_screenshot || '',
        assetLinks.booking_screenshot || '',
        assetLinks.menu_pdf || '',
        '',
        '',
        details.other_event_dates || '',
        details.exclusive_member_event || '',
      ]);
    } finally {
      lock.releaseLock();
    }

    return jsonResponse_({ ok: true, file_id: file.getId(), file_name: file.getName(), file_size: file.getSize(), file_url: file.getUrl(), folder_url: submissionFolder.getUrl(), sheet_updated: true });
  } catch (error) {
    return jsonResponse_({ ok: false, error: error && error.message ? error.message : 'Storage webhook failed.' });
  }
}

function trackerHeaders_() {
  return [
    'Submission timestamp', 'Submission date', 'Offer ID', 'Status', 'Offer type',
    'Hotel RID code', 'Hotel name', 'City - Country', 'Person in charge', 'Submitter email',
    'Offer tile title', 'Offer banner title', 'Offer subtitle', 'Meta description', 'Offer description',
    'Booking start date', 'Booking end date', 'Stay start date', 'Stay end date',
    'Offer validity start date', 'Offer validity end date', 'Event date', 'Event time', 'Venue',
    'Room type', 'Partner name', 'Member benefits', 'Package details', 'Accommodation details',
    'Original price', 'Discounted price', 'Member package price', 'Public package value',
    'Member price per night', 'Public price per night', 'Price', 'Public price', 'Member price',
    'Booking method', 'Booking link', 'Booking email / RSVP', 'Translation required',
    'Requested translation languages', 'Terms and conditions',
    'Translation languages', 'Submission folder URL', 'ZIP URL', 'ZIP filename',
    'Banner image URL', 'Listing tile image URL', 'Social image URL',
    'Rate screenshot URL', 'Booking screenshot URL', 'Menu PDF URL',
    'Published URL', 'Notes', 'Other event dates', 'Exclusive member event'
  ];
}

function getOrCreateAllowedDomainsFile_(properties, rootFolder) {
  var configuredId = properties.getProperty('ALLOWED_DOMAINS_SPREADSHEET_ID');
  if (configuredId) {
    try {
      return { spreadsheet: SpreadsheetApp.openById(configuredId) };
    } catch (error) {
      properties.deleteProperty('ALLOWED_DOMAINS_SPREADSHEET_ID');
    }
  }

  var fileName = 'Explorer Offers - Allowed Domains';
  var matches = rootFolder.getFilesByName(fileName);
  if (matches.hasNext()) {
    var existing = SpreadsheetApp.openById(matches.next().getId());
    properties.setProperty('ALLOWED_DOMAINS_SPREADSHEET_ID', existing.getId());
    return { spreadsheet: existing };
  }

  var spreadsheet = SpreadsheetApp.create(fileName);
  DriveApp.getFileById(spreadsheet.getId()).moveTo(rootFolder);
  var sheet = spreadsheet.getSheets()[0];
  sheet.setName('Allowed Domains');
  sheet.getRange('A1:D3').setValues([
    ['Domain', 'Enabled', 'Notes', 'Expires'],
    ['accor.com', true, 'Permanent Accor access', ''],
    ['accorplus.com', true, 'Permanent Accor Plus access', ''],
  ]);
  sheet.setFrozenRows(1);
  sheet.getRange('B2:B3').insertCheckboxes();
  sheet.autoResizeColumns(1, 4);
  properties.setProperty('ALLOWED_DOMAINS_SPREADSHEET_ID', spreadsheet.getId());
  return { spreadsheet: spreadsheet };
}

function readAllowedDomains_(spreadsheet) {
  var sheet = spreadsheet.getSheetByName('Allowed Domains') || spreadsheet.getSheets()[0];
  if (sheet.getLastRow() < 2) return [];
  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues();
  var today = new Date();
  return rows.reduce(function(domains, row) {
    var domain = String(row[0] || '').trim().toLowerCase();
    var enabled = row[1] === true || /^(true|yes|1)$/i.test(String(row[1] || '').trim());
    var expiry = row[3];
    var expired = expiry && new Date(expiry).getTime() < today.getTime();
    if (enabled && !expired && /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain)) domains.push(domain);
    return domains;
  }, []);
}

function jsonResponse_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}

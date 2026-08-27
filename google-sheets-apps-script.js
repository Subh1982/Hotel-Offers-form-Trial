const SHEET_NAME = "Offer Submissions";

const HEADERS = [
  "offer_id",
  "database_id",
  "status",
  "generated_at",
  "email",
  "person_in_charge_name",
  "hotel_rid_code",
  "hotel_name",
  "city_country",
  "offer_type",
  "offer_tile_title",
  "offer_banner_title",
  "offer_subtitle",
  "offer_description",
  "meta_description",
  "booking_link",
  "booking_start_date",
  "booking_end_date",
  "stay_start_date",
  "stay_end_date",
  "offer_validity_start_date",
  "offer_validity_end_date",
  "event_date",
  "event_time",
  "venue",
  "partner_name",
  "member_benefits",
  "price",
  "terms",
  "department_confirmation",
  "acknowledgement",
  "banner_image_url",
  "listing_tile_image_url",
  "social_image_url",
  "offer_details_json",
  "translations_json",
  "files_json",
];

function doPost(e) {
  const payload = JSON.parse(e.postData.contents || "{}");
  const offer = payload.offer || {};
  const sheet = getSheet();
  const row = HEADERS.map((header) => offer[header] || "");
  const existingRow = findOfferRow(sheet, offer.offer_id);

  if (existingRow) {
    sheet.getRange(existingRow, 1, 1, HEADERS.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
  const firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const headersMatch = HEADERS.every((header, index) => firstRow[index] === header);

  if (!headersMatch) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }

  return sheet;
}

function findOfferRow(sheet, offerId) {
  if (!offerId || sheet.getLastRow() < 2) return null;
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
  const index = values.findIndex((row) => row[0] === offerId);
  return index === -1 ? null : index + 2;
}

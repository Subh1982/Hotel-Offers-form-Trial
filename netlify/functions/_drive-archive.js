function clean(value) {
  return String(value || "").trim().replace(/^(['"])(.*)\1$/, "$2").trim();
}

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
  return value >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function dosTimestamp(date = new Date()) {
  const year = Math.max(1980, date.getUTCFullYear());
  return {
    time: (date.getUTCHours() << 11) | (date.getUTCMinutes() << 5) | Math.floor(date.getUTCSeconds() / 2),
    date: ((year - 1980) << 9) | ((date.getUTCMonth() + 1) << 5) | date.getUTCDate(),
  };
}

function createZip(files) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  const stamp = dosTimestamp();
  for (const file of files) {
    const name = Buffer.from(file.name, "utf8");
    const data = Buffer.isBuffer(file.data) ? file.data : Buffer.from(String(file.data), "utf8");
    const checksum = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(0, 8); local.writeUInt16LE(stamp.time, 10); local.writeUInt16LE(stamp.date, 12);
    local.writeUInt32LE(checksum, 14); local.writeUInt32LE(data.length, 18); local.writeUInt32LE(data.length, 22); local.writeUInt16LE(name.length, 26);
    locals.push(local, name, data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6); central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(0, 10); central.writeUInt16LE(stamp.time, 12); central.writeUInt16LE(stamp.date, 14);
    central.writeUInt32LE(checksum, 16); central.writeUInt32LE(data.length, 20); central.writeUInt32LE(data.length, 24); central.writeUInt16LE(name.length, 28); central.writeUInt32LE(offset, 42);
    centrals.push(central, name);
    offset += local.length + name.length + data.length;
  }
  const centralSize = centrals.reduce((sum, part) => sum + part.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralSize, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, ...centrals, end]);
}

function safePart(value, fallback) {
  return String(value || fallback).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || fallback;
}

function archiveFilename(offer) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(offer.submission_date || "") ? offer.submission_date : String(offer.generated_at || new Date().toISOString()).slice(0, 10);
  return `${date}_${safePart(offer.offer_type, "offer")}_${safePart(offer.hotel_rid_code, "no-rid")}.zip`;
}

function summary(offer) {
  const details = Object.entries(offer.offer_details || {}).filter(([, value]) => value).map(([key, value]) => `${key.replace(/_/g, " ")}: ${value}`);
  return [`Explorer Offer ID: ${offer.offer_id}`, `Submitted: ${offer.generated_at}`, `Submitter: ${offer.person_in_charge_name} (${offer.email})`, `Hotel: ${offer.hotel_name}`, `Hotel RID code: ${offer.hotel_rid_code}`, `Offer type: ${offer.offer_type}`, `Offer title: ${offer.offer_tile_title}`, "", "Offer details", ...details, "", "Offer description", offer.offer_description || "", "", "Terms and conditions", offer.terms || ""].join("\n");
}

function buildArchive(offer) {
  const files = [
    { name: "submission.json", data: `${JSON.stringify(offer, null, 2)}\n` },
    { name: "submission-summary.txt", data: summary(offer) },
  ];
  Object.values(offer.auto_translations || {}).forEach((item) => {
    if (!item?.text) return;
    files.push({ name: `translations/${safePart(item.language_code || item.language, "translation")}.txt`, data: String(item.text) });
  });
  return createZip(files);
}

async function uploadOfferArchive(offer) {
  const webhookUrl = clean(process.env.GOOGLE_APPS_SCRIPT_WEBHOOK_URL);
  const webhookSecret = clean(process.env.GOOGLE_APPS_SCRIPT_SECRET);
  if (!webhookUrl || !webhookSecret) throw new Error("Google Apps Script storage is not configured.");
  if (!/^https:\/\/script\.google\.com\//.test(webhookUrl)) throw new Error("GOOGLE_APPS_SCRIPT_WEBHOOK_URL must be a Google Apps Script deployment URL.");
  const filename = archiveFilename(offer);
  const zip = buildArchive(offer);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  let response;
  try {
    response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        secret: webhookSecret,
        filename,
        mime_type: "application/zip",
        archive_base64: zip.toString("base64"),
        offer: { offer_id: offer.offer_id, submission_date: offer.submission_date, generated_at: offer.generated_at, offer_type: offer.offer_type, hotel_rid_code: offer.hotel_rid_code, hotel_name: offer.hotel_name, offer_title: offer.offer_tile_title, submitter_email: offer.email },
      }),
      redirect: "follow",
      signal: controller.signal,
    });
  } catch (error) {
    throw new Error(error.name === "AbortError" ? "Google Apps Script storage timed out." : "Google Apps Script storage could not be reached.");
  } finally {
    clearTimeout(timeout);
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.ok) throw new Error(result.error || `Google Apps Script storage failed (${response.status}).`);
  return { ok: true, id: result.file_id, name: result.file_name || filename, size: result.file_size, webViewLink: result.file_url, sheet_updated: Boolean(result.sheet_updated) };
}

module.exports = { archiveFilename, buildArchive, uploadOfferArchive };

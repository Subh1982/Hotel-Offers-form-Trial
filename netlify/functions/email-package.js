function json(statusCode, body) {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}

function parseDatabaseId(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const match = text.match(/(\d+)$/);
  return match ? String(Number(match[1])) : "";
}

function formatOfferId(id) {
  const numericId = Number(id);
  if (!Number.isFinite(numericId) || numericId <= 0) return "";
  return `EXP-${new Date().getFullYear()}-${String(numericId).padStart(6, "0")}`;
}

function sheetRowForOffer(offer) {
  const details = offer.offer_details || {};
  const files = offer.files || {};
  return {
    offer_id: offer.offer_id,
    database_id: offer.id,
    status: offer.status,
    generated_at: offer.generated_at,
    email: offer.email,
    person_in_charge_name: offer.person_in_charge_name,
    hotel_rid_code: offer.hotel_rid_code,
    hotel_name: offer.hotel_name,
    city_country: offer.city_country,
    offer_type: offer.offer_type,
    offer_tile_title: offer.offer_tile_title,
    offer_banner_title: offer.offer_banner_title,
    offer_subtitle: offer.offer_subtitle,
    offer_description: offer.offer_description,
    meta_description: offer.meta_description,
    booking_link: offer.booking_link,
    booking_start_date: details.booking_start_date || "",
    booking_end_date: details.booking_end_date || "",
    stay_start_date: details.stay_start_date || "",
    stay_end_date: details.stay_end_date || "",
    offer_validity_start_date: details.offer_validity_start_date || "",
    offer_validity_end_date: details.offer_validity_end_date || "",
    event_date: details.event_date || "",
    event_time: details.event_time || "",
    venue: details.venue || "",
    partner_name: details.partner_name || "",
    member_benefits: details.member_benefits || "",
    price: details.price || details.member_price || details.discounted_price || details.member_package_price || details.member_price_per_night || "",
    terms: offer.terms,
    department_confirmation: offer.department_confirmation,
    acknowledgement: offer.acknowledgement,
    banner_image_url: files.banner_image?.public_url || "",
    listing_tile_image_url: files.listing_tile_image?.public_url || "",
    social_image_url: files.social_image?.public_url || "",
    package_zip_url: files.package_zip?.public_url || "",
    offer_details_json: JSON.stringify(details),
    translations_json: JSON.stringify(offer.auto_translations || offer.translations || {}),
    files_json: JSON.stringify(offer.files || {}),
  };
}

async function syncOfferToSheet(action, offer, webhookUrl) {
  if (!webhookUrl) return { skipped: true };

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action, offer: sheetRowForOffer(offer) }),
  });

  const text = await response.text();
  if (!response.ok) return { ok: false, error: text || "Google Sheets sync failed." };
  return { ok: true };
}

async function sendPackageEmail(offer, packageFile, webhookUrl) {
  if (!webhookUrl) return { skipped: true };

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      action: "email_package_link",
      offer: sheetRowForOffer(offer),
      package_file: packageFile,
    }),
  });

  const text = await response.text();
  if (!response.ok) return { ok: false, error: text || "Package email failed." };
  return { ok: true };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return json(500, { error: "Supabase environment variables are not configured." });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (error) {
    return json(400, { error: "Invalid JSON payload." });
  }

  const id = parseDatabaseId(payload.id || payload.offer_id);
  const packageFile = payload.package_file || {};

  if (!id) return json(400, { error: "Offer database ID or Offer ID is required." });
  if (!packageFile.public_url || !packageFile.storage_path) return json(400, { error: "Package link is required." });

  const getResponse = await fetch(`${supabaseUrl}/rest/v1/offer_submissions?id=eq.${id}&select=*`, {
    headers: {
      apikey: supabaseServiceRoleKey,
      authorization: `Bearer ${supabaseServiceRoleKey}`,
      "content-type": "application/json",
    },
  });
  const getText = await getResponse.text();
  if (!getResponse.ok) return json(getResponse.status, { error: "Could not fetch offer.", details: getText });

  const rows = JSON.parse(getText || "[]");
  if (!rows.length) return json(404, { error: "Offer not found." });

  const currentOffer = rows[0];
  const files = {
    ...(currentOffer.files || {}),
    package_zip: {
      file_name: packageFile.file_name || "explorer-offer-submission.zip",
      file_type: "application/zip",
      file_size_kb: packageFile.file_size_kb || "",
      storage_bucket: packageFile.storage_bucket,
      storage_path: packageFile.storage_path,
      public_url: packageFile.public_url,
    },
  };

  const patchResponse = await fetch(`${supabaseUrl}/rest/v1/offer_submissions?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: supabaseServiceRoleKey,
      authorization: `Bearer ${supabaseServiceRoleKey}`,
      "content-type": "application/json",
      prefer: "return=representation",
    },
    body: JSON.stringify({ files }),
  });

  const patchText = await patchResponse.text();
  if (!patchResponse.ok) return json(patchResponse.status, { error: "Could not save package link.", details: patchText });

  const updatedRows = JSON.parse(patchText || "[]");
  const updatedOffer = { ...(updatedRows[0] || currentOffer), offer_id: formatOfferId(id) };
  const sheets = await syncOfferToSheet("update", updatedOffer, webhookUrl);
  const email = await sendPackageEmail(updatedOffer, files.package_zip, webhookUrl);

  return json(200, { ok: true, offer_id: updatedOffer.offer_id, package_file: files.package_zip, sheets, email });
};

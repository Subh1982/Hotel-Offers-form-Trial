function json(statusCode, body) {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}

function formatOfferId(id) {
  const numericId = Number(id);
  if (!Number.isFinite(numericId) || numericId <= 0) return "";
  return `EXP-${new Date().getFullYear()}-${String(numericId).padStart(6, "0")}`;
}

function safeName(value) {
  return String(value || "asset")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90) || "asset";
}

function publicStorageUrl(supabaseUrl, bucket, path) {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path.split("/").map(encodeURIComponent).join("/")}`;
}

async function uploadAssetToStorage({ supabaseUrl, supabaseServiceRoleKey, offerId, asset }) {
  if (!asset?.field || !asset?.data_base64) return null;

  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "offer-assets";
  const filename = safeName(asset.file_name || `${asset.field}.jpg`);
  const path = `${offerId}/${asset.field}/${Date.now()}-${filename}`;
  const bytes = Buffer.from(asset.data_base64, "base64");
  const response = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${path}`, {
    method: "POST",
    headers: {
      apikey: supabaseServiceRoleKey,
      authorization: `Bearer ${supabaseServiceRoleKey}`,
      "content-type": asset.file_type || "application/octet-stream",
      "x-upsert": "true",
    },
    body: bytes,
  });

  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`Supabase Storage upload failed for ${asset.field}: ${responseText}`);
  }

  return {
    field: asset.field,
    file_name: filename,
    file_type: asset.file_type || "application/octet-stream",
    file_size_kb: asset.file_size_kb || Math.round(bytes.length / 1024),
    storage_bucket: bucket,
    storage_path: path,
    public_url: publicStorageUrl(supabaseUrl, bucket, path),
  };
}

async function uploadAssets({ supabaseUrl, supabaseServiceRoleKey, offerId, files, assets }) {
  const updatedFiles = { ...(files || {}) };

  for (const asset of assets || []) {
    const uploaded = await uploadAssetToStorage({ supabaseUrl, supabaseServiceRoleKey, offerId, asset });
    if (uploaded) updatedFiles[uploaded.field] = uploaded;
  }

  return updatedFiles;
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
    offer_details_json: JSON.stringify(details),
    translations_json: JSON.stringify(offer.auto_translations || offer.translations || {}),
    files_json: JSON.stringify(offer.files || {}),
  };
}

async function syncOfferToSheet(action, offer) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) return { skipped: true };

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action, offer: sheetRowForOffer(offer) }),
  });

  const text = await response.text();
  if (!response.ok) {
    return { ok: false, error: text || "Google Sheets sync failed." };
  }

  return { ok: true };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return json(500, { error: "Supabase environment variables are not configured." });
  }

  let submission;
  try {
    submission = JSON.parse(event.body || "{}");
  } catch (error) {
    return json(400, { error: "Invalid JSON payload." });
  }

  const payload = {
    generated_at: submission.generated_at,
    email: submission.email,
    person_in_charge_name: submission.person_in_charge_name,
    hotel_rid_code: submission.hotel_rid_code,
    hotel_name: submission.hotel_name,
    city_country: submission.city_country,
    offer_type: submission.offer_type,
    offer_tile_title: submission.offer_tile_title,
    offer_banner_title: submission.offer_banner_title,
    offer_subtitle: submission.offer_subtitle,
    offer_description: submission.offer_description,
    meta_description: submission.meta_description,
    offer_details: submission.offer_details || {},
    booking_link: submission.booking_link,
    terms: submission.terms,
    translations: submission.translations || {},
    auto_translations: submission.auto_translations || {},
    files: submission.files || {},
    department_confirmation: submission.department_confirmation,
    acknowledgement: submission.acknowledgement,
    status: "submitted",
  };

  const response = await fetch(`${supabaseUrl}/rest/v1/offer_submissions`, {
    method: "POST",
    headers: {
      apikey: supabaseServiceRoleKey,
      authorization: `Bearer ${supabaseServiceRoleKey}`,
      "content-type": "application/json",
      prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  if (!response.ok) {
    return json(response.status, { error: "Supabase insert failed.", details: responseText });
  }

  let inserted = [];
  try {
    inserted = JSON.parse(responseText);
  } catch (error) {
    inserted = [];
  }

  const savedOffer = inserted[0] || {};
  let offerWithId = { ...savedOffer, offer_id: formatOfferId(savedOffer.id) };
  const updatedFiles = await uploadAssets({
    supabaseUrl,
    supabaseServiceRoleKey,
    offerId: offerWithId.offer_id,
    files: savedOffer.files,
    assets: submission.asset_uploads,
  });

  if (submission.asset_uploads?.length) {
    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/offer_submissions?id=eq.${savedOffer.id}`, {
      method: "PATCH",
      headers: {
        apikey: supabaseServiceRoleKey,
        authorization: `Bearer ${supabaseServiceRoleKey}`,
        "content-type": "application/json",
        prefer: "return=representation",
      },
      body: JSON.stringify({ files: updatedFiles }),
    });

    const updateText = await updateResponse.text();
    if (!updateResponse.ok) {
      return json(updateResponse.status, { error: "Supabase file URL update failed.", details: updateText });
    }

    const updatedRows = JSON.parse(updateText || "[]");
    offerWithId = { ...(updatedRows[0] || savedOffer), offer_id: offerWithId.offer_id };
  }

  const sheets = await syncOfferToSheet("create", offerWithId);

  return json(200, { ok: true, id: savedOffer.id || null, offer_id: offerWithId.offer_id, offer: offerWithId, sheets });
};

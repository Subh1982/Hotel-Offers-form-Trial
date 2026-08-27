function json(statusCode, body) {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}

function parseOfferId(value) {
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
  if (!["PATCH", "POST"].includes(event.httpMethod)) {
    return json(405, { error: "Method not allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return json(500, { error: "Supabase environment variables are not configured." });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (error) {
    return json(400, { error: "Invalid JSON payload." });
  }

  const submission = body.submission || body;
  const id = parseOfferId(body.offer_id || submission.offer_id || submission.id);
  const verificationEmail = String(body.verify_email || submission.email || "").trim();

  if (!id) return json(400, { error: "Offer ID is required." });
  if (!verificationEmail) return json(400, { error: "Submitter email is required to update an offer." });

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
    status: "updated",
  };

  const params = new URLSearchParams({
    id: `eq.${id}`,
    email: `eq.${verificationEmail}`,
  });

  const response = await fetch(`${supabaseUrl}/rest/v1/offer_submissions?${params.toString()}`, {
    method: "PATCH",
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
    return json(response.status, { error: "Supabase update failed.", details: responseText });
  }

  let updated = [];
  try {
    updated = JSON.parse(responseText);
  } catch (error) {
    updated = [];
  }

  if (!updated.length) {
    return json(404, { error: "No matching offer found for that Offer ID and submitter email." });
  }

  const updatedOffer = { ...updated[0], offer_id: formatOfferId(updated[0].id) };
  const sheets = await syncOfferToSheet("update", updatedOffer);

  return json(200, {
    ok: true,
    id: updated[0].id,
    offer_id: updatedOffer.offer_id,
    offer: updatedOffer,
    sheets,
  });
};

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

  return json(200, {
    ok: true,
    id: updated[0].id,
    offer_id: formatOfferId(updated[0].id),
    offer: { ...updated[0], offer_id: formatOfferId(updated[0].id) },
  });
};

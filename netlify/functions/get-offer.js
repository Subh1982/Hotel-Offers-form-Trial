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

function addFilter(params, field, operator, value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return;
  params.set(field, `${operator}.${trimmed}`);
}

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return json(405, { error: "Method not allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return json(500, { error: "Supabase environment variables are not configured." });
  }

  const query = event.queryStringParameters || {};
  const id = parseOfferId(query.offer_id || query.id);
  const email = String(query.email || "").trim();
  const hotelName = String(query.hotel_name || "").trim();
  const hotelCode = String(query.hotel_rid_code || query.hotel_code || "").trim();

  if (!id && !email && !hotelName && !hotelCode) {
    return json(400, { error: "Enter an Offer ID, submitter email, hotel name, or hotel code." });
  }

  const params = new URLSearchParams();
  params.set("select", "*");
  params.set("order", "created_at.desc");
  params.set("limit", id ? "1" : "10");

  if (id) params.set("id", `eq.${id}`);
  addFilter(params, "email", "ilike", email ? `*${email}*` : "");
  addFilter(params, "hotel_name", "ilike", hotelName ? `*${hotelName}*` : "");
  addFilter(params, "hotel_rid_code", "ilike", hotelCode ? `*${hotelCode}*` : "");

  const response = await fetch(`${supabaseUrl}/rest/v1/offer_submissions?${params.toString()}`, {
    headers: {
      apikey: supabaseServiceRoleKey,
      authorization: `Bearer ${supabaseServiceRoleKey}`,
      "content-type": "application/json",
    },
  });

  const responseText = await response.text();
  if (!response.ok) {
    return json(response.status, { error: "Supabase lookup failed.", details: responseText });
  }

  let offers = [];
  try {
    offers = JSON.parse(responseText);
  } catch (error) {
    offers = [];
  }

  const results = offers.map((offer) => ({
    ...offer,
    offer_id: formatOfferId(offer.id),
  }));

  return json(200, { ok: true, offers: results });
};

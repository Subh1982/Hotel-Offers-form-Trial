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
  const match = text.match(/EXP-\d{4}-\d+$/i);
  return match ? match[0].toUpperCase() : text.replace(/[^a-zA-Z0-9-]/g, "-");
}

function safeName(value) {
  return String(value || "explorer-offer-submission.zip")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120) || "explorer-offer-submission.zip";
}

function publicStorageUrl(supabaseUrl, bucket, path) {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path.split("/").map(encodeURIComponent).join("/")}`;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "offer-assets";

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return json(500, { error: "Supabase environment variables are not configured." });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (error) {
    return json(400, { error: "Invalid JSON payload." });
  }

  const offerId = parseOfferId(payload.offer_id);
  if (!offerId) return json(400, { error: "Offer ID is required." });

  const filename = safeName(payload.file_name);
  const path = `${offerId}/packages/${Date.now()}-${filename}`;
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const response = await fetch(`${supabaseUrl}/storage/v1/object/upload/sign/${bucket}/${encodedPath}`, {
    method: "POST",
    headers: {
      apikey: supabaseServiceRoleKey,
      authorization: `Bearer ${supabaseServiceRoleKey}`,
      "content-type": "application/json",
      "x-upsert": "true",
    },
    body: JSON.stringify({ expiresIn: 7200 }),
  });

  const text = await response.text();
  if (!response.ok) {
    return json(response.status, { error: "Could not create package upload URL.", details: text });
  }

  let result = {};
  try {
    result = JSON.parse(text);
  } catch (error) {
    result = {};
  }

  const signedUrl = result.signedURL || result.signedUrl || result.url;
  if (!signedUrl) {
    return json(500, { error: "Supabase did not return a signed upload URL.", details: result });
  }

  const absoluteSignedUrl = signedUrl.startsWith("http") ? signedUrl : `${supabaseUrl}/storage/v1${signedUrl}`;

  return json(200, {
    ok: true,
    bucket,
    path,
    signed_url: absoluteSignedUrl,
    public_url: publicStorageUrl(supabaseUrl, bucket, path),
  });
};

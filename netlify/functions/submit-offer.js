function json(statusCode, body) {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}

const { requireAuth } = require("./_auth");

function cleanEnvironmentValue(value) {
  return String(value || "").trim().replace(/^(['"])(.*)\1$/, "$2").trim();
}

async function verifyTurnstileToken(token, remoteIp = "") {
  const secret = cleanEnvironmentValue(process.env.TURNSTILE_SECRET_KEY);
  if (!secret) return { ok: false, status: 500, error: "Turnstile is not configured." };
  if (!token) return { ok: false, status: 403, error: "Submission verification is required." };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const body = new URLSearchParams({ secret, response: String(token) });
    if (remoteIp) body.set("remoteip", remoteIp);
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      signal: controller.signal,
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.success) {
      console.warn("Turnstile verification rejected", result["error-codes"] || response.status);
      return { ok: false, status: 403, error: "Submission verification failed." };
    }

    const allowedHostnames = cleanEnvironmentValue(process.env.TURNSTILE_ALLOWED_HOSTNAMES || "hotelsoffer.netlify.app")
      .split(",")
      .map((hostname) => hostname.trim().toLowerCase())
      .filter(Boolean);
    if (result.action !== "submit_offer" || !allowedHostnames.includes(String(result.hostname || "").toLowerCase())) {
      console.warn("Turnstile verification context mismatch", { action: result.action, hostname: result.hostname });
      return { ok: false, status: 403, error: "Submission verification failed." };
    }

    return { ok: true };
  } catch (error) {
    console.error("Turnstile verification request failed", error);
    return { ok: false, status: 502, error: "Submission verification service could not be reached." };
  } finally {
    clearTimeout(timeout);
  }
}

function supabaseProjectUrl(value) {
  const cleaned = cleanEnvironmentValue(value).replace(/\/+$/, "");
  if (!cleaned) return { error: "SUPABASE_URL is not configured." };

  try {
    const url = new URL(cleaned);
    if (url.protocol !== "https:") {
      return { error: "SUPABASE_URL must be the HTTPS project URL, not a database connection string." };
    }
    return { url: url.toString().replace(/\/+$/, ""), host: url.host };
  } catch (error) {
    return { error: "SUPABASE_URL is not a valid URL." };
  }
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
    package_zip_url: files.package_zip?.public_url || "",
    offer_details_json: JSON.stringify(details),
    translations_json: JSON.stringify(offer.auto_translations || offer.translations || {}),
    files_json: JSON.stringify(offer.files || {}),
  };
}

async function syncOfferToSheet(action, offer) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) return { skipped: true };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({ action, offer: sheetRowForOffer(offer) }),
    });

    const text = await response.text();
    if (!response.ok) {
      return { ok: false, error: text || "Google Sheets sync failed." };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.name === "AbortError" ? "Google Sheets sync timed out." : error.message };
  } finally {
    clearTimeout(timeout);
  }
}

function asanaTaskNotes(offer) {
  const details = offer.offer_details || {};
  const detailLines = Object.entries(details)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key.replace(/_/g, " ")}: ${value}`);

  return [
    `Explorer Offer ID: ${offer.offer_id}`,
    `Status: ${offer.status || "submitted"}`,
    `Hotel / partner: ${offer.hotel_name || details.partner_name || "Not provided"}`,
    `Hotel RID code: ${offer.hotel_rid_code || "Not provided"}`,
    `City / country: ${offer.city_country || "Not provided"}`,
    `Offer type: ${offer.offer_type || "Not provided"}`,
    `Offer title: ${offer.offer_tile_title || "Not provided"}`,
    `Offer banner title: ${offer.offer_banner_title || "Not provided"}`,
    `Offer subtitle: ${offer.offer_subtitle || "Not provided"}`,
    `Submitter: ${offer.person_in_charge_name || "Not provided"} (${offer.email || "No email"})`,
    `Booking method: ${details.booking_method || "Not provided"}`,
    `Booking details: ${offer.booking_link || details.booking_email || "Not provided"}`,
    "",
    "Offer description",
    offer.offer_description || "Not provided",
    "",
    "Offer details",
    ...(detailLines.length ? detailLines : ["Not provided"]),
    "",
    "Terms and conditions",
    offer.terms || "Not provided",
  ].join("\n");
}

async function createAsanaTask(offer) {
  const accessToken = process.env.ASANA_ACCESS_TOKEN;
  const projectGid = process.env.ASANA_PROJECT_GID;
  const assigneeGid = process.env.ASANA_ASSIGNEE_GID;

  if (!accessToken || !projectGid) {
    return {
      ok: false,
      skipped: true,
      error: "Asana is not configured. Add ASANA_ACCESS_TOKEN and ASANA_PROJECT_GID in Netlify.",
    };
  }

  const taskData = {
    name: `[${offer.offer_id}] ${offer.offer_tile_title || offer.offer_banner_title || "New Explorer offer"}`.slice(0, 255),
    notes: asanaTaskNotes(offer),
    projects: [projectGid],
  };
  if (assigneeGid) taskData.assignee = assigneeGid;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch("https://app.asana.com/api/1.0/tasks?opt_fields=gid,name,permalink_url", {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({ data: taskData }),
    });
    const responseText = await response.text();

    if (!response.ok) {
      return { ok: false, error: `Asana task creation failed (${response.status}).`, details: responseText };
    }

    const result = JSON.parse(responseText || "{}");
    return {
      ok: true,
      gid: result.data?.gid || "",
      name: result.data?.name || taskData.name,
      permalink_url: result.data?.permalink_url || "",
    };
  } catch (error) {
    return {
      ok: false,
      error: error.name === "AbortError" ? "Asana task creation timed out." : error.message || "Asana task creation failed.",
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function attachImagesToAsanaTask(taskGid, assets) {
  const accessToken = cleanEnvironmentValue(process.env.ASANA_ACCESS_TOKEN);
  const images = (assets || []).filter((asset) => asset?.data_base64 && String(asset.file_type || "").startsWith("image/"));
  const results = [];

  for (const asset of images) {
    try {
      const bytes = Buffer.from(asset.data_base64, "base64");
      const form = new FormData();
      form.append("parent", taskGid);
      form.append("file", new Blob([bytes], { type: asset.file_type }), asset.file_name || `${asset.field || "image"}.jpg`);
      const response = await fetch("https://app.asana.com/api/1.0/attachments", {
        method: "POST",
        headers: { authorization: `Bearer ${accessToken}` },
        body: form,
      });
      const responseText = await response.text();
      if (!response.ok) {
        results.push({ file_name: asset.file_name, ok: false, error: `Asana attachment failed (${response.status}).` });
        console.error("Asana attachment upload failed", responseText);
        continue;
      }
      const result = JSON.parse(responseText || "{}");
      results.push({ file_name: asset.file_name, ok: true, gid: result.data?.gid || "" });
    } catch (error) {
      console.error("Asana attachment request failed", error);
      results.push({ file_name: asset.file_name, ok: false, error: error.message || "Asana attachment upload failed." });
    }
  }

  return {
    attempted: images.length,
    attached: results.filter((result) => result.ok).length,
    failed: results.filter((result) => !result.ok).length,
    results,
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const auth = await requireAuth(event);
  if (!auth.ok) return auth.response;

  let submission;
  try {
    submission = JSON.parse(event.body || "{}");
  } catch (error) {
    return json(400, { error: "Invalid JSON payload." });
  }

  const forwardedFor = String(event.headers?.["x-forwarded-for"] || event.headers?.["X-Forwarded-For"] || "")
    .split(",")[0]
    .trim();
  const verification = await verifyTurnstileToken(submission.turnstile_token, forwardedFor);
  if (!verification.ok) {
    return json(verification.status, { error: verification.error, service: "turnstile" });
  }

  const offer = {
    id: null,
    offer_id: `ASANA-TEST-${Date.now()}`,
    generated_at: submission.generated_at,
    email: auth.email,
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
  const asana = await createAsanaTask(offer);
  if (!asana.ok) {
    return json(asana.skipped ? 500 : 502, {
      error: asana.error || "Asana task creation failed.",
      details: asana.details,
      service: "asana",
    });
  }
  const attachments = await attachImagesToAsanaTask(asana.gid, submission.asset_uploads);

  return json(200, {
    ok: true,
    mode: "asana_only",
    id: null,
    offer_id: offer.offer_id,
    offer,
    asana,
    attachments,
  });
};

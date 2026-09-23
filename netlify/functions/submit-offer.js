const { requireAuth } = require("./_auth");

function json(statusCode, body) {
  return { statusCode, headers: { "content-type": "application/json" }, body: JSON.stringify(body) };
}

function cleanEnvironmentValue(value) {
  return String(value || "").trim().replace(/^(['"])(.*)\1$/, "$2").trim();
}

async function verifyTurnstileToken(token, remoteIp = "") {
  const secret = cleanEnvironmentValue(process.env.TURNSTILE_SECRET_KEY);
  if (!secret) return { ok: false, status: 500, error: "Turnstile is not configured." };
  if (!token) return { ok: false, status: 403, error: "Submission verification is required." };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
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

function createOfferId() {
  const date = new Date();
  const stamp = [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
    String(date.getUTCHours()).padStart(2, "0"),
    String(date.getUTCMinutes()).padStart(2, "0"),
    String(date.getUTCSeconds()).padStart(2, "0"),
  ].join("");
  return `EXP-${stamp}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function savedTranslationSections(offer) {
  const sections = [];
  Object.values(offer.auto_translations || {}).forEach((item) => {
    if (!item?.text) return;
    const target = item.language || item.language_code || "Translation";
    const source = item.source_language || item.source_language_code || "source language";
    sections.push(`${target} (translated from ${source})\n${String(item.text).trim()}`);
  });
  Object.entries(offer.translations || {}).forEach(([language, text]) => {
    if (String(text || "").trim()) sections.push(`${language.replace(/_/g, "-").toUpperCase()}\n${String(text).trim()}`);
  });
  return sections;
}

function asanaTaskNotes(offer) {
  const details = offer.offer_details || {};
  const detailLines = Object.entries(details)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key.replace(/_/g, " ")}: ${value}`);
  const translations = savedTranslationSections(offer);

  return [
    `Explorer Offer ID: ${offer.offer_id}`,
    `Status: ${offer.status}`,
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
    "", "Offer description", offer.offer_description || "Not provided",
    "", "Offer details", ...(detailLines.length ? detailLines : ["Not provided"]),
    "", "Terms and conditions", offer.terms || "Not provided",
    "", "Saved translations", ...(translations.length ? translations.flatMap((value, index) => index ? ["", value] : [value]) : ["No saved translations"]),
  ].join("\n");
}

async function createAsanaTask(offer) {
  const accessToken = cleanEnvironmentValue(process.env.ASANA_ACCESS_TOKEN);
  const projectGid = cleanEnvironmentValue(process.env.ASANA_PROJECT_GID);
  const assigneeGid = cleanEnvironmentValue(process.env.ASANA_ASSIGNEE_GID);
  if (!accessToken || !projectGid) {
    return { ok: false, skipped: true, error: "Asana is not configured. Add ASANA_ACCESS_TOKEN and ASANA_PROJECT_GID in Netlify." };
  }

  const taskData = {
    name: `[${offer.offer_id}] ${offer.offer_tile_title || offer.offer_banner_title || "New Explorer offer"}`.slice(0, 255),
    notes: asanaTaskNotes(offer),
    projects: [projectGid],
  };
  if (assigneeGid) taskData.assignee = assigneeGid;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch("https://app.asana.com/api/1.0/tasks?opt_fields=gid,name,permalink_url", {
      method: "POST",
      headers: { accept: "application/json", authorization: `Bearer ${accessToken}`, "content-type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({ data: taskData }),
    });
    const responseText = await response.text();
    if (!response.ok) return { ok: false, error: `Asana task creation failed (${response.status}).`, details: responseText };
    const result = JSON.parse(responseText || "{}");
    return { ok: true, gid: result.data?.gid || "", name: result.data?.name || taskData.name, permalink_url: result.data?.permalink_url || "" };
  } catch (error) {
    return { ok: false, error: error.name === "AbortError" ? "Asana task creation timed out." : error.message || "Asana task creation failed." };
  } finally {
    clearTimeout(timeout);
  }
}

async function attachImagesToAsanaTask(taskGid, assets) {
  const accessToken = cleanEnvironmentValue(process.env.ASANA_ACCESS_TOKEN);
  const images = (assets || []).filter((asset) => asset?.data_base64 && String(asset.file_type || "").startsWith("image/"));
  const results = await Promise.all(images.map(async (asset) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const bytes = Buffer.from(asset.data_base64, "base64");
      const form = new FormData();
      form.append("parent", taskGid);
      form.append("file", new Blob([bytes], { type: asset.file_type }), asset.file_name || `${asset.field || "image"}.jpg`);
      const response = await fetch("https://app.asana.com/api/1.0/attachments", {
        method: "POST",
        headers: { authorization: `Bearer ${accessToken}` },
        body: form,
        signal: controller.signal,
      });
      const responseText = await response.text();
      if (!response.ok) {
        console.error("Asana attachment upload failed", responseText);
        return { file_name: asset.file_name, ok: false, error: `Asana attachment failed (${response.status}).` };
      }
      const result = JSON.parse(responseText || "{}");
      return { file_name: asset.file_name, ok: true, gid: result.data?.gid || "" };
    } catch (error) {
      console.error("Asana attachment request failed", error);
      return {
        file_name: asset.file_name,
        ok: false,
        error: error.name === "AbortError" ? "Asana attachment upload timed out." : error.message || "Asana attachment upload failed.",
      };
    } finally {
      clearTimeout(timeout);
    }
  }));
  return {
    attempted: images.length,
    attached: results.filter((result) => result.ok).length,
    failed: results.filter((result) => !result.ok).length,
    results,
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  const auth = await requireAuth(event);
  if (!auth.ok) return auth.response;

  let submission;
  try {
    submission = JSON.parse(event.body || "{}");
  } catch (error) {
    return json(400, { error: "Invalid JSON payload." });
  }

  const forwardedFor = String(event.headers?.["x-forwarded-for"] || event.headers?.["X-Forwarded-For"] || "").split(",")[0].trim();
  const verification = await verifyTurnstileToken(submission.turnstile_token, forwardedFor);
  if (!verification.ok) return json(verification.status, { error: verification.error, service: "turnstile" });

  const offer = {
    offer_id: createOfferId(),
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
    acknowledgement: submission.acknowledgement,
    status: "submitted",
  };

  const asana = await createAsanaTask(offer);
  if (!asana.ok) return json(asana.skipped ? 500 : 502, { error: asana.error, details: asana.details, service: "asana" });
  const attachments = await attachImagesToAsanaTask(asana.gid, submission.asset_uploads);
  return json(200, { ok: true, offer_id: offer.offer_id, asana, attachments });
};

exports._test = { asanaTaskNotes, savedTranslationSections };

const dns = require("node:dns").promises;
const net = require("node:net");
const { requireAuth } = require("./_auth");

function json(statusCode, body) {
  return { statusCode, headers: { "content-type": "application/json" }, body: JSON.stringify(body) };
}

function cleanEnvironmentValue(value) {
  return String(value || "").trim().replace(/^(['"])(.*)\1$/, "$2").trim();
}

function isPrivateAddress(address) {
  if (net.isIPv4(address)) {
    const [a, b] = address.split(".").map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
  }
  if (net.isIPv6(address)) {
    const normalized = address.toLowerCase();
    return normalized === "::1" || normalized === "::" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb");
  }
  return true;
}

async function assertPublicUrl(value) {
  let url;
  try {
    url = new URL(String(value || "").trim());
  } catch (_) {
    throw new Error("Enter a valid booking link.");
  }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new Error("Enter a public HTTP or HTTPS booking link.");
  const hostname = url.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".local")) throw new Error("Enter a public booking link.");
  const addresses = await dns.lookup(hostname, { all: true });
  if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) throw new Error("Enter a public booking link.");
  return url;
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
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body, signal: controller.signal });
    const result = await response.json().catch(() => ({}));
    const allowedHostnames = cleanEnvironmentValue(process.env.TURNSTILE_ALLOWED_HOSTNAMES || "hotelsoffer.netlify.app").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
    if (!response.ok || !result.success || result.action !== "submit_offer" || !allowedHostnames.includes(String(result.hostname || "").toLowerCase())) return { ok: false, status: 403, error: "Submission verification failed." };
    return { ok: true };
  } catch (_) {
    return { ok: false, status: 502, error: "Submission verification service could not be reached." };
  } finally {
    clearTimeout(timeout);
  }
}

async function checkLink(initialUrl) {
  let current;
  try {
    current = await assertPublicUrl(initialUrl);
  } catch (error) {
    if (String(error.message || "").startsWith("Enter a ")) throw error;
    return { live: false, status: 0, final_url: String(initialUrl || ""), reason: "unreachable" };
  }
  for (let redirects = 0; redirects <= 5; redirects += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      let response = await fetch(current, { method: "HEAD", redirect: "manual", signal: controller.signal, headers: { "user-agent": "ExplorerOffers-LinkValidator/1.0" } });
      if ([403, 405].includes(response.status)) response = await fetch(current, { method: "GET", redirect: "manual", signal: controller.signal, headers: { "user-agent": "ExplorerOffers-LinkValidator/1.0", range: "bytes=0-1023" } });
      if (response.status >= 300 && response.status < 400 && response.headers.get("location")) {
        try {
          current = await assertPublicUrl(new URL(response.headers.get("location"), current).href);
        } catch (_) {
          return { live: false, status: response.status, final_url: current.href, reason: "unsafe_or_unreachable_redirect" };
        }
        continue;
      }
      return { live: response.status >= 200 && response.status < 400, status: response.status, final_url: current.href };
    } catch (error) {
      return { live: false, status: 0, final_url: current.href, reason: error.name === "AbortError" ? "timeout" : "unreachable" };
    } finally {
      clearTimeout(timeout);
    }
  }
  return { live: false, status: 0, final_url: current.href, reason: "too_many_redirects" };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  const auth = await requireAuth(event);
  if (!auth.ok) return auth.response;
  let payload;
  try { payload = JSON.parse(event.body || "{}"); } catch (_) { return json(400, { error: "Invalid JSON payload." }); }
  const forwardedFor = String(event.headers?.["x-forwarded-for"] || event.headers?.["X-Forwarded-For"] || "").split(",")[0].trim();
  const verification = await verifyTurnstileToken(payload.turnstile_token, forwardedFor);
  if (!verification.ok) return json(verification.status, { error: verification.error, service: "turnstile" });
  try {
    return json(200, await checkLink(payload.booking_link));
  } catch (error) {
    return json(400, { error: error.message || "Enter a valid booking link." });
  }
};

exports._test = { isPrivateAddress, checkLink };

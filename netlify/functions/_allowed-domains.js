const PERMANENT_ALLOWED_DOMAINS = Object.freeze(["accor.com", "accorplus.com"]);
const CACHE_TTL_MS = 5 * 60 * 1000;

let cachedDomains = null;
let cacheExpiresAt = 0;

function clean(value) {
  return String(value || "").trim().replace(/^(['"])(.*)\1$/, "$2").trim();
}

function validDomain(value) {
  const domain = String(value || "").trim().toLowerCase();
  if (domain.length > 253 || !domain.includes(".")) return "";
  return /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain) ? domain : "";
}

async function fetchExternalDomains() {
  const webhookUrl = clean(process.env.GOOGLE_APPS_SCRIPT_WEBHOOK_URL);
  const webhookSecret = clean(process.env.GOOGLE_APPS_SCRIPT_SECRET);
  if (!webhookUrl || !webhookSecret) throw new Error("Domain configuration storage is not configured.");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ secret: webhookSecret, action: "get_allowed_domains" }),
      redirect: "follow",
      signal: controller.signal,
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok || !Array.isArray(result.domains)) {
      throw new Error(result.error || `Domain configuration request failed (${response.status}).`);
    }
    return result.domains.map(validDomain).filter(Boolean);
  } finally {
    clearTimeout(timeout);
  }
}

async function getAllowedDomains() {
  if (cachedDomains && Date.now() < cacheExpiresAt) return [...cachedDomains];
  const domains = new Set(PERMANENT_ALLOWED_DOMAINS);
  try {
    (await fetchExternalDomains()).forEach((domain) => domains.add(domain));
  } catch (error) {
    console.warn("External allowed-domain list unavailable; using permanent Accor domains.", error?.message || error);
  }
  cachedDomains = [...domains];
  cacheExpiresAt = Date.now() + CACHE_TTL_MS;
  return [...cachedDomains];
}

module.exports = { PERMANENT_ALLOWED_DOMAINS, getAllowedDomains, validDomain };

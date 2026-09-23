const { createClerkClient, verifyToken } = require("@clerk/backend");

const ALLOWED_EMAIL_DOMAINS = new Set(["accor.com", "accorplus.com"]);

function response(statusCode, error) {
  return {
    ok: false,
    response: {
      statusCode,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error }),
    },
  };
}

function bearerToken(event) {
  const authorization = String(event.headers?.authorization || event.headers?.Authorization || "");
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : "";
}

function emailDomain(email) {
  const parts = String(email || "").trim().toLowerCase().split("@");
  return parts.length === 2 ? parts[1] : "";
}

async function requireAuth(event) {
  const secretKey = String(process.env.CLERK_SECRET_KEY || "").trim();
  if (!secretKey) return response(500, "Authentication is not configured.");

  const token = bearerToken(event);
  if (!token) return response(401, "Please sign in to continue.");

  let claims;
  try {
    claims = await verifyToken(token, { secretKey });
  } catch (error) {
    console.warn("Clerk session verification failed", error?.message || error);
    return response(401, "Your session is invalid or has expired. Please sign in again.");
  }

  try {
    const client = createClerkClient({ secretKey });
    const user = await client.users.getUser(claims.sub);
    const primary = user.emailAddresses.find((item) => item.id === user.primaryEmailAddressId)
      || user.emailAddresses[0];
    const email = String(primary?.emailAddress || "").trim().toLowerCase();

    if (!ALLOWED_EMAIL_DOMAINS.has(emailDomain(email))) {
      return response(403, "Access is limited to accor.com and accorplus.com email addresses.");
    }

    return { ok: true, userId: claims.sub, sessionId: claims.sid, email };
  } catch (error) {
    console.error("Clerk user lookup failed", error);
    return response(502, "The authentication service could not verify your account.");
  }
}

module.exports = { requireAuth };

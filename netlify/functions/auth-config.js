function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") return json(405, { error: "Method not allowed." });

  const publishableKey = String(process.env.CLERK_PUBLISHABLE_KEY || "").trim();
  if (!publishableKey) return json(503, { error: "Authentication is not configured." });

  return json(200, { publishableKey });
};

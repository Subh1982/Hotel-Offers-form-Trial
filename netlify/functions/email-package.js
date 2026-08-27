function json(statusCode, body) {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) {
    return json(500, { error: "Google Sheets webhook URL is not configured." });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (error) {
    return json(400, { error: "Invalid JSON payload." });
  }

  if (!payload.attachment?.data_base64 || !payload.attachment?.file_name) {
    return json(400, { error: "ZIP attachment is required." });
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      action: "email_package",
      offer: payload.offer || {},
      attachment: payload.attachment,
    }),
  });

  const text = await response.text();
  if (!response.ok) {
    return json(response.status, { error: "Email webhook failed.", details: text });
  }

  return json(200, { ok: true });
};

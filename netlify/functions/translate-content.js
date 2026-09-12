function json(statusCode, body) {
  return { statusCode, headers: { "content-type": "application/json" }, body: JSON.stringify(body) };
}

const LANGUAGE_NAMES = {
  en: "English",
  th: "Thai",
  vi: "Vietnamese",
  id: "Bahasa Indonesia",
  ja: "Japanese",
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed." });

  const apiKey = String(process.env.GEMINI_API_KEY || "").trim().replace(/^(['"])(.*)\1$/, "$2");
  if (!apiKey) return json(500, { error: "Gemini is not configured. Add GEMINI_API_KEY in Netlify." });

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (error) {
    return json(400, { error: "Invalid JSON payload." });
  }

  const text = String(body.text || "").trim();
  const sourceLanguage = String(body.source_language || "");
  const targetLanguage = String(body.target_language || "");
  if (!text) return json(400, { error: "Enter offer content before generating a translation." });
  if (text.length > 12000) return json(400, { error: "Offer content must be 12,000 characters or fewer." });
  if (!LANGUAGE_NAMES[sourceLanguage] || !LANGUAGE_NAMES[targetLanguage]) {
    return json(400, { error: "Unsupported translation language." });
  }
  if (sourceLanguage === targetLanguage) return json(200, { ok: true, translation: text });

  const instructions = `Translate the supplied ALL Accor+ Explorer offer content from ${LANGUAGE_NAMES[sourceLanguage]} to ${LANGUAGE_NAMES[targetLanguage]}.

Requirements:
- Return only the translated content, without a heading, explanation, quotation marks or commentary.
- Preserve the exact section order, paragraph breaks, and "Label:\nValue" structure.
- Translate field labels and natural-language offer content.
- Preserve every factual detail, date, time, price, currency, percentage, restriction and inclusion.
- Do not translate or alter URLs, email addresses, hotel RID codes, product names, hotel names, venue names, partner names or other proper nouns unless they have an established localized form.
- Do not add, remove, summarize or improve the content.
- Use natural, professional ${LANGUAGE_NAMES[targetLanguage]} suitable for member-facing hospitality content.`;

  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: instructions }] },
        contents: [{ role: "user", parts: [{ text }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 4000 },
      }),
    });

    const responseText = await response.text();
    if (!response.ok) {
      console.error("Gemini translation failed", response.status, responseText);
      return json(response.status, { error: `Translation failed (${response.status}).` });
    }

    const result = JSON.parse(responseText || "{}");
    const translation = (result.candidates?.[0]?.content?.parts || []).map((part) => part.text || "").join("").trim();
    if (!translation) return json(502, { error: "Gemini returned no translation." });
    return json(200, { ok: true, translation });
  } catch (error) {
    console.error("Gemini translation request failed", error);
    return json(502, { error: error.name === "AbortError" ? "Translation timed out." : "Translation could not be completed." });
  } finally {
    clearTimeout(timeout);
  }
};

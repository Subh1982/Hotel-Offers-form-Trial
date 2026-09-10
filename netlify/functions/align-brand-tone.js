function json(statusCode, body) {
  return { statusCode, headers: { "content-type": "application/json" }, body: JSON.stringify(body) };
}

const BRAND_INSTRUCTIONS = `Rewrite the supplied offer description in the ALL Accor+ Explorer brand voice.

Follow these rules in priority order:
1. Brand tone, then clarity, then literal phrasing.
2. Down to earth: warm, inviting, human, inclusive and naturally conversational at a premium level. Never sound corporate, overly formal, slangy or artificially friendly.
3. Explorers at heart: lively, engaging and evocative. Inspire curiosity and discovery, bring the experience to life with controlled sensory language, and address the reader as "you" where natural. Clarity is more important than cleverness.
4. Sophisticated yet simple: direct, elevated and concise. Use short, impactful sentences and highlight tangible member benefits. Avoid long sentences, generic claims, vague language and an overly sales-driven tone.
5. Make the value clear at first read, including what the member gains. Preserve an emotional connection and premium positioning.
6. Avoid internal jargon and assumptions about prior brand knowledge.
7. Naturally use vocabulary such as unforgettable, meaningful, enriching, welcoming, explore, discover, journey, escape, uncover, exclusive, curated, seamless, refined or effortless only when accurate. Do not force these words.
8. Preserve every factual detail, restriction, date, price, inclusion, location and proper noun from the source. Do not invent benefits or facts.
9. Write in the same language as the source text.
10. Return only the rewritten description, with no heading, quotation marks, explanation or commentary.`;

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

  const description = String(body.description || "").trim();
  if (!description) return json(400, { error: "Enter an offer description first." });
  if (description.length > 6000) return json(400, { error: "Offer description must be 6,000 characters or fewer." });

  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: BRAND_INSTRUCTIONS }] },
        contents: [{ role: "user", parts: [{ text: description }] }],
        generationConfig: { temperature: 0.45, maxOutputTokens: 1200 },
      }),
    });

    const responseText = await response.text();
    if (!response.ok) {
      console.error("Gemini brand alignment failed", response.status, responseText);
      return json(response.status, { error: `Brand tone alignment failed (${response.status}).` });
    }

    const result = JSON.parse(responseText || "{}");
    const alignedDescription = (result.candidates?.[0]?.content?.parts || []).map((part) => part.text || "").join("").trim();
    if (!alignedDescription) return json(502, { error: "Gemini returned no rewritten description." });
    return json(200, { ok: true, description: alignedDescription });
  } catch (error) {
    console.error("Gemini brand alignment request failed", error);
    return json(502, { error: error.name === "AbortError" ? "Brand tone alignment timed out." : "Brand tone alignment could not be completed." });
  } finally {
    clearTimeout(timeout);
  }
};

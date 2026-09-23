function json(statusCode, body) {
  return { statusCode, headers: { "content-type": "application/json" }, body: JSON.stringify(body) };
}

const { requireAuth } = require("./_auth");
const { GeminiError, generateText } = require("./_gemini");

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
  const auth = await requireAuth(event);
  if (!auth.ok) return auth.response;

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (error) {
    return json(400, { error: "Invalid JSON payload." });
  }

  const description = String(body.description || "").trim();
  if (!description) return json(400, { error: "Enter an offer description first." });
  if (description.length > 6000) return json(400, { error: "Offer description must be 6,000 characters or fewer." });

  try {
    const alignedDescription = await generateText({
      systemInstruction: BRAND_INSTRUCTIONS,
      prompt: description,
      maxOutputTokens: 1200,
    });
    return json(200, { ok: true, description: alignedDescription });
  } catch (error) {
    console.error("Gemini brand alignment request failed", error);
    return json(error instanceof GeminiError ? error.statusCode : 502, {
      error: error instanceof GeminiError ? error.message : "Brand tone alignment could not be completed.",
    });
  }
};

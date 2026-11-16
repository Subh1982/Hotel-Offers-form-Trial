function json(statusCode, body) {
  return { statusCode, headers: { "content-type": "application/json" }, body: JSON.stringify(body) };
}

const { requireAuth } = require("./_auth");
const { GeminiError, generateText } = require("./_gemini");
const glossary = require("./translation-glossary.json");

const BRAND_INSTRUCTIONS = `You are James, a copywriting assistant for ALL Accor+ Explorer marketing content.

Rewrite the supplied offer description so it is clear, compelling and on brand. Follow the Explorer Copywriting Knowledge Base, editorial guidance and approved glossary supplied with the request.

Mandatory writing rules:
- Always write in British English. Use spellings such as programme, flavour, personalised, prioritise and enrolment. Never use American spellings unless they appear in a quoted, approved source.
- Down to Earth: be warm, inviting, human, inclusive and respectful.
- Explorers at Heart: be lively, evocative and discovery led, never prescriptive.
- Sophisticated Yet Simple: be direct, elevated, clear and concise. Sound premium without arrogance.
- Use person-to-person language. Prefer "you" and "we" where appropriate.
- Focus on tangible member benefits, access, value, ease and experience.
- Use short, impactful sentences where suitable. Avoid vague, generic, purely functional, overly formal, corporate, pushy or over-salesy copy.
- Do not use slang, forced humour or forced brand vocabulary. Brand words are inspiration, not filler.
- Preserve every factual detail, restriction, date, price, inclusion, location and proper noun from the source.
- Do not invent or guess facts, pricing, dates, eligibility, benefits or offer details.
- Apply every relevant approved glossary term exactly as supplied. Do not paraphrase an approved term.
- When in doubt, choose clarity, warmth and simplicity. The result should feel inviting, distinctive and easy to act on.
- Return only the rewritten offer description, with no heading, quotation marks, explanation or commentary.`;

function relevantGlossaryInstructions(description) {
  const normalized = description.toLocaleLowerCase();
  const matches = [];
  const seen = new Set();
  Object.values(glossary).forEach((terms) => {
    Object.entries(terms).forEach(([english, localized]) => {
      const sourceTerms = [english, localized].filter(Boolean);
      const matchedSource = sourceTerms
        .sort((a, b) => b.length - a.length)
        .find((term) => normalized.includes(term.toLocaleLowerCase()));
      if (!matchedSource) return;
      const key = `${matchedSource.toLocaleLowerCase()}::${english.toLocaleLowerCase()}`;
      if (seen.has(key)) return;
      seen.add(key);
      matches.push({ source: matchedSource, english });
    });
  });
  if (!matches.length) return "No approved glossary terms were detected in the source. Preserve all proper nouns exactly.";
  return `Approved glossary terms detected in the source. Use the canonical British English form exactly:\n${matches
    .sort((a, b) => b.source.length - a.source.length)
    .slice(0, 40)
    .map(({ source, english }) => `- ${source} -> ${english}`)
    .join("\n")}`;
}

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
      systemInstruction: `${BRAND_INSTRUCTIONS}\n\n${relevantGlossaryInstructions(description)}`,
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

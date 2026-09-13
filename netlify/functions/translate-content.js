function json(statusCode, body) {
  return { statusCode, headers: { "content-type": "application/json" }, body: JSON.stringify(body) };
}

const glossary = require("./translation-glossary.json");

const LANGUAGE_NAMES = {
  en: "English",
  th: "Thai",
  vi: "Vietnamese",
  id: "Bahasa Indonesia",
  ja: "Japanese",
  ar: "Arabic",
};

const LANGUAGE_RULES = {
  ja: "Use native-level Japanese that feels written by a professional Japanese copywriter. Be polite, refined, trustworthy, soft yet confident, immediately understandable, and use Katakana naming where appropriate.",
  id: "Use native-level Bahasa Indonesia that feels written by a professional Indonesian copywriter. Be warm, premium, clear and benefit-driven. Follow Indonesian CRM conventions and use a period as the thousands separator for IDR amounts (for example, IDR 500.000).",
  th: "Use native-level Thai that feels written by a professional Thai copywriter. Be warm, premium, clear and benefit-driven. Follow Thai CRM conventions and express dates using the Thai Buddhist calendar (for example, 30 มิถุนายน 2569).",
  vi: "Use native-level Vietnamese that feels written by a professional Vietnamese copywriter. Be warm, premium, clear and benefit-driven. Follow Vietnamese CRM conventions and use DD/MM/YY dates (for example, 31/08/26).",
  ar: "Use native-level Modern Standard Arabic suitable for premium hospitality audiences across the Middle East. Make the copy natural, warm, refined, clear and benefit-driven, and preserve right-to-left readability.",
  en: "Use natural, polished English suitable for premium hospitality audiences. Be warm, refined, clear and benefit-driven.",
};

function includesTerm(text, term) {
  return text.toLocaleLowerCase().includes(term.toLocaleLowerCase());
}

function glossaryEntriesFor(text, sourceLanguage, targetLanguage) {
  const englishTerms = new Set();
  if (sourceLanguage === "en") {
    Object.values(glossary).forEach((terms) => {
      Object.keys(terms).forEach((english) => {
        if (includesTerm(text, english)) englishTerms.add(english);
      });
    });
  } else {
    Object.entries(glossary[sourceLanguage] || {}).forEach(([english, localized]) => {
      if (includesTerm(text, localized)) englishTerms.add(english);
    });
  }

  return Array.from(englishTerms)
    .map((english) => {
      const source = sourceLanguage === "en" ? english : glossary[sourceLanguage]?.[english];
      const target = targetLanguage === "en" ? english : glossary[targetLanguage]?.[english];
      return source && target ? `${source} => ${target}` : "";
    })
    .filter(Boolean)
    .slice(0, 120);
}

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

  const approvedTerms = glossaryEntriesFor(text, sourceLanguage, targetLanguage);
  const glossaryInstructions = approvedTerms.length
    ? `\n\nApproved glossary terms found in this content (mandatory; use the target form exactly):\n${approvedTerms.map((term) => `- ${term}`).join("\n")}`
    : "";

  const instructions = `You are a professional bilingual translation and localisation expert for premium hospitality, travel and subscription-based loyalty programs, including ALL Accor+ Explorer.

Recreate the supplied offer content from ${LANGUAGE_NAMES[sourceLanguage]} in ${LANGUAGE_NAMES[targetLanguage]}. This is brand-led localisation, not word-for-word translation.

Brand identity:
- Convey community, exploration and exclusive access to elevated experiences.
- Celebrate thoughtfully designed travel, inspire seamless journeys and recognise members as discerning explorers.

Tone priorities, in this order: brand tone, clarity, then literal accuracy.
1. Down to earth: warm, inviting, human and inclusive. Sound like a trusted companion, never corporate, forced or slang-heavy.
2. Explorers at heart: lively, engaging and evocative. Inspire curiosity with vivid but controlled language and address the reader as “you” where natural.
3. Sophisticated yet simple: direct, elevated, concise and benefit-led. Prefer short, impactful sentences; avoid vague, complex or overly sales-driven copy.

Context for this application:
- Content type: website or landing-page offer submission.
- Objective: communicate the offer clearly, preserve operational accuracy and create member-facing promotional copy.
- Audience: ALL Accor+ Explorer members and hotel marketing reviewers.

Target-language execution:
${LANGUAGE_RULES[targetLanguage]}

Writing and accessibility:
- Make the member benefit clear at first read and preserve premium positioning and emotional connection.
- The result must feel originally written in the target language and remain understandable to readers unfamiliar with the brand.
- You may improve phrasing and flow only when the original intent, facts and key benefits remain unchanged.
- Naturally use approved vocabulary such as exclusive, curated, seamless, refined, effortless, explore, discover, journey and escape when context supports it.

Application output requirements:
- Return only the translated content, without a heading, explanation, quotation marks or commentary.
- Preserve the exact section order, paragraph breaks, and "Label:\nValue" structure.
- Translate field labels and natural-language offer content.
- Preserve every factual detail, date, time, price, currency, percentage, restriction and inclusion.
- Preserve HTML tags and variable fields such as %%=ProperCase(First_Name)=%% exactly.
- Do not alter URLs, email addresses or hotel RID codes.
- Preserve hotel, venue, partner and product names unless the approved glossary supplies a target form.
- Do not introduce new ideas or remove key benefits.
- Glossary compliance is mandatory. When an approved term is supplied below, use it exactly and do not paraphrase it.${glossaryInstructions}`;

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

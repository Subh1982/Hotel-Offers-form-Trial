const DEFAULT_MODEL = "gemini-3.5-flash-lite";
const RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

class GeminiError extends Error {
  constructor(message, statusCode = 502) {
    super(message);
    this.name = "GeminiError";
    this.statusCode = statusCode;
  }
}

function configuredApiKey() {
  return String(process.env.GEMINI_API_KEY || "").trim().replace(/^(['"])(.*)\1$/, "$2");
}

function configuredModel() {
  return String(process.env.GEMINI_MODEL || DEFAULT_MODEL).trim().replace(/^(['"])(.*)\1$/, "$2");
}

function publicError(status, model) {
  if (status === 400) return `Gemini rejected the request. Confirm GEMINI_MODEL is set to ${model}.`;
  if (status === 401 || status === 403) return `The Gemini API key cannot access ${model}. Check the key and its API restrictions in Google AI Studio.`;
  if (status === 404) return `The configured Gemini model (${model}) is not available to this API key.`;
  if (status === 429) return "The Gemini usage limit has been reached. Please try again later or check the API key quota in Google AI Studio.";
  if (status >= 500) return "Gemini is temporarily unavailable. Please try again.";
  return `The Gemini request failed (${status}).`;
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function generateText({ systemInstruction, prompt, maxOutputTokens, timeoutMs = 26000 }) {
  const apiKey = configuredApiKey();
  if (!apiKey) throw new GeminiError("Gemini is not configured. Add GEMINI_API_KEY in Netlify.", 500);

  const model = configuredModel();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      let response;
      try {
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
          method: "POST",
          headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
          signal: controller.signal,
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              thinkingConfig: { thinkingLevel: "MINIMAL" },
              maxOutputTokens,
            },
          }),
        });
      } catch (error) {
        if (error.name === "AbortError") throw new GeminiError("The Gemini request timed out. Please try again.", 504);
        if (attempt === 0) {
          await wait(600);
          continue;
        }
        throw new GeminiError("Gemini could not be reached. Please try again.", 502);
      }

      const responseText = await response.text();
      if (!response.ok) {
        console.error("Gemini request failed", response.status, responseText);
        if (attempt === 0 && RETRYABLE_STATUSES.has(response.status)) {
          await wait(600);
          continue;
        }
        throw new GeminiError(publicError(response.status, model), response.status);
      }

      let result;
      try {
        result = JSON.parse(responseText || "{}");
      } catch (error) {
        throw new GeminiError("Gemini returned an invalid response. Please try again.", 502);
      }
      const text = (result.candidates?.[0]?.content?.parts || []).map((part) => part.text || "").join("").trim();
      if (!text) throw new GeminiError("Gemini returned no content. Please try again.", 502);
      return text;
    }
  } finally {
    clearTimeout(timeout);
  }

  throw new GeminiError("Gemini could not complete the request. Please try again.", 502);
}

module.exports = { DEFAULT_MODEL, GeminiError, generateText };

const assert = require("node:assert/strict");
const test = require("node:test");

const { DEFAULT_MODEL, GeminiError, generateText } = require("../netlify/functions/_gemini");

test("uses Gemini 3.5 Flash-Lite with minimal thinking", async () => {
  const originalFetch = global.fetch;
  const originalKey = process.env.GEMINI_API_KEY;
  const originalModel = process.env.GEMINI_MODEL;
  let request;

  process.env.GEMINI_API_KEY = "test-key";
  delete process.env.GEMINI_MODEL;
  global.fetch = async (url, options) => {
    request = { url, options };
    return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "Updated copy" }] } }] }), { status: 200 });
  };

  try {
    const output = await generateText({ systemInstruction: "Instructions", prompt: "Draft", maxOutputTokens: 500 });
    const body = JSON.parse(request.options.body);
    assert.equal(output, "Updated copy");
    assert.match(request.url, new RegExp(DEFAULT_MODEL));
    assert.equal(body.generationConfig.thinkingConfig.thinkingLevel, "MINIMAL");
    assert.equal(body.generationConfig.maxOutputTokens, 500);
    assert.equal("temperature" in body.generationConfig, false);
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
    if (originalModel === undefined) delete process.env.GEMINI_MODEL;
    else process.env.GEMINI_MODEL = originalModel;
  }
});

test("retries a transient Gemini failure once", async () => {
  const originalFetch = global.fetch;
  const originalKey = process.env.GEMINI_API_KEY;
  let attempts = 0;
  process.env.GEMINI_API_KEY = "test-key";
  global.fetch = async () => {
    attempts += 1;
    if (attempts === 1) return new Response(JSON.stringify({ error: { message: "Unavailable" } }), { status: 503 });
    return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "Recovered" }] } }] }), { status: 200 });
  };

  try {
    assert.equal(await generateText({ systemInstruction: "Instructions", prompt: "Draft", maxOutputTokens: 500 }), "Recovered");
    assert.equal(attempts, 2);
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
  }
});

test("returns an actionable message when the API key lacks model access", async () => {
  const originalFetch = global.fetch;
  const originalKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "test-key";
  global.fetch = async () => new Response(JSON.stringify({ error: { message: "Forbidden" } }), { status: 403 });

  try {
    await assert.rejects(
      generateText({ systemInstruction: "Instructions", prompt: "Draft", maxOutputTokens: 500 }),
      (error) => error instanceof GeminiError && error.statusCode === 403 && error.message.includes("Google AI Studio")
    );
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
  }
});

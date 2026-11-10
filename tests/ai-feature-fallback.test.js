const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const app = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");

test("AI feature failures show a helpful localized message after the shared retry", () => {
  const start = app.indexOf("const runtimeCopyTranslations = ") + "const runtimeCopyTranslations = ".length;
  const end = app.indexOf("Object.entries(runtimeCopyTranslations)", start);
  const copy = Function(`"use strict"; return (${app.slice(start, end).trim().replace(/;$/, "")});`)();

  for (const language of ["en", "th", "vi", "id", "ja", "ar", "tr"]) {
    assert.match(copy[language].brandToneUnavailable, /.+/);
    assert.match(copy[language].translationUnavailable, /.+/);
  }

  assert.equal(
    copy.en.brandToneUnavailable,
    "Sorry, the Brand Tone Alignment feature is not available at the moment. Please proceed with submitting your offer.",
  );
  assert.equal(
    copy.en.translationUnavailable,
    "Sorry, the Translation feature is not available at the moment. Please proceed with submitting your offer.",
  );
  assert.match(app, /brandToneStatus\.textContent = copy\.brandToneUnavailable/);
  assert.match(app, /setTranslationStatus\(copy\.translationUnavailable, "error"\)/);
});

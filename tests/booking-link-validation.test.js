const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const validator = require("../netlify/functions/validate-booking-link");

test("private network addresses are rejected", () => {
  for (const address of ["127.0.0.1", "10.1.2.3", "172.16.0.1", "192.168.1.1", "::1", "fd00::1"]) assert.equal(validator._test.isPrivateAddress(address), true);
  assert.equal(validator._test.isPrivateAddress("8.8.8.8"), false);
});

test("booking-link check occurs after Turnstile and before submission", () => {
  const app = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
  const submitFlow = app.slice(app.indexOf('form.addEventListener("submit"'));
  assert.ok(submitFlow.indexOf("requestTurnstileToken()") < submitFlow.indexOf("validateBookingLink(record.booking_link"));
  assert.ok(submitFlow.indexOf("validateBookingLink(record.booking_link") < submitFlow.indexOf("submitOfferToDrive(record"));
  assert.match(submitFlow, /confirmBookingLink\(validation/);
});

test("Turkish is available for both the interface and translations", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const app = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
  assert.match(html, /<option value="tr">Türkçe<\/option>/);
  assert.match(app, /tr: "Turkish"/);
  assert.match(app, /const formCopyTranslations = [\s\S]*\n  tr: \{/);
});

test("translation drafts are saved automatically without a save button", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const app = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
  assert.doesNotMatch(html, /saveTranslationPreviewButton/);
  assert.doesNotMatch(app, /saveTranslationPreviewButton/);
  assert.match(app, /translationPreview\.addEventListener\("input"/);
  assert.match(app, /function buildSubmissionRecord\(\) \{\s*persistTranslationPreview\(activeTranslationTarget\)/);
  assert.match(app, /auto_translations: generatedContentTranslations/);
});

test("booking validation dialog uses branded status and spacing styles", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const css = fs.readFileSync(path.join(__dirname, "..", "styles.css"), "utf8");
  assert.match(html, /class="dialog-content booking-validation-dialog"/);
  assert.match(html, /class="booking-dialog-status-icon"/);
  assert.match(css, /\.booking-validation-dialog/);
  assert.match(css, /dialog\[data-status="warning"\]/);
  assert.match(css, /background: linear-gradient\(145deg/);
});

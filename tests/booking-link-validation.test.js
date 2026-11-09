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

test("only dining and events can use email or RSVP booking", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const app = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
  const bookingLogic = app.slice(app.indexOf("function selectedBookingMethod"), app.indexOf("function renderTypeSpecificFields"));
  const typeFieldRendering = app.slice(app.indexOf("function renderTypeSpecificFields"), app.indexOf("function validateRequiredDetails"));

  assert.match(html, /id="bookingMethodFieldset"[^>]*is-hidden/);
  assert.match(html, /name="booking_method"[^>]*value="booking_link"/);
  assert.match(html, /name="booking_method"[^>]*value="email_rsvp"/);
  assert.match(html, /id="bookingEmailFields"[^>]*is-hidden/);
  assert.match(bookingLogic, /isDiningOrEventOffer\(\)/);
  assert.match(bookingLogic, /bookingMethodFieldset\.classList\.toggle\("is-hidden", !offersBookingChoice\)/);
  assert.match(bookingLogic, /bookingEmailInput\.required = usesEmailRsvp/);
  assert.doesNotMatch(typeFieldRendering, /process-note|offerTypeGuidance/);
  assert.match(app, /booking_method: selectedBookingMethod\(\) === "email_rsvp"/);
  assert.match(app, /booking_email: fieldValue\("booking_email"\)/);
});

test("Turkish is available for both the interface and translations", () => {
  const header = fs.readFileSync(path.join(__dirname, "..", "site-header.js"), "utf8");
  const app = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
  assert.match(header, /<option value="tr">Türkçe<\/option>/);
  assert.match(app, /tr: "Turkish"/);
  assert.match(app, /const formCopyTranslations = [\s\S]*\n  tr: \{/);
});

test("translation drafts are saved automatically without a save button", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const app = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
  assert.doesNotMatch(html, /saveTranslationPreviewButton/);
  assert.doesNotMatch(app, /saveTranslationPreviewButton/);
  assert.match(app, /textarea\.addEventListener\("input", \(\) => persistTranslationPreview/);
  assert.match(html, /id="translationTargetLanguage" multiple/);
  assert.match(html, />Translate Content</);
  assert.match(html, /data-i18n="translationPreviewTitle">Translate content</);
  assert.doesNotMatch(html, /data-i18n="translationPreviewTitle">Preview/);
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

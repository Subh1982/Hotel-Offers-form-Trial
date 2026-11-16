const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.join(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const brandTone = fs.readFileSync(path.join(root, "netlify/functions/align-brand-tone.js"), "utf8");

function objectBetween(startMarker, endMarker) {
  const start = app.indexOf(startMarker) + startMarker.length;
  const end = app.indexOf(endMarker, start);
  return Function(`"use strict"; return (${app.slice(start, end).trim().replace(/;$/, "")});`)();
}

test("translation question and market guidance use the requested copy in every language", () => {
  const copy = objectBetween("const requestedFormCopyTranslations = ", "Object.entries(requestedFormCopyTranslations)");
  for (const language of ["en", "th", "vi", "id", "ja", "ar", "tr"]) {
    assert.deepEqual(Object.keys(copy[language]).sort(), ["diningBookingMethodDirect", "memberBenefitsDates", "translationMarketDisclaimer", "translationRequiredQuestion"].sort());
  }
  assert.equal(copy.en.translationRequiredQuestion, "Is local language translation required?");
  assert.equal(copy.en.translationMarketDisclaimer, "The translation is required only for publication in its respective local market.");
  assert.match(html, /English, Thai, Vietnamese, Bahasa Indonesia, Japanese, Arabic, and Turkish/);
});

test("Dining shows Member Benefits and Dates with member benefits first", () => {
  const diningStart = app.indexOf("  dining: [", app.indexOf("const typeFieldGroups"));
  const diningEnd = app.indexOf("  events: [", diningStart);
  const diningFields = app.slice(diningStart, diningEnd);
  assert.ok(diningFields.indexOf('name: "member_benefits"') < diningFields.indexOf('name: "price"'));
  assert.match(app, /isDining \? copy\.memberBenefitsDates : copy\.stepOffer/);
  assert.match(app, /isDining \? copy\.memberBenefitsDates : copy\.datesBooking/);
  assert.match(app, /offerType\.value === "dining" \? copy\.diningBookingMethodDirect : copy\.bookingMethodEmailRsvp/);
});

test("brand tone alignment uses the James master prompt and approved glossary", () => {
  assert.match(brandTone, /You are James, a copywriting assistant for ALL Accor\+ Explorer/);
  assert.match(brandTone, /Always write in British English/);
  assert.match(brandTone, /Down to Earth/);
  assert.match(brandTone, /Explorers at Heart/);
  assert.match(brandTone, /Sophisticated Yet Simple/);
  assert.match(brandTone, /require\("\.\/translation-glossary\.json"\)/);
  assert.match(brandTone, /relevantGlossaryInstructions\(description\)/);
});

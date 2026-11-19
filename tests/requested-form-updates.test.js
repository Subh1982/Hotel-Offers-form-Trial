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
    assert.deepEqual(Object.keys(copy[language]).sort(), ["cityHelp", "cityLabel", "countryHelp", "countryLabel", "diningBookingMethodDirect", "memberBenefitsDates", "selectCountry", "translationMarketDisclaimer", "translationRequiredQuestion"].sort());
  }
  assert.equal(copy.en.translationRequiredQuestion, "Is local language translation required?");
  assert.equal(copy.en.translationMarketDisclaimer, "Translation to one of the languages below is required only for publishing the offer in the respective local market.");
  assert.match(html, /English, Thai, Vietnamese, Bahasa Indonesia, Japanese, Arabic, and Turkish/);
});

test("City and Country are separate required fields with a complete country selector", () => {
  assert.match(html, /<input name="city" required/);
  assert.match(html, /<select name="country" required/);
  assert.match(app, /const ISO_COUNTRY_CODES = "[A-Z ]+"\.split\(" "\)/);
  assert.match(app, /country_code: countrySelect\.selectedOptions\[0\]\?\.dataset\.countryCode/);
  assert.match(app, /city: fieldValue\("city"\)/);
  assert.match(app, /country: fieldValue\("country"\)/);
  const countryCodes = app.match(/const ISO_COUNTRY_CODES = "([A-Z ]+)"\.split\(" "\)/)[1].split(" ");
  assert.ok(countryCodes.length >= 249, `expected a complete ISO country list, received ${countryCodes.length}`);
  assert.equal(new Set(countryCodes).size, countryCodes.length);
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

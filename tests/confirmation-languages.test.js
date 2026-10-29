const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const source = fs.readFileSync(path.join(__dirname, "..", "confirmation.js"), "utf8");

test("confirmation copy is present for every supported interface language", () => {
  const languages = ["en", "th", "vi", "id", "ja", "ar", "tr"];
  const requiredKeys = ["headline", "copyId", "copied", "whatNext", "received", "inReview", "live"];
  languages.forEach((language, index) => {
    assert.match(source, new RegExp(`\\n  ${language}: \\{`), `missing confirmation copy for ${language}`);
    const start = source.indexOf(`\n  ${language}: {`);
    const end = index < languages.length - 1 ? source.indexOf(`\n  ${languages[index + 1]}: {`, start) : source.indexOf("\n};", start);
    const languageBlock = source.slice(start, end);
    requiredKeys.forEach((key) => assert.match(languageBlock, new RegExp(`\\b${key}:`), `${language} is missing ${key}`));
  });
});

test("simplified confirmation headline and Drive label are localized", () => {
  ["th", "vi", "id", "ja", "ar", "tr"].forEach((language) => {
    assert.match(source, new RegExp(`${language}: \\{ headline: .*driveLabel:`), `${language} is missing simplified confirmation copy`);
  });
});

test("confirmation page retains RTL behavior for Arabic", () => {
  assert.match(source, /confirmationLanguage === "ar" \? "rtl" : "ltr"/);
});

test("confirmation page keeps only the essential completion content", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "confirmation.html"), "utf8");
  assert.match(html, /Offer successfully submitted/);
  assert.match(html, /class="next-steps"/);
  assert.match(html, /data-confirmation-i18n="createAnother"/);
  assert.match(html, /id="confirmationOfferId"/);
  assert.match(html, /id="confirmationOfferTitle"/);
  assert.match(html, /id="confirmationHotelName"/);
  assert.match(html, /<ol class="status-tracker">/);
  assert.match(html, /aria-current="step"/);
  assert.doesNotMatch(html, /id="openDriveButton"|class="confirmation-details"/);
});

test("confirmation supports copying the ID and prefilling another offer", () => {
  assert.match(source, /navigator\.clipboard\.writeText\(confirmation\.offer_id\)/);
  assert.match(source, /sessionStorage\.setItem\("offerHotelPrefill"/);
  assert.match(source, /Your \$\{offerType\.label\} offer is submitted/);
});

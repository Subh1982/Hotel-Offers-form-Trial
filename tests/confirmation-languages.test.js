const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const source = fs.readFileSync(path.join(__dirname, "..", "confirmation.js"), "utf8");

function confirmationCopyObject() {
  const startMarker = "const confirmationCopy = ";
  const endMarker = "\n\nconst offerTypes";
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  return Function(`"use strict"; return (${source.slice(start + startMarker.length, end).trim().replace(/;$/, "")});`)();
}

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

test("legacy Drive label remains available in every language", () => {
  ["en", "th", "vi", "id", "ja", "ar", "tr"].forEach((language, index, languages) => {
    const start = source.indexOf(`\n  ${language}: {`);
    const end = index < languages.length - 1 ? source.indexOf(`\n  ${languages[index + 1]}: {`, start) : source.indexOf("\n};", start);
    assert.match(source.slice(start, end), /driveLabel:/, `${language} is missing driveLabel`);
  });
});

test("confirmation page retains RTL behavior for Arabic", () => {
  assert.match(source, /confirmationLanguage === "ar" \? "rtl" : "ltr"/);
});

test("confirmation page keeps the required redesign hooks", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "confirmation.html"), "utf8");
  assert.match(html, /Offer successfully submitted/);
  assert.match(html, /class="[^"]*next-steps[^"]*"/);
  assert.match(html, /data-confirmation-i18n="createAnother"/);
  assert.match(html, /id="confirmationOfferId"/);
  assert.match(html, /id="confirmationOfferTitle"/);
  assert.match(html, /id="confirmationHotelName"/);
  assert.match(html, /<ol class="status-tracker">/);
  assert.match(html, /aria-current="step"/);
  assert.doesNotMatch(html, /id="openDriveButton"|class="confirmation-details"/);
});

test("all redesigned confirmation copy exists in every language", () => {
  const languages = ["en", "th", "vi", "id", "ja", "ar", "tr"];
  const requiredKeys = ["logout", "stagesProgress", "receivedDesc", "now", "reviewDesc", "liveDesc", "summaryEyebrow", "summaryTitle", "yourOffer", "submitted", "submittedBy", "howMembersBook", "bookingLinkLabel", "noticeLead", "noticeBody", "todayAt", "rid", "languageLabel"];
  languages.forEach((language, index) => {
    const start = source.indexOf(`\n  ${language}: {`);
    const end = index < languages.length - 1 ? source.indexOf(`\n  ${languages[index + 1]}: {`, start) : source.indexOf("\n};", start);
    const languageBlock = source.slice(start, end);
    requiredKeys.forEach((key) => assert.match(languageBlock, new RegExp(`\\b${key}:`), `${language} is missing ${key}`));
  });
});

test("confirmation translations have complete key parity", () => {
  const copy = confirmationCopyObject();
  const englishKeys = Object.keys(copy.en).sort();
  ["th", "vi", "id", "ja", "ar", "tr"].forEach((language) => {
    assert.deepEqual(Object.keys(copy[language]).sort(), englishKeys, `${language} confirmation copy differs from English`);
  });
});

test("confirmation persists submission time and references every sprite icon", () => {
  const appSource = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
  const sprite = fs.readFileSync(path.join(__dirname, "..", "assets", "offer-icons.svg"), "utf8");
  assert.match(appSource, /submitted_at: new Date\(\)\.toISOString\(\)/);
  ["i-check", "i-copy", "i-arrow", "i-info", "i-tag", "i-package", "i-bed", "i-dining", "i-crown", "i-overlap"].forEach((iconId) => {
    assert.match(sprite, new RegExp(`id="${iconId}"`), `sprite is missing ${iconId}`);
  });
});

test("confirmation supports copying the ID and prefilling another offer", () => {
  assert.match(source, /navigator\.clipboard\.writeText\(confirmation\.offer_id\)/);
  assert.match(source, /sessionStorage\.setItem\("offerHotelPrefill"/);
  assert.match(source, /Your \$\{offerTypeLabel\} offer is submitted/);
});

test("generic offer types are localized on confirmation", () => {
  ["th", "vi", "id", "ja", "ar", "tr"].forEach((language) => {
    assert.match(source, new RegExp(`${language}: \"[^\"]+\"`), `missing localized offer type for ${language}`);
  });
  assert.match(source, /offerType\.localized\?\.\[confirmationLanguage\] \|\| offerType\.label/);
});

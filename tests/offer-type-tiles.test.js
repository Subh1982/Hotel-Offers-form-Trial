const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const confirmationHtml = fs.readFileSync(path.join(root, "confirmation.html"), "utf8");
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
const confirmationSource = fs.readFileSync(path.join(root, "confirmation.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const typeSprite = fs.readFileSync(path.join(root, "assets", "offer-type-icons.svg"), "utf8");

function objectBetween(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(start, -1, `Missing ${startMarker}`);
  assert.notEqual(end, -1, `Missing ${endMarker}`);
  const literal = source.slice(start + startMarker.length, end).trim().replace(/;$/, "");
  return Function(`"use strict"; return (${literal});`)();
}

function formTranslations() {
  const ui = objectBetween(appSource, "const uiTranslations = ", "const formCopyTranslations");
  [
    ["const formCopyTranslations = ", "Object.entries(formCopyTranslations)"],
    ["const feedbackCopyTranslations = ", "Object.entries(feedbackCopyTranslations)"],
    ["const workflowCopyTranslations = ", "Object.entries(workflowCopyTranslations)"],
    ["const translationAuditCopyTranslations = ", "Object.entries(translationAuditCopyTranslations)"],
    ["const imagePreviewCopyTranslations = ", "Object.entries(imagePreviewCopyTranslations)"],
    ["const runtimeCopyTranslations = ", "Object.entries(runtimeCopyTranslations)"],
  ].forEach(([start, end]) => {
    const layer = objectBetween(appSource, start, end);
    Object.entries(layer).forEach(([language, copy]) => Object.assign(ui[language], copy));
  });
  return ui;
}

const expectedIcons = {
  red_hot_rooms: "i-rhr-tag",
  more_escapes: "i-badge-more-escapes",
  hotel_stay: "i-hotel",
  dining: "i-dining",
  events: "i-crown",
  partners: "i-handshake",
};

test("all form tiles use existing offer-type sprite icons", () => {
  const tiles = [...html.matchAll(/<button type="button" class="offer-type-tile" data-offer-type="([^"]+)"[\s\S]*?<\/button>/g)];
  assert.equal(tiles.length, 6);
  tiles.forEach(([markup, type]) => {
    const href = markup.match(/<use href="assets\/offer-type-icons\.svg#([^"]+)"/);
    assert.ok(href, `${type} does not use the offer-type sprite`);
    assert.match(typeSprite, new RegExp(`id="${href[1]}"`), `${href[1]} is missing from the sprite`);
  });
});

test("offer-type sprite contains all six recommended icons", () => {
  Object.values(expectedIcons).forEach((iconId) => assert.match(typeSprite, new RegExp(`id="${iconId}"`)));
});

test("form and confirmation use the same icon mapping", () => {
  const confirmationTypes = objectBetween(confirmationSource, "const offerTypes = ", "const localeByLanguage");
  Object.entries(expectedIcons).forEach(([type, iconId]) => {
    assert.match(html, new RegExp(`data-offer-type="${type}"[\\s\\S]*?offer-type-icons\\.svg#${iconId}`));
    assert.equal(confirmationTypes[type].iconId, iconId);
  });
  assert.match(confirmationHtml, /id="confirmationTypeTile"/);
  assert.match(confirmationSource, /assets\/offer-type-icons\.svg#/);
});

test("form and confirmation labels match in all seven languages", () => {
  const translations = formTranslations();
  const confirmationTypes = objectBetween(confirmationSource, "const offerTypes = ", "const localeByLanguage");
  const languages = ["en", "th", "vi", "id", "ja", "ar", "tr"];
  const keys = { hotel_stay: "offerTypeHotelStay", dining: "offerTypeDining", events: "offerTypeEvents", partners: "offerTypePartners" };

  languages.forEach((language) => {
    assert.equal(confirmationTypes.red_hot_rooms.localized?.[language] || confirmationTypes.red_hot_rooms.label, "Red Hot Rooms");
    assert.equal(confirmationTypes.more_escapes.localized?.[language] || confirmationTypes.more_escapes.label, "More Escapes");
    Object.entries(keys).forEach(([type, key]) => {
      assert.equal(confirmationTypes[type].localized?.[language] || confirmationTypes[type].label, translations[language][key], `${language} ${type} label differs`);
    });
  });
});

test("tile CSS uses the supplied component rules", () => {
  assert.doesNotMatch(styles, /\.offer-type-badge/);
  assert.match(styles, /--red-hot-rooms:\s*#a51e19/);
  const tileRule = styles.match(/\.offer-type-tile\s*\{([\s\S]*?)\}/)?.[1] || "";
  assert.match(tileRule, /text-transform:\s*none/);
  assert.match(tileRule, /letter-spacing:\s*0/);
});

test("English Partner Offers headline uses the singular label", () => {
  const confirmationTypes = objectBetween(confirmationSource, "const offerTypes = ", "const localeByLanguage");
  assert.equal(confirmationTypes.partners.label, "Partner Offers");
  assert.equal(confirmationTypes.partners.headlineLabel, "Partner Offer");
  assert.match(confirmationSource, /offerType\.headlineLabel \|\| `\$\{offerTypeLabel\} offer`/);
  assert.match(confirmationSource, /Your \$\{englishHeadlineLabel\} is submitted/);
});

test("confirmation resolves both stored labels and offer-type keys", () => {
  assert.match(confirmationSource, /offerTypes\[type\]\.label === confirmation\.offer_type/);
  assert.match(confirmationSource, /if \(offerTypeKey\) confirmationTypeTile\.dataset\.offerType = offerTypeKey/);
});

test("legacy approximated offer-type symbols are removed", () => {
  const uiSprite = fs.readFileSync(path.join(root, "assets", "offer-icons.svg"), "utf8");
  ["i-tag", "i-package", "i-bed", "i-dining", "i-crown", "i-overlap"].forEach((iconId) => {
    assert.doesNotMatch(uiSprite, new RegExp(`id="${iconId}"`));
  });
});

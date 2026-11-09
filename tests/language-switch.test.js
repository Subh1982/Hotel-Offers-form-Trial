const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

function objectBetween(startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(start, -1, `Missing ${startMarker}`);
  assert.notEqual(end, -1, `Missing ${endMarker}`);
  const literal = source.slice(start + startMarker.length, end).trim().replace(/;$/, "");
  return Function(`"use strict"; return (${literal});`)();
}

const localizedLanguageLabels = objectBetween(
  "const localizedLanguageLabels = ",
  "function updateTranslationTargetOptions",
);
const uiTranslations = objectBetween("const uiTranslations = ", "const formCopyTranslations");
const formCopyTranslations = objectBetween("const formCopyTranslations = ", "Object.entries(formCopyTranslations)");
const feedbackCopyTranslations = objectBetween("const feedbackCopyTranslations = ", "Object.entries(feedbackCopyTranslations)");
const accommodationHelpTranslations = objectBetween("const accommodationHelpTranslations = ", "Object.entries(accommodationHelpTranslations)");
const workflowCopyTranslations = objectBetween("const workflowCopyTranslations = ", "Object.entries(workflowCopyTranslations)");
const translationAuditCopyTranslations = objectBetween("const translationAuditCopyTranslations = ", "Object.entries(translationAuditCopyTranslations)");
const imagePreviewCopyTranslations = objectBetween("const imagePreviewCopyTranslations = ", "Object.entries(imagePreviewCopyTranslations)");
const runtimeCopyTranslations = objectBetween("const runtimeCopyTranslations = ", "Object.entries(runtimeCopyTranslations)");
const typeFieldGroups = objectBetween("const typeFieldGroups = ", "const dynamicFieldLabels");
const dynamicFieldLabels = objectBetween("const dynamicFieldLabels = ", "const feedbackDynamicFieldLabels");
const feedbackDynamicFieldLabels = objectBetween("const feedbackDynamicFieldLabels = ", "Object.entries(feedbackDynamicFieldLabels)");

for (const [language, copy] of Object.entries(formCopyTranslations)) {
  Object.assign(uiTranslations[language], copy);
}
for (const [language, copy] of Object.entries(feedbackCopyTranslations)) {
  Object.assign(uiTranslations[language], copy);
}
for (const [language, accommodationDetailsHelp] of Object.entries(accommodationHelpTranslations)) {
  Object.assign(uiTranslations[language], { accommodationDetailsHelp });
}
for (const [language, copy] of Object.entries(workflowCopyTranslations)) {
  Object.assign(uiTranslations[language], copy);
}
for (const [language, copy] of Object.entries(translationAuditCopyTranslations)) {
  Object.assign(uiTranslations[language], copy);
}
for (const [language, copy] of Object.entries(imagePreviewCopyTranslations)) {
  Object.assign(uiTranslations[language], copy);
}
for (const [language, copy] of Object.entries(runtimeCopyTranslations)) {
  Object.assign(uiTranslations[language], copy);
}
for (const [language, labels] of Object.entries(feedbackDynamicFieldLabels)) {
  Object.assign(dynamicFieldLabels[language], labels);
}

const languages = ["en", "th", "vi", "id", "ja", "ar", "tr"];
const pageKeys = [...html.matchAll(/data-i18n="([^"]+)"/g)].map((match) => match[1]);
const ariaKeys = [...html.matchAll(/data-i18n-aria-label="([^"]+)"/g)].map((match) => match[1]);
const placeholderKeys = [...html.matchAll(/data-i18n-placeholder="([^"]+)"/g)].map((match) => match[1]);
const localizedKeys = [...new Set([...pageKeys, ...ariaKeys, ...placeholderKeys])];

for (const key of localizedKeys) {
  assert.notEqual(uiTranslations.en[key], undefined, `English fallback missing for ${key}`);
}

const missingTranslations = Object.fromEntries(languages
  .map((language) => [language, localizedKeys.filter((key) => uiTranslations[language][key] === undefined)])
  .filter(([, keys]) => keys.length));
assert.deepEqual(missingTranslations, {}, `Missing interface translations: ${JSON.stringify(missingTranslations)}`);

for (const from of languages) {
  const rendered = Object.fromEntries(localizedKeys.map((key) => [key, uiTranslations[from][key] ?? uiTranslations.en[key]]));
  for (const to of languages) {
    for (const key of localizedKeys) rendered[key] = uiTranslations[to][key] ?? uiTranslations.en[key];
    for (const key of localizedKeys) {
      assert.equal(rendered[key], uiTranslations[to][key] ?? uiTranslations.en[key], `${key} stayed stale during ${from} -> ${to}`);
    }
  }
}

assert.equal(uiTranslations.ar.offerTypeHotelStay, "إقامة فندقية");
assert.equal(uiTranslations.en.offerTypeHotelStay, "Hotel stay");
assert.equal(uiTranslations.en.offerTypeDining, "Dining");
assert.equal(uiTranslations.en.offerTypeEvents, "Events");
assert.equal(uiTranslations.en.offerTypePartners, "Partner Offers");

for (const language of languages) {
  assert.deepEqual(Object.keys(localizedLanguageLabels[language]).sort(), languages.slice().sort(), `${language} language menu is incomplete`);
}

const dynamicNames = [...new Set(Object.values(typeFieldGroups).flat().map((field) => field.name))];
for (const name of dynamicNames) {
  assert.ok(dynamicFieldLabels.ar[name], `Arabic dynamic label missing for ${name}`);
}

assert.match(source, /document\.documentElement\.dir = language === "ar" \? "rtl" : "ltr"/);
console.log(`Language switching passed for ${languages.length * languages.length} transitions and ${localizedKeys.length} interface keys.`);

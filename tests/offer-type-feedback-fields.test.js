const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const appsScript = fs.readFileSync(path.join(root, "integrations/google-apps-script/Code.gs"), "utf8");

test("Events fields and guidance match the feedback deck", () => {
  assert.match(app, /name: "other_event_dates"/);
  assert.match(app, /name: "exclusive_member_event"/);
  assert.match(app, /eventMenuLabel: "Event menu PDF \(optional\)"/);
  assert.match(app, /events: \{ rateScreenshot: false, menuPdf: true, menuPdfRequired: false/);
  assert.match(app, /dining: \{ rateScreenshot: false, menuPdf: true, menuPdfRequired: false/);
  assert.match(app, /accommodationDetailsCoreField\.classList\.toggle\("is-hidden", selected !== "events"\)/);
  assert.match(html, /data-i18n="accommodationDetailsHelp"/);
  assert.match(app, /const accommodationHelpTranslations = \{/);
  assert.match(html, /name="menu_pdf" type="file" accept="application\/pdf"/);
  assert.match(app, /events: \[\s*\{ name: "public_price"[\s\S]*?\},\s*\{ name: "member_price"/);
});

test("Dining menu attachment is optional in all seven languages", () => {
  const start = app.indexOf("const diningMenuCopy = ") + "const diningMenuCopy = ".length;
  const end = app.indexOf("const helperNoteTranslations", start);
  const copy = Function(`"use strict"; return (${app.slice(start, end).trim().replace(/;$/, "")});`)();
  for (const language of ["en", "th", "vi", "id", "ja", "ar", "tr"]) {
    assert.deepEqual(Object.keys(copy[language]).sort(), ["help", "label"]);
    assert.match(copy[language].label, /.+/);
    assert.match(copy[language].help, /.+/);
  }
});

test("Package details is limited to More Escapes and Red Hot Rooms supplies standard terms", () => {
  assert.match(html, /id="offerSubtitleField"/);
  assert.match(html, /id="packageDetailsField"/);
  assert.match(app, /offerSubtitleField\.classList\.toggle\("is-hidden", isRedHotRooms\)/);
  assert.match(app, /const usesPackageDetails = selected === "more_escapes"/);
  assert.match(app, /packageDetailsField\.classList\.toggle\("is-hidden", !usesPackageDetails\)/);
  assert.match(app, /packageDetails\.required = usesPackageDetails/);
  assert.match(app, /Accommodation must be fully prepaid at the time of booking/);
  assert.match(app, /function updateRedHotRoomsTitles\(\)/);
});

test("new Events values are retained by Drive and Asana persistence", () => {
  assert.match(appsScript, /details\.other_event_dates \|\| ''/);
  assert.match(appsScript, /details\.exclusive_member_event \|\| ''/);
  assert.match(appsScript, /'Other event dates', 'Exclusive member event'/);
  assert.match(app, /offer_details: \{\s*\.\.\.collectDynamicFields\(\)/);
});

test("offer feedback copy is available in all seven languages", () => {
  const start = app.indexOf("const offerTypeFeedbackCopy = ") + "const offerTypeFeedbackCopy = ".length;
  const end = app.indexOf("const diningMenuCopy", start);
  const feedbackCopy = Function(`"use strict"; return (${app.slice(start, end).trim().replace(/;$/, "")});`)();
  const expectedKeys = Object.keys(feedbackCopy.en).sort();
  for (const language of ["en", "th", "vi", "id", "ja", "ar", "tr"]) {
    assert.deepEqual(Object.keys(feedbackCopy[language]).sort(), expectedKeys, `${language} feedback copy is incomplete`);
  }
});

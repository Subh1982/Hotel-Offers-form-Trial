const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const submitOffer = require("../netlify/functions/submit-offer");

test("saved translations are included in the Asana task notes", () => {
  const notes = submitOffer._test.asanaTaskNotes({
    offer_id: "EXP-TEST",
    status: "submitted",
    offer_tile_title: "Stay longer",
    offer_description: "Stay three nights and save.",
    offer_details: {},
    auto_translations: {
      ar: {
        language: "Arabic",
        source_language: "English",
        text: "أقم ثلاث ليالٍ ووفر.",
      },
      ja: {
        language: "Japanese",
        source_language: "English",
        text: "3泊してお得に滞在。",
      },
    },
  });

  assert.match(notes, /Saved translations/);
  assert.match(notes, /Arabic \(translated from English\)/);
  assert.match(notes, /أقم ثلاث ليالٍ ووفر./);
  assert.match(notes, /Japanese \(translated from English\)/);
  assert.match(notes, /3泊してお得に滞在。/);
});

test("removed persistence and package services are absent", () => {
  const root = path.join(__dirname, "..");
  const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
  const submit = fs.readFileSync(path.join(root, "netlify/functions/submit-offer.js"), "utf8");

  ["createZip", "create-package-upload", "email-package", "SUPABASE_URL", "GOOGLE_SHEETS_WEBHOOK_URL"].forEach((removed) => {
    assert.equal(app.includes(removed), false, `${removed} should not remain in app.js`);
    assert.equal(submit.includes(removed), false, `${removed} should not remain in submit-offer.js`);
  });
  assert.equal(fs.existsSync(path.join(root, "netlify/functions/create-package-upload.js")), false);
  assert.equal(fs.existsSync(path.join(root, "netlify/functions/email-package.js")), false);
});

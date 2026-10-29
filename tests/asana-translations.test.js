const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const submitOffer = require("../netlify/functions/submit-offer");
const driveArchive = require("../netlify/functions/_drive-archive");

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

test("legacy persistence services are absent", () => {
  const root = path.join(__dirname, "..");
  const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
  const submit = fs.readFileSync(path.join(root, "netlify/functions/submit-offer.js"), "utf8");

  ["create-package-upload", "email-package", "SUPABASE_URL", "GOOGLE_SHEETS_WEBHOOK_URL"].forEach((removed) => {
    assert.equal(app.includes(removed), false, `${removed} should not remain in app.js`);
    assert.equal(submit.includes(removed), false, `${removed} should not remain in submit-offer.js`);
  });
  assert.equal(fs.existsSync(path.join(root, "netlify/functions/create-package-upload.js")), false);
  assert.equal(fs.existsSync(path.join(root, "netlify/functions/email-package.js")), false);
});

test("submission shows staged progress and Asana defaults to disabled", () => {
  const root = path.join(__dirname, "..");
  const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
  const submit = fs.readFileSync(path.join(root, "netlify/functions/submit-offer.js"), "utf8");

  assert.match(app, /verificationTimeout = window\.setTimeout\(fail, 15000\)/);
  assert.match(app, /updateSubmissionProgress/);
  assert.match(app, /action: "finalize_submission"/);
  assert.match(submit, /disabled: true/);
  assert.match(submit, /uploadOfferArchive\(offer, submission\.folder_id\)/);
});

test("Drive ZIP uses the required date, offer type, and RID filename", () => {
  const offer = {
    submission_date: "2026-10-29",
    generated_at: "2026-10-29T01:02:03.000Z",
    offer_type: "Hotel stay",
    hotel_rid_code: "B590",
    offer_id: "EXP-TEST",
    offer_details: {},
    auto_translations: { tr: { language_code: "tr", text: "Türkçe teklif" } },
  };
  assert.equal(driveArchive.archiveFilename(offer), "2026-10-29_hotel-stay_b590.zip");
  const archive = driveArchive.buildArchive(offer);
  assert.equal(archive.subarray(0, 2).toString(), "PK");
  assert.match(archive.toString("utf8"), /submission\.json/);
  assert.match(archive.toString("utf8"), /submission-summary\.txt/);
  assert.match(archive.toString("utf8"), /translations\/tr\.txt/);
});

test("Drive storage uses the protected Apps Script webhook without OAuth credentials", () => {
  const root = path.join(__dirname, "..");
  const drive = fs.readFileSync(path.join(root, "netlify/functions/_drive-archive.js"), "utf8");
  const script = fs.readFileSync(path.join(root, "integrations/google-apps-script/Code.gs"), "utf8");
  assert.match(drive, /GOOGLE_APPS_SCRIPT_WEBHOOK_URL/);
  assert.match(drive, /GOOGLE_APPS_SCRIPT_SECRET/);
  assert.doesNotMatch(drive, /GOOGLE_DRIVE_CLIENT_ID|GOOGLE_DRIVE_REFRESH_TOKEN|GOOGLE_SERVICE_ACCOUNT_JSON/);
  assert.match(script, /createFolder\('images'\)/);
  assert.match(script, /createFolder\('documents'\)/);
  assert.match(script, /submissionFolder\.createFile\(blob\)/);
  assert.match(script, /sheet\.appendRow/);
  assert.match(script, /WEBHOOK_SECRET/);
});

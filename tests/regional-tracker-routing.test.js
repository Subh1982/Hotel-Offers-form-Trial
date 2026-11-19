const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const script = fs.readFileSync(path.join(root, "integrations/google-apps-script/Code.gs"), "utf8");
const context = {};
vm.createContext(context);
vm.runInContext(script, context);

test("attached country mapping routes to the requested regional trackers", () => {
  const cases = {
    AU: "Pacific", NZ: "Pacific", FJ: "Pacific",
    ID: "Asia", SG: "Asia", VN: "Asia", TH: "Asia", HK: "Asia", JP: "Asia", IN: "Asia", MY: "Asia", PH: "Asia",
    BH: "Middle East", EG: "Middle East", IQ: "Middle East", JO: "Middle East", KW: "Middle East", LB: "Middle East", OM: "Middle East", QA: "Middle East", SA: "Middle East", TR: "Middle East",
  };
  Object.entries(cases).forEach(([countryCode, region]) => {
    assert.equal(context.trackerRegionForOffer_({ country_code: countryCode }), region, countryCode);
  });
});

test("unlisted countries use deterministic geographic fallbacks", () => {
  assert.equal(context.trackerRegionForOffer_({ country_code: "PG", country: "Papua New Guinea" }), "Pacific");
  assert.equal(context.trackerRegionForOffer_({ country_code: "AE", country: "United Arab Emirates" }), "Middle East");
  assert.equal(context.trackerRegionForOffer_({ country_code: "FR", country: "France" }), "Asia");
});

test("tracker configuration and columns use three spreadsheets and separate City and Country fields", () => {
  assert.equal(context.trackerSpreadsheetPropertyForRegion_("Pacific"), "PACIFIC_SPREADSHEET_ID");
  assert.equal(context.trackerSpreadsheetPropertyForRegion_("Asia"), "ASIA_SPREADSHEET_ID");
  assert.equal(context.trackerSpreadsheetPropertyForRegion_("Middle East"), "MIDDLE_EAST_SPREADSHEET_ID");
  const headers = Array.from(context.trackerHeaders_());
  assert.ok(headers.includes("City"));
  assert.ok(headers.includes("Country"));
  assert.equal(headers.includes("City - Country"), false);
  assert.doesNotMatch(script, /properties\.getProperty\('SPREADSHEET_ID'\)/);
});

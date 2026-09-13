const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const startMarker = "const uploadRequirementsByOfferType = ";
const endMarker = "const contentLanguageLabels";
const start = source.indexOf(startMarker);
const end = source.indexOf(endMarker, start);
assert.notEqual(start, -1);
assert.notEqual(end, -1);
const literal = source.slice(start + startMarker.length, end).trim().replace(/;$/, "");
const requirements = Function(`"use strict"; return (${literal});`)();

assert.deepEqual(
  Object.entries(requirements).filter(([, value]) => value.rateScreenshot).map(([type]) => type).sort(),
  ["hotel_stay", "more_escapes", "red_hot_rooms"],
);
assert.deepEqual(
  Object.entries(requirements).filter(([, value]) => value.bookingScreenshot).map(([type]) => type).sort(),
  ["dining", "events", "partners"],
);
assert.match(source, /rateScreenshotInput\.required = needsRateScreenshot/);
assert.match(source, /bookingScreenshotInput\.required = needsBookingScreenshot/);
assert.match(html, /id="rateScreenshotCard"[^>]*is-hidden/);
assert.match(html, /id="bookingScreenshotCard"[^>]*is-hidden/);

console.log("Conditional upload requirements passed for all six offer types.");

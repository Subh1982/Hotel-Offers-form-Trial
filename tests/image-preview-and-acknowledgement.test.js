const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");

test("the form displays only full-width banner and listing-tile previews", () => {
  assert.match(css, /\.image-preview-grid\s*{[^}]*grid-template-columns:\s*repeat\(2,/s);
  assert.match(html, /id="masterBannerPreview"/);
  assert.match(html, /id="masterListingPreview"/);
  assert.doesNotMatch(html, /id="masterSocialPreview"|class="image-preview-card image-preview-social"/);
});

test("the hidden social asset is still generated and included in storage", () => {
  assert.match(app, /resizeImage\(file, 1080, 1080, true\)/);
  assert.match(app, /social_image:\s*resizedSocialFile/);
});

test("the final acknowledgement uses the updated English master copy", () => {
  const expected = "I understand incomplete or inaccurate submissions may delay promotion, and content and assets are due up to 6 weeks in advance.";
  assert.ok(html.includes(expected));
  assert.ok(app.includes(`acknowledgementText: "${expected}"`));
});

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.join(__dirname, "..");
const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
const confirmationHtml = fs.readFileSync(path.join(root, "confirmation.html"), "utf8");
const headerSource = fs.readFileSync(path.join(root, "site-header.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");

test("both pages mount the shared header before authentication", () => {
  [indexHtml, confirmationHtml].forEach((html) => {
    assert.match(html, /<div id="appShell" hidden>/);
    assert.match(html, /<div id="siteHeaderMount"><\/div>/);
    assert.ok(html.indexOf("site-header.js") < html.indexOf("auth.js"), "site-header.js must load before auth.js");
    assert.doesNotMatch(html, /class="topbar"/);
  });
});

test("shared header copy is complete in all seven languages", () => {
  const languages = ["en", "th", "vi", "id", "ja", "ar", "tr"];
  const keys = ["product", "language", "signedInAs", "account", "logout"];
  languages.forEach((language, index) => {
    const start = headerSource.indexOf(`\n  ${language}: {`);
    const end = index < languages.length - 1 ? headerSource.indexOf(`\n  ${languages[index + 1]}: {`, start) : headerSource.indexOf("\n};", start);
    assert.notEqual(start, -1, `missing ${language} header copy`);
    const block = headerSource.slice(start, end);
    keys.forEach((key) => assert.match(block, new RegExp(`\\b${key}:`), `${language} is missing ${key}`));
  });
});

test("header offsets and legacy styles are updated", () => {
  assert.match(styles, /--header-height:\s*72px/);
  assert.match(styles, /top:\s*calc\(var\(--header-height\) \+ 24px\)/);
  assert.match(styles, /scroll-margin-top:\s*calc\(var\(--header-height\) \+ 24px\)/);
  assert.doesNotMatch(styles, /\.topbar(?:\s|,|\{)/);
  assert.doesNotMatch(styles, /\.language-control(?:\s|,|\{)/);
  assert.doesNotMatch(styles, /\.authenticated-user(?:\s|,|\{)/);
});

test("language and account controls have matching header heights", () => {
  const languageRule = styles.match(/\.site-header-lang select\s*\{([\s\S]*?)\}/)?.[1] || "";
  const accountRule = styles.match(/\.site-header-account-btn\s*\{([\s\S]*?)\}/)?.[1] || "";
  assert.match(languageRule, /min-height:\s*40px/);
  assert.match(languageRule, /height:\s*40px/);
  assert.match(accountRule, /height:\s*40px/);
});

test("form, authentication and confirmation connect to the header API", () => {
  const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
  const authSource = fs.readFileSync(path.join(root, "auth.js"), "utf8");
  const confirmationSource = fs.readFileSync(path.join(root, "confirmation.js"), "utf8");
  assert.match(appSource, /siteHeader\?\.setProgress\(percent\)/);
  assert.match(authSource, /siteHeader\.setUser\(email\)/);
  assert.match(confirmationSource, /siteHeader\?\.setProgress\(100\)/);
});

test("logout uses Clerk's explicit post-sign-out redirect", () => {
  const authSource = fs.readFileSync(path.join(root, "auth.js"), "utf8");
  assert.match(authSource, /Clerk\.signOut\(\{ redirectUrl: `\$\{window\.location\.origin\}\/` \}\)/);
  assert.match(authSource, /Could not sign out of Clerk/);
});

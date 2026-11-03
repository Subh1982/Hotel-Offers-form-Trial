const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const authPath = path.join(__dirname, "..", "auth.js");
const source = fs.readFileSync(authPath, "utf8");
const styles = fs.readFileSync(path.join(__dirname, "..", "styles.css"), "utf8");
const indexHtml = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const confirmationHtml = fs.readFileSync(path.join(__dirname, "..", "confirmation.html"), "utf8");
const helpers = source.slice(0, source.indexOf("async function authenticatedFetch"));
const context = {};

vm.runInNewContext(`${helpers}\nglobalThis.testIsAllowedEmail = isAllowedEmail; globalThis.testSetAllowedAuthDomains = setAllowedAuthDomains;`, context);

test("accepts only exact Accor and Accor Plus email domains", () => {
  assert.equal(context.testIsAllowedEmail("person@accor.com"), true);
  assert.equal(context.testIsAllowedEmail("PERSON@ACCORPLUS.COM"), true);
  assert.equal(context.testIsAllowedEmail(" person@accor.com "), true);
  assert.equal(context.testIsAllowedEmail("person@gmail.com"), false);
  assert.equal(context.testIsAllowedEmail("person@sub.accor.com"), false);
  assert.equal(context.testIsAllowedEmail("person@accor.com.example"), false);
  assert.equal(context.testIsAllowedEmail("person@@accor.com"), false);
  assert.equal(context.testIsAllowedEmail("@accor.com"), false);
});

test("adds stakeholder domains while permanently retaining Accor access", () => {
  context.testSetAllowedAuthDomains(["partnerhotel.com", "INVALID URL", " ACCOR.COM "]);
  assert.equal(context.testIsAllowedEmail("person@partnerhotel.com"), true);
  assert.equal(context.testIsAllowedEmail("person@accor.com"), true);
  assert.equal(context.testIsAllowedEmail("person@accorplus.com"), true);
  assert.equal(context.testIsAllowedEmail("person@invalid url"), false);

  context.testSetAllowedAuthDomains([]);
  assert.equal(context.testIsAllowedEmail("person@partnerhotel.com"), false);
  assert.equal(context.testIsAllowedEmail("person@accor.com"), true);
  assert.equal(context.testIsAllowedEmail("person@accorplus.com"), true);
});

test("server domain configuration validates exact domain names", () => {
  const { PERMANENT_ALLOWED_DOMAINS, validDomain } = require("../netlify/functions/_allowed-domains");
  assert.deepEqual(PERMANENT_ALLOWED_DOMAINS, ["accor.com", "accorplus.com"]);
  assert.equal(validDomain(" PartnerHotel.com "), "partnerhotel.com");
  assert.equal(validDomain("sub.partnerhotel.com"), "sub.partnerhotel.com");
  assert.equal(validDomain("https://partnerhotel.com"), "");
  assert.equal(validDomain("@partnerhotel.com"), "");
});

test("checks the email domain before starting Clerk sign-in", () => {
  const handlerStart = source.indexOf('document.querySelector("#authEmailForm")');
  const domainCheck = source.indexOf("if (!isAllowedEmail(email))", handlerStart);
  const clerkCreate = source.indexOf("await sendCode()", handlerStart);

  assert.ok(handlerStart >= 0, "email form handler should exist");
  assert.ok(domainCheck > handlerStart, "domain validation should run in the email handler");
  assert.ok(clerkCreate > domainCheck, "Clerk should only be called after domain validation");
});

test("keeps authentication views hidden until Clerk resolves the session", () => {
  assert.match(indexHtml, /<body class="auth-loading">/);
  assert.match(confirmationHtml, /<body class="auth-loading">/);
  assert.match(styles, /body\.auth-loading > #authGate,[\s\S]*body\.auth-loading > #appShell[\s\S]*visibility: hidden;/);

  const authenticatedApp = source.slice(
    source.indexOf("function showAuthenticatedApp"),
    source.indexOf("function showSignIn")
  );
  const signIn = source.slice(
    source.indexOf("function showSignIn"),
    source.indexOf("function showCodeStep")
  );
  assert.match(authenticatedApp, /document\.body\.classList\.remove\("auth-loading"\)/);
  assert.match(signIn, /document\.body\.classList\.remove\("auth-loading"\)/);
});

test("uses the streamlined Explorer sign-in heading", () => {
  [indexHtml, confirmationHtml].forEach((html) => {
    assert.match(html, /<h1 id="authTitle">Explorer Offer Submission<\/h1>/);
    assert.doesNotMatch(html, />Continue with your work email</);
    assert.doesNotMatch(html, /class="auth-rule"/);
    assert.doesNotMatch(html, /<p class="eyebrow">Offer Submission<\/p>/);
  });
});

test("does not display the missing-auth configuration warning on the static preview", () => {
  assert.match(source, /message === "Authentication is not configured\." \? "" : message/);
});

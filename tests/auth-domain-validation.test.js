const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const authPath = path.join(__dirname, "..", "auth.js");
const source = fs.readFileSync(authPath, "utf8");
const helpers = source.slice(0, source.indexOf("async function authenticatedFetch"));
const context = {};

vm.runInNewContext(`${helpers}\nglobalThis.testIsAllowedEmail = isAllowedEmail;`, context);

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

test("checks the email domain before starting Clerk sign-in", () => {
  const handlerStart = source.indexOf('document.querySelector("#authEmailForm")');
  const domainCheck = source.indexOf("if (!isAllowedEmail(email))", handlerStart);
  const clerkCreate = source.indexOf("await sendCode()", handlerStart);

  assert.ok(handlerStart >= 0, "email form handler should exist");
  assert.ok(domainCheck > handlerStart, "domain validation should run in the email handler");
  assert.ok(clerkCreate > domainCheck, "Clerk should only be called after domain validation");
});

const ALLOWED_AUTH_DOMAINS = new Set(["accor.com", "accorplus.com"]);

function loadAuthScript(src, attributes = {}) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    script.crossOrigin = "anonymous";
    Object.entries(attributes).forEach(([name, value]) => script.setAttribute(name, value));
    script.addEventListener("load", resolve, { once: true });
    script.addEventListener("error", () => reject(new Error("The sign-in service could not be loaded.")), { once: true });
    document.head.append(script);
  });
}

function frontendApiFromKey(publishableKey) {
  const encoded = String(publishableKey).split("_")[2];
  if (!encoded) throw new Error("The Clerk publishable key is invalid.");
  return atob(encoded.replace(/-/g, "+").replace(/_/g, "/")).replace(/\$$/, "");
}

function primaryEmail(user) {
  const primary = user?.emailAddresses?.find((item) => item.id === user.primaryEmailAddressId)
    || user?.emailAddresses?.[0];
  return String(primary?.emailAddress || "").trim().toLowerCase();
}

function isAllowedEmail(email) {
  const parts = String(email).trim().toLowerCase().split("@");
  return parts.length === 2 && Boolean(parts[0]) && ALLOWED_AUTH_DOMAINS.has(parts[1]);
}

function clerkErrorMessage(error, fallback) {
  return error?.errors?.[0]?.longMessage || error?.errors?.[0]?.message || error?.message || fallback;
}

function clerkErrorCode(error) {
  return error?.errors?.[0]?.code || error?.code || "";
}

function setAuthMessage(message, isError = false) {
  const element = document.querySelector("#authMessage");
  if (!element) return;
  element.textContent = message;
  element.classList.toggle("error", isError);
  element.classList.toggle("success", Boolean(message) && !isError);
}

function showAuthenticatedApp(user) {
  const email = primaryEmail(user);
  document.querySelector("#authGate")?.classList.add("is-hidden");
  const shell = document.querySelector("#appShell");
  if (shell) shell.hidden = false;

  const userEmail = document.querySelector("#authenticatedUserEmail");
  if (userEmail) userEmail.textContent = email;

  const emailInput = document.querySelector('#offerForm input[name="email"]');
  if (emailInput) {
    emailInput.value = email;
    emailInput.defaultValue = email;
    emailInput.readOnly = true;
    emailInput.setAttribute("aria-readonly", "true");
  }
  document.body.classList.remove("auth-loading");
}

function showSignIn(message = "") {
  const shell = document.querySelector("#appShell");
  if (shell) shell.hidden = true;
  document.querySelector("#authGate")?.classList.remove("is-hidden");
  setAuthMessage(message, Boolean(message));
  document.body.classList.remove("auth-loading");
}

function showCodeStep(email) {
  document.querySelector("#authEmailStep")?.classList.add("is-hidden");
  document.querySelector("#authCodeStep")?.classList.remove("is-hidden");
  const destination = document.querySelector("#authCodeDestination");
  if (destination) destination.textContent = email;
  document.querySelector("#authCode")?.focus();
}

function showEmailStep() {
  document.querySelector("#authCodeStep")?.classList.add("is-hidden");
  document.querySelector("#authEmailStep")?.classList.remove("is-hidden");
  const code = document.querySelector("#authCode");
  if (code) code.value = "";
  setAuthMessage("");
  document.querySelector("#authEmail")?.focus();
}

async function authenticatedFetch(input, init = {}) {
  await window.explorerAuthReady;
  const token = await window.Clerk?.session?.getToken();
  if (!token) throw new Error("Please sign in to continue.");

  const headers = new Headers(init.headers || {});
  headers.set("authorization", `Bearer ${token}`);
  const response = await fetch(input, { ...init, headers });
  if (response.status === 401 || response.status === 403) {
    const result = await response.clone().json().catch(() => ({}));
    if (response.status === 401) showSignIn(result.error || "Your session has expired. Please sign in again.");
  }
  return response;
}

window.authenticatedFetch = authenticatedFetch;
window.explorerAuthReady = (async () => {
  try {
    const response = await fetch("/.netlify/functions/auth-config", { headers: { accept: "application/json" } });
    const config = await response.json().catch(() => ({}));
    if (!response.ok || !config.publishableKey) throw new Error(config.error || "Authentication is not configured.");

    const frontendApi = frontendApiFromKey(config.publishableKey);
    await loadAuthScript(`https://${frontendApi}/npm/@clerk/clerk-js@6.32.1/dist/clerk.browser.js`, {
      "data-clerk-publishable-key": config.publishableKey,
    });
    await window.Clerk.load();

    const signIn = window.Clerk.client.signIn.__internal_future;
    const signUp = window.Clerk.client.signUp.__internal_future;
    let pendingEmail = "";

    async function completeAuth(resource) {
      const sessionId = resource.createdSessionId;
      if (!sessionId) throw new Error("Clerk did not create a session. Please try again.");
      await window.Clerk.setActive({ session: sessionId });
    }

    async function sendCode() {
      const { error: createError } = await signIn.create({ identifier: pendingEmail, signUpIfMissing: true });
      if (createError) throw createError;
      const { error: sendError } = await signIn.emailCode.sendCode();
      if (sendError) throw sendError;
    }

    document.querySelector("#authEmailForm")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const input = document.querySelector("#authEmail");
      const button = event.currentTarget.querySelector('button[type="submit"]');
      const email = String(input?.value || "").trim().toLowerCase();

      if (!isAllowedEmail(email)) {
        setAuthMessage("Use an @accor.com or @accorplus.com work email address.", true);
        input?.focus();
        return;
      }

      pendingEmail = email;
      button.disabled = true;
      button.textContent = "SENDING CODE...";
      setAuthMessage("");
      try {
        await sendCode();
        showCodeStep(email);
        setAuthMessage("Verification code sent. It will expire in 10 minutes.");
      } catch (error) {
        console.error("Could not start Clerk email-code flow", error);
        setAuthMessage(clerkErrorMessage(error, "We could not send a verification code. Please try again."), true);
      } finally {
        button.disabled = false;
        button.textContent = "SEND VERIFICATION CODE";
      }
    });

    document.querySelector("#authCodeForm")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const input = document.querySelector("#authCode");
      const button = event.currentTarget.querySelector('button[type="submit"]');
      const code = String(input?.value || "").replace(/\s/g, "");
      if (!/^\d{6}$/.test(code)) {
        setAuthMessage("Enter the six-digit verification code.", true);
        input?.focus();
        return;
      }

      button.disabled = true;
      button.textContent = "VERIFYING...";
      setAuthMessage("");
      try {
        const { error } = await signIn.emailCode.verifyCode({ code });
        if (error && clerkErrorCode(error) !== "sign_up_if_missing_transfer") throw error;

        if (clerkErrorCode(error) === "sign_up_if_missing_transfer") {
          const { error: transferError } = await signUp.create({ transfer: true });
          if (transferError) throw transferError;
          if (signUp.status !== "complete") {
            throw new Error("Your email was verified, but Clerk requires additional account information. Check the Clerk user settings and try again.");
          }
          await completeAuth(signUp);
        } else if (signIn.status === "complete") {
          await completeAuth(signIn);
        } else {
          throw new Error("Verification could not be completed. Please request a new code.");
        }
      } catch (error) {
        console.error("Could not verify Clerk email code", error);
        setAuthMessage(clerkErrorMessage(error, "That code could not be verified. Please try again."), true);
      } finally {
        button.disabled = false;
        button.textContent = "VERIFY AND CONTINUE";
      }
    });

    document.querySelector("#authResendButton")?.addEventListener("click", async (event) => {
      const button = event.currentTarget;
      button.disabled = true;
      setAuthMessage("");
      try {
        const { error } = await signIn.emailCode.sendCode();
        if (error) throw error;
        setAuthMessage("A new verification code has been sent.");
      } catch (error) {
        setAuthMessage(clerkErrorMessage(error, "We could not resend the code. Please try again."), true);
      } finally {
        window.setTimeout(() => { button.disabled = false; }, 30000);
      }
    });

    document.querySelector("#authChangeEmailButton")?.addEventListener("click", async () => {
      await signIn.reset();
      await signUp.reset();
      pendingEmail = "";
      showEmailStep();
    });

    const applyAuthState = async (user) => {
      if (!user) {
        showSignIn();
        return;
      }
      const email = primaryEmail(user);
      if (!isAllowedEmail(email)) {
        await window.Clerk.signOut();
        showSignIn("Use an @accor.com or @accorplus.com work email address.");
        return;
      }
      showAuthenticatedApp(user);
    };

    window.Clerk.addListener(({ user }) => applyAuthState(user));
    await applyAuthState(window.Clerk.user);

    document.querySelector("#logoutButton")?.addEventListener("click", async () => {
      await window.Clerk.signOut();
      window.location.assign("/");
    });
  } catch (error) {
    console.error("Authentication initialization failed", error);
    showSignIn();
    setAuthMessage(error.message || "Authentication could not be loaded. Please refresh and try again.", true);
  }
})();

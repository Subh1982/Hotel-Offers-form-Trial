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
  const parts = String(email).split("@");
  return parts.length === 2 && ALLOWED_AUTH_DOMAINS.has(parts[1].toLowerCase());
}

function setAuthMessage(message, isError = false) {
  const element = document.querySelector("#authMessage");
  if (!element) return;
  element.textContent = message;
  element.classList.toggle("error", isError);
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
}

function showSignIn(message = "") {
  const shell = document.querySelector("#appShell");
  if (shell) shell.hidden = true;
  document.querySelector("#authGate")?.classList.remove("is-hidden");
  setAuthMessage(message, Boolean(message));

  const target = document.querySelector("#clerkSignIn");
  if (target && window.Clerk) {
    target.replaceChildren();
    window.Clerk.mountSignIn(target, {
      fallbackRedirectUrl: window.location.href,
      signUpFallbackRedirectUrl: window.location.href,
    });
  }
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
    await loadAuthScript(`https://${frontendApi}/npm/@clerk/ui@1/dist/ui.browser.js`);
    await loadAuthScript(`https://${frontendApi}/npm/@clerk/clerk-js@6/dist/clerk.browser.js`, {
      "data-clerk-publishable-key": config.publishableKey,
    });
    await window.Clerk.load({ ui: { ClerkUI: window.__internal_ClerkUICtor } });

    const applyAuthState = async (user) => {
      if (!user) {
        showSignIn();
        return;
      }
      const email = primaryEmail(user);
      if (!isAllowedEmail(email)) {
        await window.Clerk.signOut();
        showSignIn("Please use an @accor.com or @accorplus.com email address.");
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

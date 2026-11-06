const HEADER_COPY = {
  en: { product: "Explorer Offers Portal", language: "Language", signedInAs: "Signed in as", account: "Account", logout: "Log out" },
  th: { product: "พอร์ทัลข้อเสนอ Explorer", language: "ภาษา", signedInAs: "ลงชื่อเข้าใช้ในชื่อ", account: "บัญชี", logout: "ออกจากระบบ" },
  vi: { product: "Cổng thông tin ưu đãi Explorer", language: "Ngôn ngữ", signedInAs: "Đăng nhập với tư cách", account: "Tài khoản", logout: "Đăng xuất" },
  id: { product: "Portal Penawaran Explorer", language: "Bahasa", signedInAs: "Masuk sebagai", account: "Akun", logout: "Keluar" },
  ja: { product: "Explorerオファーポータル", language: "言語", signedInAs: "ログイン中", account: "アカウント", logout: "ログアウト" },
  ar: { product: "بوابة عروض Explorer", language: "اللغة", signedInAs: "تم تسجيل الدخول باسم", account: "الحساب", logout: "تسجيل الخروج" },
  tr: { product: "Explorer Teklif Portalı", language: "Dil", signedInAs: "Şu hesapla oturum açıldı", account: "Hesap", logout: "Çıkış yap" },
};

const siteHeaderMount = document.querySelector("#siteHeaderMount");
siteHeaderMount.innerHTML = `
  <header class="site-header" id="siteHeader">
    <div class="site-header-inner">
      <a class="site-header-brand" href="/" aria-label="Explorer Offers Portal home">
        <img class="site-header-logo" src="assets/all-accor-plus-logo-navy.png" alt="ALL Accor Plus">
        <span class="site-header-divider" aria-hidden="true"></span>
        <span class="site-header-product" data-header-i18n="product">Explorer Offers Portal</span>
      </a>
      <div class="site-header-tools">
        <label class="site-header-lang">
          <svg class="site-header-globe" aria-hidden="true"><use href="assets/header-icons.svg#i-globe"></use></svg>
          <span class="sr-only" data-header-i18n="language">Language</span>
          <select id="languageSelect">
            <option value="en">English</option><option value="th">ไทย</option><option value="vi">Tiếng Việt</option>
            <option value="id">Bahasa Indonesia</option><option value="ja">日本語</option><option value="ar">العربية</option><option value="tr">Türkçe</option>
          </select>
        </label>
        <div class="site-header-account">
          <button type="button" class="site-header-account-btn" id="accountButton" aria-haspopup="menu" aria-expanded="false" aria-controls="accountMenu">
            <span class="site-header-avatar" id="accountAvatar" aria-hidden="true"></span>
            <span class="site-header-email" id="authenticatedUserEmail"></span>
            <svg class="site-header-chevron" aria-hidden="true"><use href="assets/header-icons.svg#i-chev"></use></svg>
          </button>
          <div class="site-header-menu" id="accountMenu" role="menu" aria-labelledby="accountButton" hidden>
            <div class="site-header-who"><small data-header-i18n="signedInAs">Signed in as</small><b id="accountMenuEmail"></b></div>
            <button type="button" class="site-header-item" id="logoutButton" role="menuitem">
              <svg aria-hidden="true"><use href="assets/header-icons.svg#i-logout"></use></svg><span data-header-i18n="logout">Log out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="site-header-progress" aria-hidden="true"><span id="headerProgressFill"></span></div>
  </header>`;

const siteHeaderElement = document.querySelector("#siteHeader");
const headerLanguageSelect = document.querySelector("#languageSelect");
const accountButton = document.querySelector("#accountButton");
const accountMenu = document.querySelector("#accountMenu");
const logoutButton = document.querySelector("#logoutButton");
let siteHeaderEmail = "";
let siteHeaderLanguage = "en";

function closeAccountMenu({ restoreFocus = false } = {}) {
  accountMenu.hidden = true;
  accountButton.setAttribute("aria-expanded", "false");
  if (restoreFocus) accountButton.focus();
}

function openAccountMenu() {
  accountMenu.hidden = false;
  accountButton.setAttribute("aria-expanded", "true");
  logoutButton.focus();
}

function setUser(email = "") {
  siteHeaderEmail = email;
  document.querySelector("#authenticatedUserEmail").textContent = email;
  document.querySelector("#accountMenuEmail").textContent = email;
  document.querySelector("#accountAvatar").textContent = email.charAt(0).toUpperCase();
  const copy = HEADER_COPY[siteHeaderLanguage] || HEADER_COPY.en;
  accountButton.setAttribute("aria-label", email ? `${copy.account}: ${email}` : copy.account);
}

function setProgress(percent = 0) {
  const value = Math.min(100, Math.max(0, Number(percent) || 0));
  document.querySelector("#headerProgressFill").style.width = `${value}%`;
}

function setLanguage(code = "en") {
  siteHeaderLanguage = HEADER_COPY[code] ? code : "en";
  const copy = HEADER_COPY[siteHeaderLanguage];
  headerLanguageSelect.value = siteHeaderLanguage;
  document.querySelectorAll("[data-header-i18n]").forEach((element) => {
    element.textContent = copy[element.dataset.headerI18n];
  });
  accountButton.setAttribute("aria-label", siteHeaderEmail ? `${copy.account}: ${siteHeaderEmail}` : copy.account);
}

headerLanguageSelect.addEventListener("change", () => setLanguage(headerLanguageSelect.value));
accountButton.addEventListener("click", () => {
  if (accountMenu.hidden) openAccountMenu();
  else closeAccountMenu();
});
logoutButton.addEventListener("click", () => closeAccountMenu());
document.addEventListener("click", (event) => {
  if (!event.target.closest(".site-header-account")) closeAccountMenu();
});
accountMenu.addEventListener("focusout", (event) => {
  if (!event.relatedTarget || !accountMenu.contains(event.relatedTarget)) closeAccountMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !accountMenu.hidden) closeAccountMenu({ restoreFocus: true });
});
function updateScrolledHeader() { siteHeaderElement.classList.toggle("is-scrolled", window.scrollY > 4); }
window.addEventListener("scroll", updateScrolledHeader, { passive: true });
updateScrolledHeader();

Object.defineProperty(window, "siteHeader", {
  value: { setUser, setProgress, setLanguage },
  configurable: true,
  writable: true,
});
const headerPreviewParams = new URLSearchParams(window.location.search);
const headerLocalPreview = ["127.0.0.1", "localhost"].includes(window.location.hostname) && headerPreviewParams.get("preview") === "1";
if (headerLocalPreview && headerPreviewParams.get("shot") === "390") document.documentElement.classList.add("preview-width-390");
const initialHeaderLanguage = headerLocalPreview && HEADER_COPY[headerPreviewParams.get("lang")]
  ? headerPreviewParams.get("lang")
  : localStorage.getItem("explorer-offer-language") || "en";
if (headerLocalPreview && headerPreviewParams.get("lang")) localStorage.setItem("explorer-offer-language", initialHeaderLanguage);
setLanguage(initialHeaderLanguage);
if (headerLocalPreview && headerPreviewParams.get("open") === "1") requestAnimationFrame(openAccountMenu);
if (headerLocalPreview && headerPreviewParams.get("scroll")) {
  siteHeaderElement.classList.add("is-scrolled");
}

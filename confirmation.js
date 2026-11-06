const localPreview = ["127.0.0.1", "localhost"].includes(window.location.hostname)
  && new URLSearchParams(window.location.search).get("preview") === "1";
const previewType = new URLSearchParams(window.location.search).get("type") || "more_escapes";
const previewConfirmation = {
  offer_id: "EXP-20261105143209-7KQ2", offer_type: previewType,
  offer_tile_title: "A harbour escape with breakfast and sunset cocktails",
  hotel_name: "Sofitel Sydney Darling Harbour", hotel_rid_code: "B590", city_country: "Sydney · Australia",
  email: "preview@accorplus.com", booking_link: "https://example.com/harbour-escape", booking_details: "Not provided",
  date_range: "Booking period: 6 Nov 2026 – 20 Nov 2026\nStay period: 10 Nov 2026 – 28 Feb 2027",
  submitted_at: new Date().toISOString(),
};
const rawConfirmation = sessionStorage.getItem("offerSubmissionConfirmation") || (localPreview ? JSON.stringify(previewConfirmation) : null);
let confirmationLanguage = (localPreview && new URLSearchParams(window.location.search).get("lang"))
  || localStorage.getItem("explorer-offer-language") || "en";

const confirmationCopy = {
  en: {
    eyebrow: "Submission complete", headline: (type) => `Your ${type} offer is submitted`, reference: "Offer ID", copyId: "Copy ID", copied: "Copied", copyFailed: "Select and copy the ID manually.", whatNext: "What happens next", received: "Received", inReview: "In review", live: "Live", createAnother: "Create another offer", notProvided: "Not provided", dateRange: "Dates", bookingMethod: "Booking method", languageLabel: "Language", logout: "Log out", stagesProgress: "1 of 3 stages complete", receivedDesc: "Your offer and files are with the Explorer team.", now: "Now", reviewDesc: "The team checks your content, images and terms.", liveDesc: "Offers can take up to 2 weeks to go live.", summaryEyebrow: "Submission summary", summaryTitle: "Here’s what we received", yourOffer: "Your offer", submitted: "Submitted", submittedBy: "Submitted by", howMembersBook: "How members book", bookingLinkLabel: "Booking link", noticeLead: "We’ll be in touch if we need more information.", noticeBody: (email) => `Questions about this offer will go to ${email}.`, prefillHelper: (hotel) => `Details for ${hotel} will be filled in for you.`, todayAt: (time) => `Today, ${time}`, rid: "RID", driveLabel: "Submission archive",
  },
  th: {
    eyebrow: "ส่งข้อมูลเรียบร้อย", headline: (type) => `ส่งข้อเสนอ ${type} แล้ว`, reference: "หมายเลขข้อเสนอ", copyId: "คัดลอก ID", copied: "คัดลอกแล้ว", copyFailed: "โปรดเลือกและคัดลอก ID ด้วยตนเอง", whatNext: "ขั้นตอนต่อไป", received: "ได้รับแล้ว", inReview: "กำลังตรวจสอบ", live: "เผยแพร่", createAnother: "สร้างข้อเสนออื่น", notProvided: "ไม่ได้ระบุ", dateRange: "วันที่", bookingMethod: "วิธีการจอง", languageLabel: "ภาษา", logout: "ออกจากระบบ", stagesProgress: "เสร็จสมบูรณ์ 1 จาก 3 ขั้นตอน", receivedDesc: "ทีม Explorer ได้รับข้อเสนอและไฟล์ของคุณแล้ว", now: "ขณะนี้", reviewDesc: "ทีมจะตรวจสอบเนื้อหา รูปภาพ และข้อกำหนดของคุณ", liveDesc: "ข้อเสนออาจใช้เวลาสูงสุด 2 สัปดาห์ก่อนเผยแพร่", summaryEyebrow: "สรุปการส่ง", summaryTitle: "ข้อมูลที่เราได้รับ", yourOffer: "ข้อเสนอของคุณ", submitted: "ส่งเมื่อ", submittedBy: "ส่งโดย", howMembersBook: "วิธีที่สมาชิกจอง", bookingLinkLabel: "ลิงก์การจอง", noticeLead: "เราจะติดต่อหากต้องการข้อมูลเพิ่มเติม", noticeBody: (email) => `คำถามเกี่ยวกับข้อเสนอนี้จะส่งไปที่ ${email}`, prefillHelper: (hotel) => `ระบบจะกรอกรายละเอียดของ ${hotel} ให้คุณ`, todayAt: (time) => `วันนี้ ${time}`, rid: "RID", driveLabel: "ไฟล์เก็บถาวรการส่งข้อมูล",
  },
  vi: {
    eyebrow: "Gửi hoàn tất", headline: (type) => `Ưu đãi ${type} của bạn đã được gửi`, reference: "Mã ưu đãi", copyId: "Sao chép ID", copied: "Đã sao chép", copyFailed: "Hãy chọn và sao chép ID theo cách thủ công.", whatNext: "Điều gì xảy ra tiếp theo", received: "Đã nhận", inReview: "Đang xét duyệt", live: "Đăng tải", createAnother: "Tạo ưu đãi khác", notProvided: "Không được cung cấp", dateRange: "Ngày", bookingMethod: "Phương thức đặt chỗ", languageLabel: "Ngôn ngữ", logout: "Đăng xuất", stagesProgress: "Đã hoàn tất 1 trong 3 giai đoạn", receivedDesc: "Nhóm Explorer đã nhận được ưu đãi và tệp của bạn.", now: "Hiện tại", reviewDesc: "Nhóm sẽ kiểm tra nội dung, hình ảnh và điều khoản.", liveDesc: "Ưu đãi có thể mất tối đa 2 tuần để được đăng.", summaryEyebrow: "Tóm tắt nội dung gửi", summaryTitle: "Đây là thông tin chúng tôi đã nhận", yourOffer: "Ưu đãi của bạn", submitted: "Đã gửi", submittedBy: "Người gửi", howMembersBook: "Cách hội viên đặt chỗ", bookingLinkLabel: "Liên kết đặt chỗ", noticeLead: "Chúng tôi sẽ liên hệ nếu cần thêm thông tin.", noticeBody: (email) => `Các câu hỏi về ưu đãi này sẽ được gửi tới ${email}.`, prefillHelper: (hotel) => `Thông tin của ${hotel} sẽ được điền sẵn cho bạn.`, todayAt: (time) => `Hôm nay, ${time}`, rid: "RID", driveLabel: "Tệp lưu trữ nội dung gửi",
  },
  id: {
    eyebrow: "Pengiriman selesai", headline: (type) => `Penawaran ${type} Anda telah dikirim`, reference: "ID penawaran", copyId: "Salin ID", copied: "Disalin", copyFailed: "Pilih dan salin ID secara manual.", whatNext: "Apa yang terjadi selanjutnya", received: "Diterima", inReview: "Sedang ditinjau", live: "Tayang", createAnother: "Buat penawaran lain", notProvided: "Tidak tersedia", dateRange: "Tanggal", bookingMethod: "Metode pemesanan", languageLabel: "Bahasa", logout: "Keluar", stagesProgress: "1 dari 3 tahap selesai", receivedDesc: "Penawaran dan file Anda telah diterima tim Explorer.", now: "Sekarang", reviewDesc: "Tim memeriksa konten, gambar, dan ketentuan Anda.", liveDesc: "Penawaran dapat memerlukan waktu hingga 2 minggu untuk ditayangkan.", summaryEyebrow: "Ringkasan pengiriman", summaryTitle: "Inilah yang kami terima", yourOffer: "Penawaran Anda", submitted: "Dikirim", submittedBy: "Dikirim oleh", howMembersBook: "Cara anggota memesan", bookingLinkLabel: "Tautan pemesanan", noticeLead: "Kami akan menghubungi Anda jika memerlukan informasi tambahan.", noticeBody: (email) => `Pertanyaan tentang penawaran ini akan dikirim ke ${email}.`, prefillHelper: (hotel) => `Detail untuk ${hotel} akan diisikan untuk Anda.`, todayAt: (time) => `Hari ini, ${time}`, rid: "RID", driveLabel: "Arsip pengiriman",
  },
  ja: {
    eyebrow: "提出完了", headline: (type) => `${type}オファーを提出しました`, reference: "オファーID", copyId: "IDをコピー", copied: "コピーしました", copyFailed: "IDを選択して手動でコピーしてください。", whatNext: "今後の流れ", received: "受付済み", inReview: "審査中", live: "公開", createAnother: "別のオファーを作成", notProvided: "未入力", dateRange: "日付", bookingMethod: "予約方法", languageLabel: "言語", logout: "ログアウト", stagesProgress: "3段階中1段階が完了", receivedDesc: "Explorerチームがオファーとファイルを受け取りました。", now: "現在", reviewDesc: "チームが内容、画像、利用規約を確認します。", liveDesc: "オファーの公開には最大2週間かかる場合があります。", summaryEyebrow: "提出内容の概要", summaryTitle: "受け付けた内容", yourOffer: "オファー", submitted: "提出日時", submittedBy: "提出者", howMembersBook: "会員の予約方法", bookingLinkLabel: "予約リンク", noticeLead: "追加情報が必要な場合はご連絡します。", noticeBody: (email) => `このオファーに関する質問は${email}に送信されます。`, prefillHelper: (hotel) => `${hotel}の詳細は自動入力されます。`, todayAt: (time) => `本日 ${time}`, rid: "RID", driveLabel: "提出アーカイブ",
  },
  ar: {
    eyebrow: "اكتمل الإرسال", headline: (type) => `تم إرسال عرض ${type}`, reference: "معرّف العرض", copyId: "نسخ المعرّف", copied: "تم النسخ", copyFailed: "حدد المعرّف وانسخه يدويًا.", whatNext: "ماذا سيحدث بعد ذلك", received: "تم الاستلام", inReview: "قيد المراجعة", live: "منشور", createAnother: "إنشاء عرض آخر", notProvided: "غير متوفر", dateRange: "التواريخ", bookingMethod: "طريقة الحجز", languageLabel: "اللغة", logout: "تسجيل الخروج", stagesProgress: "اكتملت مرحلة واحدة من 3 مراحل", receivedDesc: "أصبح عرضك وملفاتك لدى فريق Explorer.", now: "الآن", reviewDesc: "يراجع الفريق المحتوى والصور والشروط.", liveDesc: "قد يستغرق نشر العروض ما يصل إلى أسبوعين.", summaryEyebrow: "ملخص الإرسال", summaryTitle: "هذا ما استلمناه", yourOffer: "عرضك", submitted: "تم الإرسال", submittedBy: "أرسله", howMembersBook: "كيفية حجز الأعضاء", bookingLinkLabel: "رابط الحجز", noticeLead: "سنتواصل معك إذا احتجنا إلى مزيد من المعلومات.", noticeBody: (email) => `ستُرسل الأسئلة المتعلقة بهذا العرض إلى ${email}.`, prefillHelper: (hotel) => `سيتم ملء تفاصيل ${hotel} لك.`, todayAt: (time) => `اليوم، ${time}`, rid: "RID", driveLabel: "أرشيف الإرسال",
  },
  tr: {
    eyebrow: "Gönderim tamamlandı", headline: (type) => `${type} teklifiniz gönderildi`, reference: "Teklif ID", copyId: "ID'yi kopyala", copied: "Kopyalandı", copyFailed: "ID'yi seçip elle kopyalayın.", whatNext: "Sonraki adımlar", received: "Alındı", inReview: "İnceleniyor", live: "Yayında", createAnother: "Başka bir teklif oluştur", notProvided: "Belirtilmedi", dateRange: "Tarihler", bookingMethod: "Rezervasyon yöntemi", languageLabel: "Dil", logout: "Çıkış yap", stagesProgress: "3 aşamadan 1'i tamamlandı", receivedDesc: "Teklifiniz ve dosyalarınız Explorer ekibine ulaştı.", now: "Şimdi", reviewDesc: "Ekip içeriğinizi, görsellerinizi ve koşullarınızı kontrol eder.", liveDesc: "Tekliflerin yayına alınması 2 haftaya kadar sürebilir.", summaryEyebrow: "Gönderim özeti", summaryTitle: "Aldığımız bilgiler", yourOffer: "Teklifiniz", submitted: "Gönderildi", submittedBy: "Gönderen", howMembersBook: "Üyeler nasıl rezervasyon yapar", bookingLinkLabel: "Rezervasyon bağlantısı", noticeLead: "Daha fazla bilgi gerekirse sizinle iletişime geçeceğiz.", noticeBody: (email) => `Bu teklifle ilgili sorular ${email} adresine gönderilecektir.`, prefillHelper: (hotel) => `${hotel} bilgileri sizin için doldurulacaktır.`, todayAt: (time) => `Bugün, ${time}`, rid: "RID", driveLabel: "Gönderim arşivi",
  },
};

const offerTypes = {
  more_escapes: { label: "More Escapes", iconId: "i-package" }, red_hot_rooms: { label: "Red Hot Rooms", iconId: "i-tag" },
  hotel_stay: { label: "Hotel stay", localized: { th: "การเข้าพักโรงแรม", vi: "Lưu trú khách sạn", id: "Menginap di hotel", ja: "ホテル宿泊", ar: "إقامة فندقية", tr: "Otel konaklaması" }, iconId: "i-bed" },
  dining: { label: "Dining", localized: { th: "การรับประทานอาหาร", vi: "Ẩm thực", id: "Kuliner", ja: "ダイニング", ar: "مطاعم", tr: "Yeme-içme" }, iconId: "i-dining" },
  events: { label: "Events", localized: { th: "กิจกรรม", vi: "Sự kiện", id: "Acara", ja: "イベント", ar: "فعاليات", tr: "Etkinlikler" }, iconId: "i-crown" },
  partners: { label: "Partners", localized: { th: "พาร์ทเนอร์", vi: "Đối tác", id: "Mitra", ja: "パートナー", ar: "الشركاء", tr: "İş ortakları" }, iconId: "i-overlap" },
};
const localeByLanguage = { en: "en-AU", th: "th-TH", vi: "vi-VN", id: "id-ID", ja: "ja-JP", ar: "ar", tr: "tr-TR" };
const confirmation = rawConfirmation ? JSON.parse(rawConfirmation) : null;

function bdi(value) { const element = document.createElement("bdi"); element.textContent = value; return element; }
function isMissing(value, copy) { return !value || value === "Not provided" || value === copy.notProvided; }
function formatSubmitted(value, language, options) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat(localeByLanguage[language] || localeByLanguage.en, options).format(date);
}
function renderDates(value, copy) {
  const target = document.getElementById("confirmationDateRange"); target.replaceChildren();
  if (isMissing(value, copy)) { target.append(bdi(copy.notProvided)); return; }
  String(value).split("\n").filter(Boolean).forEach((line) => {
    const row = document.createElement("span"); row.className = "fact-line";
    const separator = line.indexOf(": ");
    if (separator === -1) row.append(bdi(line));
    else { const label = document.createElement("span"); label.className = "k"; label.textContent = line.slice(0, separator); row.append(label, bdi(line.slice(separator + 2))); }
    target.append(row);
  });
}
function renderBooking(copy) {
  const target = document.getElementById("confirmationBooking"); target.replaceChildren();
  try {
    const url = new URL(confirmation.booking_link); if (!["http:", "https:"].includes(url.protocol)) throw new Error("Unsupported protocol");
    const label = document.createElement("span"); label.className = "k"; label.textContent = copy.bookingLinkLabel;
    const link = document.createElement("a"); link.href = url.href; link.target = "_blank"; link.rel = "noopener"; link.append(bdi(`${url.host}${url.pathname === "/" ? "" : url.pathname}`));
    target.append(label, link);
  } catch (error) { target.append(bdi(isMissing(confirmation.booking_details, copy) ? copy.notProvided : confirmation.booking_details)); }
}
function renderNotice(copy, email) {
  const notice = document.getElementById("confirmationNotice"); notice.replaceChildren();
  const lead = document.createElement("strong"); lead.textContent = copy.noticeLead; notice.append(lead);
  if (!isMissing(email, copy)) { const parts = copy.noticeBody("{email}").split("{email}"); notice.append(document.createTextNode(` ${parts[0]}`), bdi(email), document.createTextNode(parts[1] || "")); }
}
function applyConfirmationLanguage(language) {
  confirmationLanguage = confirmationCopy[language] ? language : "en";
  window.siteHeader?.setLanguage(confirmationLanguage);
  const copy = confirmationCopy[confirmationLanguage];
  document.documentElement.lang = confirmationLanguage;
  document.documentElement.dir = confirmationLanguage === "ar" ? "rtl" : "ltr";
  document.getElementById("languageSelect").value = confirmationLanguage;
  document.querySelectorAll("[data-confirmation-i18n]").forEach((element) => {
    const value = copy[element.dataset.confirmationI18n] ?? confirmationCopy.en[element.dataset.confirmationI18n];
    if (typeof value === "string") element.textContent = value;
  });
  if (!confirmation) return;
  const offerType = offerTypes[confirmation.offer_type] || { label: confirmation.offer_type || "Offer", iconId: "i-tag" };
  const offerTypeLabel = offerType.localized?.[confirmationLanguage] || offerType.label;
  const offerTitle = isMissing(confirmation.offer_tile_title, copy) ? copy.notProvided : confirmation.offer_tile_title;
  const hotelName = isMissing(confirmation.hotel_name, copy) ? copy.notProvided : confirmation.hotel_name;
  document.title = `${offerTitle} | Explorer Offers Collection`;
  document.getElementById("confirmationTitle").textContent = confirmationLanguage === "en"
    ? `Your ${offerTypeLabel} offer is submitted`
    : copy.headline(offerTypeLabel);
  document.getElementById("confirmationTypeLabel").textContent = offerTypeLabel;
  document.getElementById("confirmationTypeIcon").setAttribute("href", `assets/offer-icons.svg#${offerType.iconId}`);
  document.getElementById("confirmationOfferId").textContent = confirmation.offer_id || copy.notProvided;
  document.getElementById("confirmationOfferTitle").replaceChildren(bdi(offerTitle));
  document.getElementById("confirmationHotelName").replaceChildren(bdi(hotelName));
  const subParts = [];
  if (!isMissing(confirmation.hotel_rid_code, copy)) subParts.push(`${copy.rid} ${confirmation.hotel_rid_code}`);
  if (!isMissing(confirmation.city_country, copy)) subParts.push(confirmation.city_country);
  const hotelSub = document.getElementById("confirmationHotelSub"); hotelSub.replaceChildren(); if (subParts.length) hotelSub.append(bdi(subParts.join(" · "))); hotelSub.hidden = !subParts.length;
  const fullSubmitted = formatSubmitted(confirmation.submitted_at, confirmationLanguage, { dateStyle: "medium", timeStyle: "short" });
  document.getElementById("confirmationSubmitted").replaceChildren(bdi(fullSubmitted || copy.notProvided));
  const submittedShort = document.getElementById("confirmationSubmittedShort"); submittedShort.textContent = "";
  if (confirmation.submitted_at && fullSubmitted) {
    const submittedDate = new Date(confirmation.submitted_at); const today = new Date();
    const sameDay = submittedDate.getFullYear() === today.getFullYear() && submittedDate.getMonth() === today.getMonth() && submittedDate.getDate() === today.getDate();
    submittedShort.append(bdi(sameDay ? copy.todayAt(formatSubmitted(confirmation.submitted_at, confirmationLanguage, { timeStyle: "short" })) : fullSubmitted));
  }
  const email = isMissing(confirmation.email, copy) ? copy.notProvided : confirmation.email;
  document.getElementById("confirmationEmail").replaceChildren(bdi(email)); renderDates(confirmation.date_range, copy); renderBooking(copy); renderNotice(copy, email);
}

if (!rawConfirmation) window.location.replace("/");
else {
  window.siteHeader?.setProgress(100);
  const languageSelect = document.getElementById("languageSelect");
  languageSelect.addEventListener("change", () => { localStorage.setItem("explorer-offer-language", languageSelect.value); applyConfirmationLanguage(languageSelect.value); });
  applyConfirmationLanguage(confirmationLanguage);
  const copyStatus = document.getElementById("copyOfferIdStatus");
  document.getElementById("copyOfferIdButton").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(confirmation.offer_id); copyStatus.textContent = confirmationCopy[confirmationLanguage].copied; }
    catch (error) {
      const temporary = document.createElement("textarea"); temporary.value = confirmation.offer_id; temporary.setAttribute("readonly", ""); temporary.style.position = "fixed"; temporary.style.opacity = "0"; document.body.append(temporary); temporary.select();
      const copied = document.execCommand("copy"); temporary.remove(); copyStatus.textContent = copied ? confirmationCopy[confirmationLanguage].copied : confirmationCopy[confirmationLanguage].copyFailed;
    }
  });
  document.getElementById("createAnotherOfferButton").addEventListener("click", () => {
    sessionStorage.setItem("offerHotelPrefill", JSON.stringify({ hotel_name: confirmation.hotel_name || "", hotel_rid_code: confirmation.hotel_rid_code || "", city_country: confirmation.city_country || "" }));
  });
}

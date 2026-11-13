const form = document.querySelector("#offerForm");
const offerType = document.querySelector("#offerType");
const typeSpecificFields = document.querySelector("#typeSpecificFields");
const masterImageInput = document.querySelector("#masterImageInput");
const masterImageMessage = document.querySelector("#masterImageMessage");
const masterBannerPreview = document.querySelector("#masterBannerPreview");
const masterListingPreview = document.querySelector("#masterListingPreview");
const masterSocialPreview = document.querySelector("#masterSocialPreview");
const bannerInput = document.querySelector("#bannerInput");
const bannerPreview = document.querySelector("#bannerPreview");
const bannerMessage = document.querySelector("#bannerMessage");
const listingTileInput = document.querySelector("#listingTileInput");
const listingTilePreview = document.querySelector("#listingTilePreview");
const listingTileMessage = document.querySelector("#listingTileMessage");
const socialInput = document.querySelector("#socialInput");
const socialPreview = document.querySelector("#socialPreview");
const socialMessage = document.querySelector("#socialMessage");
const formMessage = document.querySelector("#formMessage");
const dateMessage = document.querySelector("#dateMessage");
const bookingDialog = document.querySelector("#bookingDialog");
const bookingPreview = document.querySelector("#bookingPreview");
const bookingDialogTitle = document.querySelector("#bookingDialogTitle");
const bookingDialogText = document.querySelector("#bookingDialogText");
const languageSelect = document.querySelector("#languageSelect");
const heroText = document.querySelector("[data-i18n='heroText']");
const sectionNavigationButtons = Array.from(document.querySelectorAll("[data-scroll-target]"));
const formProgressBar = document.querySelector("#formProgressBar");
const offerTypeTiles = Array.from(document.querySelectorAll("[data-offer-type]"));
const translationSourceDisplay = document.querySelector("#translationSourceDisplay");
const translationAvailableLanguages = document.querySelector("#translationAvailableLanguages");
const translationTargetLanguage = document.querySelector("#translationTargetLanguage");
const translateContentButton = document.querySelector("#translateContentButton");
const translationPreviewList = document.querySelector("#translationPreviewList");
const translationStatus = document.querySelector("#translationStatus");
const offerDescription = document.querySelector("#offerDescription");
const alignBrandToneButton = document.querySelector("#alignBrandToneButton");
const brandToneStatus = document.querySelector("#brandToneStatus");
const turnstileContainer = document.querySelector("#turnstileContainer");
const bookingMethodFieldset = document.querySelector("#bookingMethodFieldset");
const bookingLinkFields = document.querySelector("#bookingLinkFields");
const bookingEmailFields = document.querySelector("#bookingEmailFields");
const rateScreenshotCard = document.querySelector("#rateScreenshotCard");
const menuPdfCard = document.querySelector("#menuPdfCard");
const menuPdfMessage = document.querySelector("#menuPdfMessage");
const submissionProgress = document.querySelector("#submissionProgress");
const submissionProgressText = document.querySelector("#submissionProgressText");
const submissionProgressBar = document.querySelector("#submissionProgressBar");
const bookingScreenshotCard = document.querySelector("#bookingScreenshotCard");
const accommodationDetailsCoreField = document.querySelector("#accommodationDetailsCoreField");
const offerSubtitleField = document.querySelector("#offerSubtitleField");
const menuPdfLabel = document.querySelector("#menuPdfLabel");
const menuPdfHelp = document.querySelector("#menuPdfHelp");
const hotelNameInput = form.elements.hotel_name;
const offerTileTitleInput = form.elements.offer_tile_title;
const offerBannerTitleInput = form.elements.offer_banner_title;
const translationComponent = document.querySelector("#translationComponent");
const generatedImagePreviews = document.querySelector("#generatedImagePreviews");
const offerDependentNavigationItems = sectionNavigationButtons
  .filter((button) => button.dataset.scrollTarget !== "offerTypeSection")
  .map((button) => button.closest("li"));

const TURNSTILE_SITE_KEY = "0x4AAAAAAEx2NTrp7G-EkGjO";

let resizedBannerFile = null;
let resizedListingTileFile = null;
let resizedSocialFile = null;
let generatedContentTranslations = {};
let activeTurnstileWidgetId = null;

const maxImageUploadSize = 200 * 1024 * 1024;
const maxPdfUploadSize = 5 * 1024 * 1024;

const uploadRequirementsByOfferType = {
  red_hot_rooms: { rateScreenshot: true, menuPdf: false, bookingScreenshot: false },
  more_escapes: { rateScreenshot: true, menuPdf: false, bookingScreenshot: false },
  hotel_stay: { rateScreenshot: true, menuPdf: false, bookingScreenshot: false },
  dining: { rateScreenshot: false, menuPdf: true, menuPdfRequired: false, bookingScreenshot: true },
  events: { rateScreenshot: false, menuPdf: true, menuPdfRequired: false, bookingScreenshot: true },
  partners: { rateScreenshot: false, menuPdf: false, bookingScreenshot: true },
};

const contentLanguageLabels = {
  en: "English",
  th: "Thai",
  vi: "Vietnamese",
  id: "Bahasa Indonesia",
  ja: "Japanese",
  ar: "Arabic",
  tr: "Turkish",
};

const localizedLanguageLabels = {
  en: { en: "English", th: "Thai", vi: "Vietnamese", id: "Bahasa Indonesia", ja: "Japanese", ar: "Arabic", tr: "Turkish" },
  th: { en: "อังกฤษ", th: "ไทย", vi: "เวียดนาม", id: "บาฮาซาอินโดนีเซีย", ja: "ญี่ปุ่น", ar: "อาหรับ", tr: "ตุรกี" },
  vi: { en: "Tiếng Anh", th: "Tiếng Thái", vi: "Tiếng Việt", id: "Bahasa Indonesia", ja: "Tiếng Nhật", ar: "Tiếng Ả Rập", tr: "Tiếng Thổ Nhĩ Kỳ" },
  id: { en: "Inggris", th: "Thailand", vi: "Vietnam", id: "Bahasa Indonesia", ja: "Jepang", ar: "Arab", tr: "Turki" },
  ja: { en: "英語", th: "タイ語", vi: "ベトナム語", id: "インドネシア語", ja: "日本語", ar: "アラビア語", tr: "トルコ語" },
  ar: { en: "الإنجليزية", th: "التايلاندية", vi: "الفيتنامية", id: "الإندونيسية", ja: "اليابانية", ar: "العربية", tr: "التركية" },
  tr: { en: "İngilizce", th: "Tayca", vi: "Vietnamca", id: "Endonezce", ja: "Japonca", ar: "Arapça", tr: "Türkçe" },
};

function updateTranslationTargetOptions(sourceLanguage) {
  const currentTargets = new Set(Array.from(translationTargetLanguage.selectedOptions).map((option) => option.value));
  const pageLanguage = languageSelect.value || "en";
  const labels = localizedLanguageLabels[pageLanguage] || localizedLanguageLabels.en;
  translationTargetLanguage.innerHTML = "";

  Object.keys(contentLanguageLabels).forEach((code) => {
    if (code === sourceLanguage) return;
    const option = document.createElement("option");
    option.value = code;
    option.textContent = labels[code] || contentLanguageLabels[code];
    option.selected = currentTargets.has(code);
    translationTargetLanguage.append(option);
  });
  if (!translationTargetLanguage.selectedOptions.length && translationTargetLanguage.options.length) translationTargetLanguage.options[0].selected = true;
}

const uiTranslations = {
  en: {
    marketLabel: "Pacific marketing platform",
    languageLabel: "Language",
    heroTitle: "ALL Accor+ Explorer Offers Portal",
    heroText: "Submit stay, dining, event, and partner offers for ALL Accor+ Explorer.",
    startEyebrow: "Offer workspace",
    startTitle: "What would you like to do?",
    startText: "Choose the path that matches your task. New offers open the full submission form, while existing offers can be found by Offer ID or hotel details.",
    createOfferTitle: "Create a new offer",
    createOfferText: "Start a fresh stay, dining, event, partner, Red Hot Rooms, or More Escapes submission.",
    viewOfferTitle: "Retrieve and view an existing offer",
    viewOfferText: "Look up a submitted offer without changing it.",
    editOfferTitle: "Retrieve and edit an existing offer",
    editOfferText: "Find a saved offer, update it, and create a revised package.",
    retrieveViewEyebrow: "Retrieve and view",
    retrieveEditEyebrow: "Retrieve and edit",
    retrieveTitle: "Search for an existing offer",
    retrieveText: "Use the Offer ID from the confirmation screen for the most accurate result. You can also search by hotel name and submitter email.",
    offerIdLabel: "Offer ID",
    retrieveEmailLabel: "Submitter email",
    retrieveHotelLabel: "Hotel name",
    retrieveHotelCodeLabel: "Hotel code",
    offerTitleLabel: "Offer title",
    searchOfferButton: "Search offer",
    backToStartButton: "Back to options",
    retrieveNoCriteriaMessage: "Enter at least one search value.",
    retrieveSearchingMessage: "Searching saved offers...",
    retrieveNoResultsMessage: "No matching offers found.",
    retrieveResultsMessage: "Select an offer below.",
    retrieveEditNotice: "You are editing offer {offerId}. Existing uploaded images are stored as metadata only; upload new images if you want them included in the revised package.",
    retrieveImagesNotice: "Uploaded image files are stored as metadata only in this release.",
    updateSubmitButton: "Update Package and Submit",
    confirmationEyebrow: "Submission complete",
    confirmationTitle: "Offer submitted successfully",
    confirmationText: "Your offer package has been created and the submission has been recorded.",
    submissionDateRangeLabel: "Submission date range",
    createAnotherButton: "Create another offer",
    backToOptionsButton: "Back to options",
    sideEyebrow: "Explorer partners",
    sideTitle: "Offer Submission",
    stepType: "Offer type",
    stepHotel: "Hotel details",
    stepOffer: "Offer and dates",
    stepProof: "Proof and forms",
    stepImages: "Images and review",
    stepTranslations: "Translations",
    formEyebrow: "Stay and dining offers",
    formTitle: "Create your Explorer offer",
    offerTypeQuestion: "What type of offer are you submitting?",
    offerTypeHelp: "Your choice determines the dates, pricing, and supporting information requested below.",
    offerTypeHotelStay: "Hotel stay",
    offerTypeDining: "Dining",
    offerTypeEvents: "Events",
    offerTypePartners: "Partner Offers",
    statusPill: "Asana submission",
    hotelDetails: "Hotel details",
    coreContent: "Core offer content",
    datesBooking: "Dates and booking",
    proofForms: "Proof and required forms",
    imagesTitle: "Images",
    finalAcknowledgement: "Final acknowledgement",
    clearButton: "Clear",
    submitButton: "Submit Offer",
    dialogTitle: "Double-check the booking link",
    dialogText: "Hotels will send guests to this exact URL. Please confirm it opens the correct booking page for this offer.",
    goBackButton: "Go back",
    confirmButton: "Confirm and submit",
    alignBrandToneButton: "Align Offer Description with Brand Tone (Optional)",
    alignBrandToneEmpty: "Enter an offer description first.",
    alignBrandToneWorking: "Aligning...",
    alignBrandToneProgress: "Rewriting your description in the Explorer brand tone...",
    alignBrandToneSuccess: "Brand-aligned draft ready. You can edit it before submitting.",
    alignBrandToneError: "Brand tone alignment failed.",
    turnstileVerifying: "Verifying submission...",
    turnstileUnavailable: "We could not verify this submission. Please try again.",
    bookingLinkChecking: "Checking booking link...",
    bookingLinkLiveTitle: "Booking link is live",
    bookingLinkLiveText: "The link has been validated and is live. You can continue with the submission.",
    bookingLinkNotLiveTitle: "Booking link is not live",
    bookingLinkNotLiveText: "This offer cannot be submitted until the booking link is live. Check the link, publish the booking page, and try again.",
    continueButton: "Continue",
  },
  th: {
    alignBrandToneButton: "ปรับคำอธิบายข้อเสนอให้สอดคล้องกับโทนแบรนด์ (ไม่บังคับ)",
    alignBrandToneEmpty: "โปรดกรอกรายละเอียดข้อเสนอก่อน",
    alignBrandToneWorking: "กำลังปรับโทน...",
    alignBrandToneProgress: "กำลังปรับรายละเอียดให้สอดคล้องกับโทนแบรนด์ Explorer...",
    alignBrandToneSuccess: "ฉบับร่างที่ปรับตามโทนแบรนด์พร้อมแล้ว คุณสามารถแก้ไขก่อนส่งได้",
    alignBrandToneError: "ไม่สามารถปรับให้สอดคล้องกับโทนแบรนด์ได้",
    turnstileVerifying: "กำลังตรวจสอบการส่งข้อมูล...",
    turnstileUnavailable: "เราไม่สามารถตรวจสอบการส่งข้อมูลนี้ได้ โปรดลองอีกครั้ง",
    stepType: "ประเภทข้อเสนอ",
    offerTypeQuestion: "คุณกำลังส่งข้อเสนอประเภทใด?",
    offerTypeHelp: "ตัวเลือกของคุณจะกำหนดวันที่ ราคา และข้อมูลประกอบที่ต้องระบุด้านล่าง",
    marketLabel: "แพลตฟอร์มการตลาดแปซิฟิก",
    languageLabel: "ภาษา",
    heroTitle: "พอร์ทัลข้อเสนอ ALL Accor+ Explorer",
    heroText: "สร้างข้อเสนอสำหรับโรงแรม ห้องอาหาร อีเวนต์ และพาร์ทเนอร์ให้พร้อมสำหรับแคมเปญ Explorer",
    startEyebrow: "พื้นที่ทำงานข้อเสนอ",
    startTitle: "คุณต้องการทำอะไร?",
    startText: "เลือกเส้นทางที่ตรงกับงานของคุณ ข้อเสนอใหม่จะเปิดแบบฟอร์มเต็ม ส่วนข้อเสนอเดิมสามารถค้นหาด้วย Offer ID หรือรายละเอียดโรงแรม",
    createOfferTitle: "สร้างข้อเสนอใหม่",
    createOfferText: "เริ่มส่งข้อเสนอใหม่สำหรับห้องพัก ห้องอาหาร อีเวนต์ พาร์ทเนอร์ Red Hot Rooms หรือ More Escapes",
    viewOfferTitle: "เรียกดูและดูข้อเสนอเดิม",
    viewOfferText: "ค้นหาข้อเสนอที่ส่งแล้วโดยไม่แก้ไข",
    editOfferTitle: "เรียกดูและแก้ไขข้อเสนอเดิม",
    editOfferText: "ค้นหาข้อเสนอที่บันทึกไว้ แก้ไข และสร้างแพ็กเกจฉบับปรับปรุง",
    retrieveViewEyebrow: "เรียกดูและดู",
    retrieveEditEyebrow: "เรียกดูและแก้ไข",
    retrieveTitle: "ค้นหาข้อเสนอเดิม",
    retrieveText: "ใช้ Offer ID จากหน้าการยืนยันเพื่อผลลัพธ์ที่แม่นยำที่สุด หรือค้นหาด้วยชื่อโรงแรมและอีเมลผู้ส่ง",
    offerIdLabel: "Offer ID",
    retrieveEmailLabel: "อีเมลผู้ส่ง",
    retrieveHotelLabel: "ชื่อโรงแรม",
    retrieveHotelCodeLabel: "รหัสโรงแรม",
    offerTitleLabel: "ชื่อข้อเสนอ",
    searchOfferButton: "ค้นหาข้อเสนอ",
    backToStartButton: "กลับไปยังตัวเลือก",
    retrieveNoCriteriaMessage: "กรอกค่าค้นหาอย่างน้อยหนึ่งรายการ",
    retrieveSearchingMessage: "กำลังค้นหาข้อเสนอที่บันทึกไว้...",
    retrieveNoResultsMessage: "ไม่พบข้อเสนอที่ตรงกัน",
    retrieveResultsMessage: "เลือกข้อเสนอด้านล่าง",
    retrieveEditNotice: "คุณกำลังแก้ไขข้อเสนอ {offerId} ไฟล์ภาพเดิมถูกจัดเก็บเป็นข้อมูลเมตาเท่านั้น โปรดอัปโหลดภาพใหม่หากต้องการรวมไว้ในแพ็กเกจฉบับปรับปรุง",
    retrieveImagesNotice: "ไฟล์ภาพที่อัปโหลดถูกจัดเก็บเป็นข้อมูลเมตาเท่านั้นในรุ่นนี้",
    updateSubmitButton: "อัปเดตแพ็กเกจและส่ง",
    confirmationEyebrow: "ส่งข้อมูลเสร็จสมบูรณ์",
    confirmationTitle: "ส่งข้อเสนอสำเร็จ",
    confirmationText: "สร้างแพ็กเกจข้อเสนอและบันทึกการส่งข้อมูลเรียบร้อยแล้ว",
    submissionDateRangeLabel: "ช่วงวันที่ของการส่งข้อเสนอ",
    createAnotherButton: "สร้างข้อเสนออื่น",
    backToOptionsButton: "กลับไปยังตัวเลือก",
    sideEyebrow: "พันธมิตร Explorer",
    sideTitle: "ส่งข้อเสนอ",
    stepHotel: "รายละเอียดโรงแรม",
    stepOffer: "ข้อเสนอและวันที่",
    stepProof: "หลักฐานและแบบฟอร์ม",
    stepImages: "รูปภาพและตรวจทาน",
    stepTranslations: "การแปล",
    formEyebrow: "ข้อเสนอห้องพักและห้องอาหาร",
    formTitle: "Submit a complete offer in one pass",
    statusPill: "แพ็กเกจแบบสแตติก",
    hotelDetails: "รายละเอียดโรงแรม",
    coreContent: "เนื้อหาหลักของข้อเสนอ",
    datesBooking: "วันที่และลิงก์จอง",
    proofForms: "หลักฐานและไฟล์ที่ต้องใช้",
    imagesTitle: "รูปภาพ",
    finalAcknowledgement: "การรับทราบขั้นสุดท้าย",
    clearButton: "ล้างข้อมูล",
    submitButton: "ส่งข้อเสนอ",
    dialogTitle: "ตรวจสอบลิงก์จองอีกครั้ง",
    dialogText: "แขกจะถูกส่งไปยัง URL นี้ โปรดยืนยันว่าเป็นหน้าจองที่ถูกต้องสำหรับข้อเสนอนี้",
    goBackButton: "กลับไปแก้ไข",
    confirmButton: "ยืนยันและสร้างแพ็กเกจ",
  },
  vi: {
    alignBrandToneButton: "Điều chỉnh mô tả ưu đãi theo giọng thương hiệu (không bắt buộc)",
    alignBrandToneEmpty: "Vui lòng nhập mô tả ưu đãi trước.",
    alignBrandToneWorking: "Đang điều chỉnh...",
    alignBrandToneProgress: "Đang viết lại mô tả theo giọng điệu thương hiệu Explorer...",
    alignBrandToneSuccess: "Bản nháp theo giọng điệu thương hiệu đã sẵn sàng. Bạn có thể chỉnh sửa trước khi gửi.",
    alignBrandToneError: "Không thể điều chỉnh theo giọng điệu thương hiệu.",
    turnstileVerifying: "Đang xác minh nội dung gửi...",
    turnstileUnavailable: "Không thể xác minh nội dung gửi này. Vui lòng thử lại.",
    stepType: "Loại ưu đãi",
    offerTypeQuestion: "Bạn đang gửi loại ưu đãi nào?",
    offerTypeHelp: "Lựa chọn của bạn sẽ xác định ngày, mức giá và thông tin hỗ trợ cần cung cấp bên dưới.",
    marketLabel: "Nền tảng tiếp thị Pacific",
    languageLabel: "Ngôn ngữ",
    heroTitle: "Cổng ưu đãi ALL Accor+ Explorer",
    heroText: "Tạo ưu đãi khách sạn, ẩm thực, sự kiện và đối tác sẵn sàng cho chiến dịch Explorer.",
    startEyebrow: "Không gian ưu đãi",
    startTitle: "Bạn muốn làm gì?",
    startText: "Chọn luồng phù hợp với công việc. Ưu đãi mới sẽ mở biểu mẫu đầy đủ, còn ưu đãi hiện có có thể tìm bằng Offer ID hoặc thông tin khách sạn.",
    createOfferTitle: "Tạo ưu đãi mới",
    createOfferText: "Bắt đầu một ưu đãi lưu trú, ẩm thực, sự kiện, đối tác, Red Hot Rooms hoặc More Escapes mới.",
    viewOfferTitle: "Truy xuất và xem ưu đãi hiện có",
    viewOfferText: "Tìm ưu đãi đã gửi mà không thay đổi nội dung.",
    editOfferTitle: "Truy xuất và chỉnh sửa ưu đãi hiện có",
    editOfferText: "Tìm ưu đãi đã lưu, cập nhật và tạo gói đã chỉnh sửa.",
    retrieveViewEyebrow: "Truy xuất và xem",
    retrieveEditEyebrow: "Truy xuất và chỉnh sửa",
    retrieveTitle: "Tìm kiếm ưu đãi hiện có",
    retrieveText: "Dùng Offer ID từ màn hình xác nhận để có kết quả chính xác nhất. Bạn cũng có thể tìm bằng tên khách sạn và email người gửi.",
    offerIdLabel: "Offer ID",
    retrieveEmailLabel: "Email người gửi",
    retrieveHotelLabel: "Tên khách sạn",
    retrieveHotelCodeLabel: "Mã khách sạn",
    offerTitleLabel: "Tiêu đề ưu đãi",
    searchOfferButton: "Tìm ưu đãi",
    backToStartButton: "Quay lại lựa chọn",
    retrieveNoCriteriaMessage: "Nhập ít nhất một giá trị tìm kiếm.",
    retrieveSearchingMessage: "Đang tìm ưu đãi đã lưu...",
    retrieveNoResultsMessage: "Không tìm thấy ưu đãi phù hợp.",
    retrieveResultsMessage: "Chọn một ưu đãi bên dưới.",
    retrieveEditNotice: "Bạn đang chỉnh sửa ưu đãi {offerId}. Ảnh đã tải trước đó chỉ được lưu dưới dạng metadata; hãy tải ảnh mới nếu muốn đưa vào gói đã chỉnh sửa.",
    retrieveImagesNotice: "Ảnh đã tải lên chỉ được lưu dưới dạng metadata trong bản phát hành này.",
    updateSubmitButton: "Cập nhật gói và gửi",
    confirmationEyebrow: "Gửi hoàn tất",
    confirmationTitle: "Ưu đãi đã được gửi thành công",
    confirmationText: "Gói ưu đãi đã được tạo và nội dung gửi đã được ghi nhận.",
    submissionDateRangeLabel: "Khoảng ngày gửi",
    createAnotherButton: "Tạo ưu đãi khác",
    backToOptionsButton: "Quay lại lựa chọn",
    sideEyebrow: "Đối tác Explorer",
    sideTitle: "Gửi ưu đãi",
    stepHotel: "Thông tin khách sạn",
    stepOffer: "Ưu đãi và ngày",
    stepProof: "Bằng chứng và biểu mẫu",
    stepImages: "Hình ảnh và rà soát",
    stepTranslations: "Bản dịch",
    formEyebrow: "Ưu đãi lưu trú và ẩm thực",
    formTitle: "Submit a complete offer in one pass",
    statusPill: "Gói tĩnh",
    hotelDetails: "Thông tin khách sạn",
    coreContent: "Nội dung chính của ưu đãi",
    datesBooking: "Ngày và đặt chỗ",
    proofForms: "Bằng chứng và tệp cần thiết",
    imagesTitle: "Hình ảnh",
    finalAcknowledgement: "Xác nhận cuối cùng",
    clearButton: "Xóa",
    submitButton: "Gửi ưu đãi",
    dialogTitle: "Kiểm tra lại liên kết đặt chỗ",
    dialogText: "Khách sẽ được chuyển đến chính URL này. Vui lòng xác nhận đây là trang đặt chỗ đúng cho ưu đãi.",
    goBackButton: "Quay lại",
    confirmButton: "Xác nhận và tạo gói",
  },
  id: {
    alignBrandToneButton: "Selaraskan deskripsi penawaran dengan gaya merek (opsional)",
    alignBrandToneEmpty: "Masukkan deskripsi penawaran terlebih dahulu.",
    alignBrandToneWorking: "Sedang menyesuaikan...",
    alignBrandToneProgress: "Sedang menulis ulang deskripsi dengan gaya bahasa merek Explorer...",
    alignBrandToneSuccess: "Draf dengan gaya bahasa merek sudah siap. Anda dapat mengeditnya sebelum mengirim.",
    alignBrandToneError: "Penyesuaian gaya bahasa merek gagal.",
    turnstileVerifying: "Sedang memverifikasi pengiriman...",
    turnstileUnavailable: "Kami tidak dapat memverifikasi pengiriman ini. Silakan coba lagi.",
    stepType: "Jenis penawaran",
    offerTypeQuestion: "Jenis penawaran apa yang Anda kirimkan?",
    offerTypeHelp: "Pilihan Anda akan menentukan tanggal, harga, dan informasi pendukung yang diminta di bawah ini.",
    marketLabel: "Platform pemasaran Pacific",
    languageLabel: "Bahasa",
    heroTitle: "Portal Penawaran ALL Accor+ Explorer",
    heroText: "Buat penawaran hotel, dining, event, dan partner yang siap untuk kampanye Explorer.",
    startEyebrow: "Ruang kerja penawaran",
    startTitle: "Apa yang ingin Anda lakukan?",
    startText: "Pilih alur yang sesuai dengan tugas Anda. Penawaran baru membuka formulir lengkap, sementara penawaran lama dapat dicari dengan Offer ID atau detail hotel.",
    createOfferTitle: "Buat penawaran baru",
    createOfferText: "Mulai pengiriman baru untuk stay, dining, event, partner, Red Hot Rooms, atau More Escapes.",
    viewOfferTitle: "Ambil dan lihat penawaran yang ada",
    viewOfferText: "Cari penawaran yang sudah dikirim tanpa mengubahnya.",
    editOfferTitle: "Ambil dan edit penawaran yang ada",
    editOfferText: "Temukan penawaran tersimpan, perbarui, lalu buat paket revisi.",
    retrieveViewEyebrow: "Ambil dan lihat",
    retrieveEditEyebrow: "Ambil dan edit",
    retrieveTitle: "Cari penawaran yang ada",
    retrieveText: "Gunakan Offer ID dari layar konfirmasi untuk hasil paling akurat. Anda juga bisa mencari dengan nama hotel dan email pengirim.",
    offerIdLabel: "Offer ID",
    retrieveEmailLabel: "Email pengirim",
    retrieveHotelLabel: "Nama hotel",
    retrieveHotelCodeLabel: "Kode hotel",
    offerTitleLabel: "Judul penawaran",
    searchOfferButton: "Cari penawaran",
    backToStartButton: "Kembali ke opsi",
    retrieveNoCriteriaMessage: "Masukkan setidaknya satu nilai pencarian.",
    retrieveSearchingMessage: "Mencari penawaran tersimpan...",
    retrieveNoResultsMessage: "Tidak ada penawaran yang cocok.",
    retrieveResultsMessage: "Pilih penawaran di bawah ini.",
    retrieveEditNotice: "Anda sedang mengedit penawaran {offerId}. Gambar yang sudah diunggah hanya disimpan sebagai metadata; unggah gambar baru jika ingin memasukkannya ke paket revisi.",
    retrieveImagesNotice: "File gambar yang diunggah hanya disimpan sebagai metadata pada rilis ini.",
    updateSubmitButton: "Perbarui Paket dan Kirim",
    confirmationEyebrow: "Pengiriman selesai",
    confirmationTitle: "Penawaran berhasil dikirim",
    confirmationText: "Paket penawaran telah dibuat dan pengajuan telah dicatat.",
    submissionDateRangeLabel: "Rentang tanggal pengiriman",
    createAnotherButton: "Buat penawaran lain",
    backToOptionsButton: "Kembali ke opsi",
    sideEyebrow: "Mitra Explorer",
    sideTitle: "Pengiriman penawaran",
    stepHotel: "Detail hotel",
    stepOffer: "Penawaran dan tanggal",
    stepProof: "Bukti dan formulir",
    stepImages: "Gambar dan tinjauan",
    stepTranslations: "Terjemahan",
    formEyebrow: "Penawaran menginap dan dining",
    formTitle: "Submit a complete offer in one pass",
    statusPill: "Paket statis",
    hotelDetails: "Detail hotel",
    coreContent: "Konten utama penawaran",
    datesBooking: "Tanggal dan pemesanan",
    proofForms: "Bukti dan file wajib",
    imagesTitle: "Gambar",
    finalAcknowledgement: "Persetujuan akhir",
    clearButton: "Hapus",
    submitButton: "Kirim Penawaran",
    dialogTitle: "Periksa kembali tautan pemesanan",
    dialogText: "Tamu akan diarahkan ke URL ini. Pastikan tautan membuka halaman pemesanan yang benar untuk penawaran ini.",
    goBackButton: "Kembali",
    confirmButton: "Konfirmasi dan buat paket",
  },
  ja: {
    alignBrandToneButton: "オファー説明をブランドトーンに合わせる（任意）",
    alignBrandToneEmpty: "まずオファー説明を入力してください。",
    alignBrandToneWorking: "調整中...",
    alignBrandToneProgress: "Explorerのブランドトーンに合わせて説明を書き換えています...",
    alignBrandToneSuccess: "ブランドトーンに沿った下書きが完成しました。送信前に編集できます。",
    alignBrandToneError: "ブランドトーンの調整に失敗しました。",
    turnstileVerifying: "送信内容を確認しています...",
    turnstileUnavailable: "この送信を確認できませんでした。もう一度お試しください。",
    stepType: "オファー種別",
    offerTypeQuestion: "どの種類のオファーを送信しますか？",
    offerTypeHelp: "選択した種類に応じて、日付、料金、必要な補足情報が以下に表示されます。",
    marketLabel: "パシフィック マーケティング プラットフォーム",
    languageLabel: "言語",
    heroTitle: "ALL Accor+ Explorer オファーポータル",
    heroText: "Explorerキャンペーン向けのホテル、ダイニング、イベント、パートナーオファーを作成します。",
    startEyebrow: "オファーワークスペース",
    startTitle: "何を行いますか？",
    startText: "作業に合う項目を選択してください。新規オファーは提出フォームを開き、既存オファーはOffer IDまたはホテル情報で検索できます。",
    createOfferTitle: "新しいオファーを作成",
    createOfferText: "宿泊、ダイニング、イベント、パートナー、Red Hot Rooms、More Escapesの新規提出を開始します。",
    viewOfferTitle: "既存オファーを取得して表示",
    viewOfferText: "提出済みオファーを変更せずに確認します。",
    editOfferTitle: "既存オファーを取得して編集",
    editOfferText: "保存済みオファーを見つけ、更新し、修正版パッケージを作成します。",
    retrieveViewEyebrow: "取得して表示",
    retrieveEditEyebrow: "取得して編集",
    retrieveTitle: "既存オファーを検索",
    retrieveText: "確認画面のOffer IDを使うと最も正確です。ホテル名と提出者メールでも検索できます。",
    offerIdLabel: "Offer ID",
    retrieveEmailLabel: "提出者メール",
    retrieveHotelLabel: "ホテル名",
    retrieveHotelCodeLabel: "ホテルコード",
    offerTitleLabel: "オファータイトル",
    searchOfferButton: "オファーを検索",
    backToStartButton: "選択肢に戻る",
    retrieveNoCriteriaMessage: "検索値を少なくとも1つ入力してください。",
    retrieveSearchingMessage: "保存済みオファーを検索しています...",
    retrieveNoResultsMessage: "一致するオファーが見つかりません。",
    retrieveResultsMessage: "下のオファーを選択してください。",
    retrieveEditNotice: "オファー {offerId} を編集中です。既存の画像はメタデータのみ保存されています。修正版パッケージに含める場合は新しい画像をアップロードしてください。",
    retrieveImagesNotice: "このリリースでは、アップロード画像ファイルはメタデータのみ保存されます。",
    updateSubmitButton: "パッケージを更新して送信",
    confirmationEyebrow: "提出完了",
    confirmationTitle: "オファーが正常に送信されました",
    confirmationText: "オファーパッケージが作成され、提出内容が記録されました。",
    submissionDateRangeLabel: "提出日付範囲",
    createAnotherButton: "別のオファーを作成",
    backToOptionsButton: "選択肢に戻る",
    sideEyebrow: "Explorer パートナー",
    sideTitle: "オファー提出",
    stepHotel: "ホテル情報",
    stepOffer: "オファーと日付",
    stepProof: "証明資料とフォーム",
    stepImages: "画像と確認",
    stepTranslations: "翻訳",
    formEyebrow: "宿泊・ダイニングオファー",
    formTitle: "Submit a complete offer in one pass",
    statusPill: "静的パッケージ",
    hotelDetails: "ホテル情報",
    coreContent: "オファー基本内容",
    datesBooking: "日付と予約",
    proofForms: "証明資料と必要ファイル",
    imagesTitle: "画像",
    finalAcknowledgement: "最終確認",
    clearButton: "クリア",
    submitButton: "オファーを送信",
    dialogTitle: "予約リンクを再確認",
    dialogText: "ゲストはこのURLに移動します。このオファーの正しい予約ページであることを確認してください。",
    goBackButton: "戻る",
    confirmButton: "確認してパッケージ作成",
  },
  ar: {
    languageLabel: "اللغة",
    heroTitle: "بوابة عروض ALL Accor+ Explorer",
    heroText: "أرسل عروض الإقامة والمطاعم والفعاليات والشركاء إلى ALL Accor+ Explorer.",
    confirmationEyebrow: "اكتمل الإرسال",
    confirmationTitle: "تم إرسال العرض بنجاح",
    confirmationText: "تم إنشاء حزمة العرض وتسجيل الإرسال.",
    submissionDateRangeLabel: "نطاق تاريخ الإرسال",
    createAnotherButton: "إنشاء عرض آخر",
    sideTitle: "إرسال العرض",
    stepType: "نوع العرض",
    stepHotel: "تفاصيل الفندق",
    stepOffer: "العرض والتواريخ",
    stepProof: "الإثباتات والنماذج",
    stepImages: "الصور والمراجعة",
    stepTranslations: "الترجمات",
    formEyebrow: "عروض الإقامة والمطاعم",
    formTitle: "أنشئ عرض Explorer الخاص بك",
    offerTypeQuestion: "ما نوع العرض الذي ترسله؟",
    offerTypeHelp: "يحدد اختيارك التواريخ والأسعار والمعلومات الداعمة المطلوبة أدناه.",
    offerTypeHotelStay: "إقامة فندقية",
    offerTypeDining: "مطاعم",
    offerTypeEvents: "فعاليات",
    offerTypePartners: "شركاء",
    hotelDetails: "تفاصيل الفندق",
    coreContent: "محتوى العرض الأساسي",
    datesBooking: "التواريخ والحجز",
    proofForms: "الإثباتات والنماذج المطلوبة",
    imagesTitle: "الصور",
    finalAcknowledgement: "الإقرار النهائي",
    clearButton: "مسح",
    submitButton: "إرسال العرض",
    dialogTitle: "تحقق من رابط الحجز",
    dialogText: "سيتم توجيه الضيوف إلى هذا الرابط تحديدًا. يرجى التأكد من أنه يفتح صفحة الحجز الصحيحة لهذا العرض.",
    goBackButton: "رجوع",
    confirmButton: "تأكيد وإرسال",
    alignBrandToneButton: "مواءمة وصف العرض مع نبرة العلامة التجارية (اختياري)",
    alignBrandToneEmpty: "أدخل وصف العرض أولًا.",
    alignBrandToneWorking: "جارٍ المواءمة...",
    alignBrandToneProgress: "جارٍ إعادة صياغة الوصف وفق نبرة علامة Explorer...",
    alignBrandToneSuccess: "المسودة المتوافقة مع نبرة العلامة جاهزة. يمكنك تعديلها قبل الإرسال.",
    alignBrandToneError: "تعذرت مواءمة نبرة العلامة التجارية.",
    turnstileVerifying: "جارٍ التحقق من الإرسال...",
    turnstileUnavailable: "تعذر التحقق من هذا الإرسال. يرجى المحاولة مرة أخرى.",
  },
  tr: {
    marketLabel: "Pasifik pazarlama platformu", languageLabel: "Dil", heroTitle: "ALL Accor+ Explorer Teklif Portalı", heroText: "ALL Accor+ Explorer için konaklama, yeme-içme, etkinlik ve iş ortağı teklifleri gönderin.",
    startEyebrow: "Teklif çalışma alanı", startTitle: "Ne yapmak istersiniz?", startText: "Görevinize uygun yolu seçin.", createOfferTitle: "Yeni teklif oluştur", createOfferText: "Yeni bir Explorer teklifi başlatın.", viewOfferTitle: "Mevcut teklifi görüntüle", viewOfferText: "Gönderilmiş bir teklifi değiştirmeden bulun.", editOfferTitle: "Mevcut teklifi düzenle", editOfferText: "Kaydedilmiş bir teklifi bulun ve güncelleyin.",
    confirmationEyebrow: "Gönderim tamamlandı", confirmationTitle: "Teklif başarıyla gönderildi", confirmationText: "Teklif kaydedildi ve Asana görevi oluşturuldu.", submissionDateRangeLabel: "Gönderim tarih aralığı", createAnotherButton: "Başka bir teklif oluştur", backToOptionsButton: "Seçeneklere dön",
    sideTitle: "Teklif Gönderimi", stepType: "Teklif türü", stepHotel: "Otel bilgileri", stepOffer: "Teklif ve tarihler", stepProof: "Kanıt ve formlar", stepImages: "Görseller ve inceleme", stepTranslations: "Çeviriler", formEyebrow: "Konaklama ve yeme-içme teklifleri", formTitle: "Explorer teklifinizi oluşturun",
    offerTypeQuestion: "Hangi tür teklifi gönderiyorsunuz?", offerTypeHelp: "Seçiminiz aşağıda istenecek tarihleri, fiyatları ve destekleyici bilgileri belirler.", offerTypeHotelStay: "Otel konaklaması", offerTypeDining: "Yeme-içme", offerTypeEvents: "Etkinlikler", offerTypePartners: "İş ortakları", hotelDetails: "Otel bilgileri", coreContent: "Temel teklif içeriği", datesBooking: "Tarihler ve rezervasyon", proofForms: "Kanıt ve gerekli formlar", imagesTitle: "Görseller", finalAcknowledgement: "Son onay", clearButton: "Temizle", submitButton: "Teklifi Gönder", goBackButton: "Geri dön", continueButton: "Devam et",
    alignBrandToneButton: "Marka tonuna uyarla", alignBrandToneEmpty: "Önce bir teklif açıklaması girin.", alignBrandToneWorking: "Uyarlanıyor...", alignBrandToneProgress: "Açıklamanız Explorer marka tonuna göre yeniden yazılıyor...", alignBrandToneSuccess: "Marka tonuna uygun taslak hazır. Göndermeden önce düzenleyebilirsiniz.", alignBrandToneError: "Marka tonu uyarlaması başarısız oldu.", turnstileVerifying: "Gönderim doğrulanıyor...", turnstileUnavailable: "Bu gönderim doğrulanamadı. Lütfen tekrar deneyin.", bookingLinkChecking: "Rezervasyon bağlantısı kontrol ediliyor...", bookingLinkLiveTitle: "Rezervasyon bağlantısı aktif", bookingLinkLiveText: "Bağlantı doğrulandı ve aktif. Gönderime devam edebilirsiniz.", bookingLinkNotLiveTitle: "Rezervasyon bağlantısı aktif değil", bookingLinkNotLiveText: "Rezervasyon bağlantısı aktif olana kadar bu teklif gönderilemez. Bağlantıyı kontrol edin, rezervasyon sayfasını yayımlayın ve tekrar deneyin.",
  },
};

const formCopyTranslations = {
  en: {
    emailLabel: "Email",
    requiredFieldsNote: "Fields marked * are mandatory.",
    contactNameLabel: "Person in-charge name",
    hotelRidLabel: "Hotel RID code",
    hotelNameLabel: "Hotel name",
    offerTypeLabel: "Offer type",
    selectOne: "Select one",
    cityCountryLabel: "City - Country",
    offerTileTitleLabel: "Offer tile title",
    offerBannerTitleLabel: "Offer banner title",
    offerSubtitleLabel: "Offer subtitle",
    metaDescriptionLabel: "Meta description",
    offerDescriptionLabel: "Offer description",
    bookingLinkLabel: "Booking link",
    bookingMethodQuestion: "How can members book?",
    bookingMethodLink: "Booking link",
    bookingMethodEmailRsvp: "Booking via email / RSVP form",
    bookingEmailRsvpLabel: "Booking email or RSVP form",
    bookingEmailRsvpPlaceholder: "Enter the email address, email instructions, or RSVP form URL.",
    termsLabel: "Terms and conditions",
    rateScreenshotLabel: "Rate screenshot",
    rateScreenshotHelp: "Please show the loaded rate available at all.com. Max 1 MB image.",
    menuPdfLabel: "Dining / event menu PDF",
    menuPdfHelp: "Please merge PDFs into one file. PDF must be less than 5 MB.",
    bookingScreenshotLabel: "Final booking page screenshot",
    bookingScreenshotHelp: "Required for dining, event, and partner offers. Max 1 MB image.",
    departmentConfirmationText: "All relevant hotel departments can confirm the rate loading is set up correctly for members to book.",
    masterImageTitle: "Use one image for all placements",
    masterImageHelp: "Upload one high-quality image and the app will resize it into banner, listing tile, and social versions.",
    bannerImageTitle: "Banner image",
    bannerImageHelp: "Upload any image size. The app will auto-resize it to 2048 x 1366px JPG. Source file must not exceed 200 MB. No text and no logo.",
    listingTileImageTitle: "Listing tile image",
    listingTileImageHelp: "Upload any image size. The app will auto-resize it to 400 x 250px JPG. Source file must not exceed 200 MB.",
    socialImageTitle: "Social image",
    socialImageHelp: "Upload any image size. The app will auto-resize it to 1080 x 1080px JPG. Source file must not exceed 200 MB.",
    translationPreviewTitle: "Translate content",
    translationSourcePrefix: "The offer content entered above is treated as",
    translationSourceSuffix: "based on the language selected in the top-right corner.",
    previewInLabel: "Preview in",
    previewTranslatedButton: "Translate Content",
    savePreviewButton: "Save translation",
    translatedPreviewLabel: "Translated preview",
    translationEditHelp: "Review or edit this optional draft. Any text in this box is included automatically with the offer.",
    acknowledgementText: "I understand incomplete or inaccurate submissions may delay promotion, and assets are due 6 weeks in advance.",
  },
  th: {
    formTitle: "สร้างข้อเสนอ Explorer ของคุณ",
    requiredFieldsNote: "ช่องที่มีเครื่องหมาย * จำเป็นต้องกรอก",
    submitButton: "สร้างแพ็กเกจและส่ง",
    emailLabel: "อีเมล",
    contactNameLabel: "ชื่อผู้รับผิดชอบ",
    hotelRidLabel: "รหัส RID ของโรงแรม",
    hotelNameLabel: "ชื่อโรงแรม",
    offerTypeLabel: "ประเภทข้อเสนอ",
    selectOne: "เลือกหนึ่งรายการ",
    cityCountryLabel: "เมือง - ประเทศ",
    offerTileTitleLabel: "ชื่อข้อเสนอในไทล์",
    offerBannerTitleLabel: "ชื่อข้อเสนอในแบนเนอร์",
    offerSubtitleLabel: "คำบรรยายข้อเสนอ",
    metaDescriptionLabel: "คำอธิบายเมตา",
    offerDescriptionLabel: "รายละเอียดข้อเสนอ",
    bookingLinkLabel: "ลิงก์จอง",
    bookingMethodQuestion: "สมาชิกสามารถจองได้อย่างไร?",
    bookingMethodLink: "ลิงก์จอง",
    bookingMethodEmailRsvp: "จองผ่านอีเมล / แบบฟอร์ม RSVP",
    bookingEmailRsvpLabel: "อีเมลสำหรับจองหรือแบบฟอร์ม RSVP",
    bookingEmailRsvpPlaceholder: "กรอกที่อยู่อีเมล คำแนะนำทางอีเมล หรือ URL แบบฟอร์ม RSVP",
    termsLabel: "ข้อกำหนดและเงื่อนไข",
    rateScreenshotLabel: "ภาพหน้าจอราคา",
    rateScreenshotHelp: "โปรดแสดงราคาที่โหลดไว้บน all.com ขนาดภาพสูงสุด 1 MB",
    menuPdfLabel: "เมนู PDF สำหรับห้องอาหาร / อีเวนต์",
    menuPdfHelp: "โปรดรวมไฟล์ PDF เป็นไฟล์เดียว และต้องมีขนาดน้อยกว่า 5 MB",
    bookingScreenshotLabel: "ภาพหน้าจอหน้าจองสุดท้าย",
    bookingScreenshotHelp: "จำเป็นสำหรับข้อเสนอห้องอาหาร อีเวนต์ และพาร์ทเนอร์ ขนาดภาพสูงสุด 1 MB",
    departmentConfirmationText: "ทุกแผนกที่เกี่ยวข้องของโรงแรมยืนยันได้ว่าการโหลดราคาได้รับการตั้งค่าอย่างถูกต้องเพื่อให้สมาชิกจองได้",
    masterImageTitle: "ใช้ภาพเดียวสำหรับทุกตำแหน่ง",
    masterImageHelp: "อัปโหลดภาพคุณภาพสูงหนึ่งภาพ แล้วระบบจะปรับขนาดเป็นแบนเนอร์ ไทล์รายการ และภาพโซเชียล",
    bannerImageTitle: "ภาพแบนเนอร์",
    bannerImageHelp: "อัปโหลดภาพขนาดใดก็ได้ ระบบจะปรับเป็น JPG 2048 x 1366px ไฟล์ต้นฉบับต้องไม่เกิน 200 MB ไม่มีข้อความและโลโก้",
    listingTileImageTitle: "ภาพไทล์รายการ",
    listingTileImageHelp: "อัปโหลดภาพขนาดใดก็ได้ ระบบจะปรับเป็น JPG 400 x 250px ไฟล์ต้นฉบับต้องไม่เกิน 200 MB",
    socialImageTitle: "ภาพโซเชียล",
    socialImageHelp: "อัปโหลดภาพขนาดใดก็ได้ ระบบจะปรับเป็น JPG 1080 x 1080px ไฟล์ต้นฉบับต้องไม่เกิน 200 MB",
    translationPreviewTitle: "แปลเนื้อหา",
    translationSourcePrefix: "เนื้อหาข้อเสนอที่กรอกด้านบนจะถือว่าเป็นภาษา",
    translationSourceSuffix: "ตามภาษาที่เลือกที่มุมขวาบน",
    previewInLabel: "ดูตัวอย่างเป็น",
    previewTranslatedButton: "ดูตัวอย่างคำแปล",
    savePreviewButton: "บันทึกตัวอย่างลงแพ็กเกจ",
    translatedPreviewLabel: "ตัวอย่างคำแปล",
    translationEditHelp: "ตรวจทานหรือแก้ไขฉบับร่างที่ไม่บังคับนี้ ข้อความในช่องนี้จะรวมไปกับข้อเสนอโดยอัตโนมัติ",
    acknowledgementText: "ฉันเข้าใจว่าการส่งข้อมูลที่ไม่ครบถ้วนหรือไม่ถูกต้องอาจทำให้การโปรโมตล่าช้า และต้องส่งไฟล์ล่วงหน้า 6 สัปดาห์",
  },
  vi: {
    formTitle: "Tạo ưu đãi Explorer của bạn",
    requiredFieldsNote: "Các trường có dấu * là bắt buộc.",
    submitButton: "Tạo gói và gửi",
    emailLabel: "Email",
    contactNameLabel: "Tên người phụ trách",
    hotelRidLabel: "Mã RID khách sạn",
    hotelNameLabel: "Tên khách sạn",
    offerTypeLabel: "Loại ưu đãi",
    selectOne: "Chọn một",
    cityCountryLabel: "Thành phố - Quốc gia",
    offerTileTitleLabel: "Tiêu đề ô ưu đãi",
    offerBannerTitleLabel: "Tiêu đề banner ưu đãi",
    offerSubtitleLabel: "Phụ đề ưu đãi",
    metaDescriptionLabel: "Mô tả meta",
    offerDescriptionLabel: "Mô tả ưu đãi",
    bookingLinkLabel: "Liên kết đặt chỗ",
    bookingMethodQuestion: "Thành viên có thể đặt chỗ bằng cách nào?",
    bookingMethodLink: "Liên kết đặt chỗ",
    bookingMethodEmailRsvp: "Đặt qua email / biểu mẫu RSVP",
    bookingEmailRsvpLabel: "Email đặt chỗ hoặc biểu mẫu RSVP",
    bookingEmailRsvpPlaceholder: "Nhập địa chỉ email, hướng dẫn qua email hoặc URL biểu mẫu RSVP.",
    termsLabel: "Điều khoản và điều kiện",
    rateScreenshotLabel: "Ảnh chụp màn hình giá",
    rateScreenshotHelp: "Vui lòng hiển thị mức giá đã được tải trên all.com. Ảnh tối đa 1 MB.",
    menuPdfLabel: "PDF menu ẩm thực / sự kiện",
    menuPdfHelp: "Vui lòng gộp các PDF thành một tệp. PDF phải nhỏ hơn 5 MB.",
    bookingScreenshotLabel: "Ảnh chụp trang đặt chỗ cuối cùng",
    bookingScreenshotHelp: "Bắt buộc đối với ưu đãi ẩm thực, sự kiện và đối tác. Ảnh tối đa 1 MB.",
    departmentConfirmationText: "Tất cả bộ phận liên quan của khách sạn xác nhận việc tải giá đã được thiết lập đúng để thành viên đặt chỗ.",
    masterImageTitle: "Dùng một ảnh cho mọi vị trí",
    masterImageHelp: "Tải lên một ảnh chất lượng cao và ứng dụng sẽ đổi kích thước thành banner, ô danh sách và ảnh mạng xã hội.",
    bannerImageTitle: "Ảnh banner",
    bannerImageHelp: "Tải lên ảnh kích thước bất kỳ. Ứng dụng sẽ tự đổi thành JPG 2048 x 1366px. Tệp gốc không quá 200 MB. Không có chữ và logo.",
    listingTileImageTitle: "Ảnh ô danh sách",
    listingTileImageHelp: "Tải lên ảnh kích thước bất kỳ. Ứng dụng sẽ tự đổi thành JPG 400 x 250px. Tệp gốc không quá 200 MB.",
    socialImageTitle: "Ảnh mạng xã hội",
    socialImageHelp: "Tải lên ảnh kích thước bất kỳ. Ứng dụng sẽ tự đổi thành JPG 1080 x 1080px. Tệp gốc không quá 200 MB.",
    translationPreviewTitle: "Dịch nội dung",
    translationSourcePrefix: "Nội dung ưu đãi bên trên được xem là",
    translationSourceSuffix: "dựa trên ngôn ngữ đã chọn ở góc trên bên phải.",
    previewInLabel: "Xem trước bằng",
    previewTranslatedButton: "Xem trước bản dịch",
    savePreviewButton: "Lưu bản xem trước vào gói",
    translatedPreviewLabel: "Bản dịch xem trước",
    translationEditHelp: "Xem lại hoặc chỉnh sửa bản nháp không bắt buộc này. Nội dung trong ô sẽ tự động được gửi cùng ưu đãi.",
    acknowledgementText: "Tôi hiểu rằng nội dung gửi không đầy đủ hoặc không chính xác có thể làm chậm chương trình khuyến mãi, và tài sản cần gửi trước 6 tuần.",
  },
  id: {
    formTitle: "Buat penawaran Explorer Anda",
    requiredFieldsNote: "Kolom bertanda * wajib diisi.",
    submitButton: "Buat Paket dan Kirim",
    emailLabel: "Email",
    contactNameLabel: "Nama penanggung jawab",
    hotelRidLabel: "Kode RID hotel",
    hotelNameLabel: "Nama hotel",
    offerTypeLabel: "Jenis penawaran",
    selectOne: "Pilih satu",
    cityCountryLabel: "Kota - Negara",
    offerTileTitleLabel: "Judul tile penawaran",
    offerBannerTitleLabel: "Judul banner penawaran",
    offerSubtitleLabel: "Subjudul penawaran",
    metaDescriptionLabel: "Deskripsi meta",
    offerDescriptionLabel: "Deskripsi penawaran",
    bookingLinkLabel: "Tautan pemesanan",
    bookingMethodQuestion: "Bagaimana anggota dapat memesan?",
    bookingMethodLink: "Tautan pemesanan",
    bookingMethodEmailRsvp: "Pemesanan melalui email / formulir RSVP",
    bookingEmailRsvpLabel: "Email pemesanan atau formulir RSVP",
    bookingEmailRsvpPlaceholder: "Masukkan alamat email, petunjuk melalui email, atau URL formulir RSVP.",
    termsLabel: "Syarat dan ketentuan",
    rateScreenshotLabel: "Screenshot tarif",
    rateScreenshotHelp: "Tampilkan tarif yang sudah dimuat di all.com. Gambar maks. 1 MB.",
    menuPdfLabel: "PDF menu dining / event",
    menuPdfHelp: "Gabungkan PDF menjadi satu file. PDF harus kurang dari 5 MB.",
    bookingScreenshotLabel: "Screenshot halaman pemesanan akhir",
    bookingScreenshotHelp: "Wajib untuk penawaran dining, event, dan partner. Gambar maks. 1 MB.",
    departmentConfirmationText: "Semua departemen hotel terkait dapat mengonfirmasi bahwa pemuatan tarif sudah benar agar anggota dapat memesan.",
    masterImageTitle: "Gunakan satu gambar untuk semua penempatan",
    masterImageHelp: "Unggah satu gambar berkualitas tinggi dan aplikasi akan mengubah ukurannya menjadi banner, listing tile, dan sosial.",
    bannerImageTitle: "Gambar banner",
    bannerImageHelp: "Unggah gambar ukuran apa pun. Aplikasi akan mengubahnya menjadi JPG 2048 x 1366px. File sumber maks. 200 MB. Tanpa teks dan logo.",
    listingTileImageTitle: "Gambar listing tile",
    listingTileImageHelp: "Unggah gambar ukuran apa pun. Aplikasi akan mengubahnya menjadi JPG 400 x 250px. File sumber maks. 200 MB.",
    socialImageTitle: "Gambar sosial",
    socialImageHelp: "Unggah gambar ukuran apa pun. Aplikasi akan mengubahnya menjadi JPG 1080 x 1080px. File sumber maks. 200 MB.",
    translationPreviewTitle: "Terjemahkan konten",
    translationSourcePrefix: "Konten penawaran yang diisi di atas dianggap sebagai",
    translationSourceSuffix: "berdasarkan bahasa yang dipilih di kanan atas.",
    previewInLabel: "Pratinjau dalam",
    previewTranslatedButton: "Pratinjau terjemahan",
    savePreviewButton: "Simpan pratinjau ke paket",
    translatedPreviewLabel: "Pratinjau terjemahan",
    translationEditHelp: "Tinjau atau edit draf opsional ini. Teks dalam kotak akan otomatis disertakan bersama penawaran.",
    acknowledgementText: "Saya memahami bahwa pengiriman yang tidak lengkap atau tidak akurat dapat menunda promosi, dan aset harus dikirim 6 minggu sebelumnya.",
  },
  ja: {
    formTitle: "Explorerオファーを作成",
    requiredFieldsNote: "* 印の項目は必須です。",
    submitButton: "パッケージを作成して送信",
    emailLabel: "メール",
    contactNameLabel: "担当者名",
    hotelRidLabel: "ホテルRIDコード",
    hotelNameLabel: "ホテル名",
    offerTypeLabel: "オファー種別",
    selectOne: "選択してください",
    cityCountryLabel: "都市 - 国",
    offerTileTitleLabel: "オファータイル見出し",
    offerBannerTitleLabel: "オファーバナー見出し",
    offerSubtitleLabel: "オファーサブタイトル",
    metaDescriptionLabel: "メタ説明",
    offerDescriptionLabel: "オファー説明",
    bookingLinkLabel: "予約リンク",
    bookingMethodQuestion: "会員はどのように予約できますか？",
    bookingMethodLink: "予約リンク",
    bookingMethodEmailRsvp: "メール / RSVPフォームで予約",
    bookingEmailRsvpLabel: "予約メールまたはRSVPフォーム",
    bookingEmailRsvpPlaceholder: "メールアドレス、メールでの予約方法、またはRSVPフォームのURLを入力してください。",
    termsLabel: "利用規約",
    rateScreenshotLabel: "料金スクリーンショット",
    rateScreenshotHelp: "all.comで読み込まれた料金を表示してください。画像は最大1 MBです。",
    menuPdfLabel: "ダイニング / イベント メニューPDF",
    menuPdfHelp: "PDFは1つのファイルにまとめ、5 MB未満にしてください。",
    bookingScreenshotLabel: "最終予約ページのスクリーンショット",
    bookingScreenshotHelp: "ダイニング、イベント、パートナーオファーでは必須です。画像は最大1 MBです。",
    departmentConfirmationText: "関連するホテル部門は、会員が予約できるよう料金ロードが正しく設定されていることを確認できます。",
    masterImageTitle: "1枚の画像をすべての配置に使用",
    masterImageHelp: "高品質な画像を1枚アップロードすると、バナー、一覧タイル、ソーシャル用にリサイズされます。",
    bannerImageTitle: "バナー画像",
    bannerImageHelp: "任意サイズの画像をアップロードできます。アプリが2048 x 1366px JPGに自動リサイズします。元ファイルは200 MB以下。文字とロゴは不可。",
    listingTileImageTitle: "一覧タイル画像",
    listingTileImageHelp: "任意サイズの画像をアップロードできます。アプリが400 x 250px JPGに自動リサイズします。元ファイルは200 MB以下。",
    socialImageTitle: "ソーシャル画像",
    socialImageHelp: "任意サイズの画像をアップロードできます。アプリが1080 x 1080px JPGに自動リサイズします。元ファイルは200 MB以下。",
    translationPreviewTitle: "コンテンツを翻訳",
    translationSourcePrefix: "上記に入力されたオファー内容は",
    translationSourceSuffix: "右上で選択された言語として扱われます。",
    previewInLabel: "プレビュー言語",
    previewTranslatedButton: "翻訳をプレビュー",
    savePreviewButton: "プレビューをパッケージに保存",
    translatedPreviewLabel: "翻訳プレビュー",
    translationEditHelp: "この任意の下書きを確認・編集できます。ボックス内のテキストはオファーと一緒に自動保存されます。",
    acknowledgementText: "不完全または不正確な提出はプロモーションの遅延につながる可能性があり、素材は6週間前までに提出する必要があることを理解しています。",
  },
  ar: {
    formTitle: "أنشئ عرض Explorer الخاص بك",
    requiredFieldsNote: "الحقول المميزة بعلامة * إلزامية.",
    submitButton: "إرسال العرض",
    emailLabel: "البريد الإلكتروني",
    contactNameLabel: "اسم الشخص المسؤول",
    hotelRidLabel: "رمز RID للفندق",
    hotelNameLabel: "اسم الفندق",
    offerTypeLabel: "نوع العرض",
    selectOne: "اختر خيارًا",
    cityCountryLabel: "المدينة - الدولة",
    offerTileTitleLabel: "عنوان بطاقة العرض",
    offerBannerTitleLabel: "عنوان لافتة العرض",
    offerSubtitleLabel: "العنوان الفرعي للعرض",
    metaDescriptionLabel: "الوصف التعريفي",
    offerDescriptionLabel: "وصف العرض",
    bookingLinkLabel: "رابط الحجز",
    bookingMethodQuestion: "كيف يمكن للأعضاء الحجز؟",
    bookingMethodLink: "رابط الحجز",
    bookingMethodEmailRsvp: "الحجز عبر البريد الإلكتروني / نموذج تأكيد الحضور",
    bookingEmailRsvpLabel: "البريد الإلكتروني للحجز أو نموذج تأكيد الحضور",
    bookingEmailRsvpPlaceholder: "أدخل عنوان البريد الإلكتروني أو تعليمات البريد أو رابط نموذج تأكيد الحضور.",
    termsLabel: "الشروط والأحكام",
    rateScreenshotLabel: "لقطة شاشة للسعر",
    rateScreenshotHelp: "يرجى إظهار السعر المحمّل والمتاح على all.com. الحد الأقصى للصورة 1 ميغابايت.",
    menuPdfLabel: "قائمة المطعم / الفعالية بصيغة PDF",
    menuPdfHelp: "يرجى دمج ملفات PDF في ملف واحد ويجب أن يكون حجمه أقل من 5 ميغابايت.",
    bookingScreenshotLabel: "لقطة شاشة لصفحة الحجز النهائية",
    bookingScreenshotHelp: "مطلوبة لعروض المطاعم والفعاليات والشركاء. الحد الأقصى للصورة 1 ميغابايت.",
    masterImageTitle: "استخدم صورة واحدة لجميع المواضع",
    masterImageHelp: "حمّل صورة واحدة عالية الجودة وسيغيّر التطبيق حجمها لإصدارات اللافتة وبطاقة القائمة ووسائل التواصل.",
    bannerImageTitle: "صورة اللافتة",
    bannerImageHelp: "حمّل صورة بأي حجم. سيغيّر التطبيق حجمها تلقائيًا إلى JPG بمقاس 2048 × 1366 بكسل. يجب ألا يتجاوز الملف 200 ميغابايت، ومن دون نص أو شعار.",
    listingTileImageTitle: "صورة بطاقة القائمة",
    listingTileImageHelp: "حمّل صورة بأي حجم. سيغيّر التطبيق حجمها تلقائيًا إلى JPG بمقاس 400 × 250 بكسل. يجب ألا يتجاوز الملف 200 ميغابايت.",
    socialImageTitle: "صورة وسائل التواصل",
    socialImageHelp: "حمّل صورة بأي حجم. سيغيّر التطبيق حجمها تلقائيًا إلى JPG بمقاس 1080 × 1080 بكسل. يجب ألا يتجاوز الملف 200 ميغابايت.",
    translationPreviewTitle: "ترجمة المحتوى",
    translationSourcePrefix: "يُعامل محتوى العرض المُدخل أعلاه على أنه باللغة",
    translationSourceSuffix: "بناءً على اللغة المحددة في الزاوية العلوية.",
    previewInLabel: "المعاينة باللغة",
    previewTranslatedButton: "معاينة المحتوى المترجم",
    savePreviewButton: "حفظ المعاينة في الحزمة",
    translatedPreviewLabel: "معاينة الترجمة",
    translationEditHelp: "راجع هذه المسودة الاختيارية أو عدّلها. سيُرفق أي نص في هذا المربع تلقائيًا مع العرض.",
    acknowledgementText: "أقر بأن الإرسالات غير المكتملة أو غير الدقيقة قد تؤخر الترويج، وأن المواد مطلوبة قبل 6 أسابيع.",
  },
  tr: {
  emailLabel: "E-posta", requiredFieldsNote: "* ile işaretli alanlar zorunludur.", contactNameLabel: "Sorumlu kişinin adı", hotelRidLabel: "Otel RID kodu", hotelNameLabel: "Otel adı", offerTypeLabel: "Teklif türü", selectOne: "Birini seçin", cityCountryLabel: "Şehir - Ülke", offerTileTitleLabel: "Teklif kutucuğu başlığı", offerBannerTitleLabel: "Teklif banner başlığı", offerSubtitleLabel: "Teklif alt başlığı", metaDescriptionLabel: "Meta açıklaması", offerDescriptionLabel: "Teklif açıklaması", bookingLinkLabel: "Rezervasyon bağlantısı", bookingMethodQuestion: "Üyeler nasıl rezervasyon yapabilir?", bookingMethodLink: "Rezervasyon bağlantısı", bookingMethodEmailRsvp: "E-posta / RSVP formu ile rezervasyon", bookingEmailRsvpLabel: "Rezervasyon e-postası veya RSVP formu", bookingEmailRsvpPlaceholder: "E-posta adresini, e-posta talimatlarını veya RSVP formu URL'sini girin.", termsLabel: "Hüküm ve koşullar",
  rateScreenshotLabel: "Fiyat ekran görüntüsü", rateScreenshotHelp: "Lütfen all.com üzerinde yüklenmiş fiyatı gösterin. Görsel en fazla 1 MB.", menuPdfLabel: "Yeme-içme / etkinlik menüsü PDF", menuPdfHelp: "PDF'leri tek bir dosyada birleştirin. En fazla 10 MB.", bookingScreenshotLabel: "Son rezervasyon sayfası ekran görüntüsü", bookingScreenshotHelp: "Yeme-içme, etkinlik ve iş ortağı teklifleri için gereklidir. Görsel en fazla 1 MB.", departmentConfirmationText: "İlgili tüm otel departmanları, üyelerin rezervasyon yapabilmesi için fiyat yüklemesinin doğru kurulduğunu onaylar.", masterImageTitle: "Tüm yerleşimler için tek görsel kullanın", masterImageHelp: "Yüksek kaliteli tek bir görsel yükleyin; uygulama banner, liste kutucuğu ve sosyal medya sürümlerini oluşturur.", bannerImageTitle: "Banner görseli", bannerImageHelp: "Herhangi bir boyutta görsel yükleyin. Uygulama görseli otomatik olarak 2048 x 1366px JPG'ye dönüştürür. Kaynak dosya 200 MB'ı aşmamalı; metin ve logo içermemelidir.", listingTileImageTitle: "Liste kutucuğu görseli", listingTileImageHelp: "Herhangi bir boyutta görsel yükleyin. Uygulama 400 x 250px JPG'ye dönüştürür.", socialImageTitle: "Sosyal medya görseli", socialImageHelp: "Herhangi bir boyutta görsel yükleyin. Uygulama 1080 x 1080px JPG'ye dönüştürür.",
  translationPreviewTitle: "İçeriği çevirin", translationSourcePrefix: "Yukarıda girilen teklif içeriğinin dili", translationSourceSuffix: "olarak, sağ üstte seçilen dile göre kabul edilir.", previewInLabel: "Çeviri dilleri", previewTranslatedButton: "İçeriği Çevir", savePreviewButton: "Çeviriyi kaydet", translatedPreviewLabel: "Çeviri önizlemesi", translationEditHelp: "Bu isteğe bağlı taslağı inceleyebilir veya düzenleyebilirsiniz. Kutudaki metin teklifle birlikte otomatik olarak kaydedilir.", acknowledgementText: "Eksik veya hatalı gönderimlerin promosyonu geciktirebileceğini ve materyallerin 6 hafta önceden gönderilmesi gerektiğini anlıyorum.",
  menuPdfHelp: "PDF'leri tek bir dosyada birleştirin. PDF 5 MB'tan küçük olmalıdır.",
  },
};

Object.entries(formCopyTranslations).forEach(([language, copy]) => {
  Object.assign(uiTranslations[language], copy);
});

const feedbackCopyTranslations = {
  en: {
    oneOfferTypeNote: "Please note: submit one offer type per submission.", offerTypePartners: "Partner Offers", emailLabel: "Contact email", contactNameLabel: "Contact name", coreContentWebsiteNote: "To be displayed on the website.", offerTileTitleHelp: "Displayed on the offer listing. Example: Sofitel Sydney Darling Harbour.", offerBannerTitleHelp: "Displayed on the offer page. Example: More Escapes at Sofitel Sydney Darling Harbour.", offerSubtitleHelp: "Up to 150 characters. Summarise the member benefit and key inclusions.", metaDescriptionHelp: "Up to 180 characters. Include the stay, starting price and main complimentary inclusions.", offerDescriptionHelp: "Up to 500 characters. Describe the experience and include the room type if relevant.", accommodationDetailsLabel: "Accommodation details", accommodationDetailsPlaceholder: "Include hotel room and inclusions if relevant.", accommodationDetailsHelp: "Include the hotel room and inclusions if accommodation is part of the event.", packageDetailsLabel: "Package details", packageDetailsPlaceholder: "List inclusions, member benefits, minimum stay and exclusions.", packageDetailsHelp: "Up to 300 characters. List inclusions, member benefits, minimum stay and exclusions.", termsPlaceholder: "Include all terms and conditions in bullet points.", termsHelp: "Up to 300 characters. Include all terms and conditions in bullet points.", alignBrandToneButton: "Align Offer Description with Brand Tone (Optional)", proofForms: "Required documents", imagesRequirementNote: "One raw image is required that accurately represents the offer.", socialImageTitle: "Social media image", socialImageHelp: "Optional, for possible social media exposure. The app will auto-resize it to 1080 x 1080px JPG.", translationPreviewTitle: "Translate content (optional)", translationOptionalNote: "Use this only when translations are required for selected markets."
  },
  th: {
    oneOfferTypeNote: "โปรดทราบ: ส่งข้อเสนอหนึ่งประเภทต่อการส่งหนึ่งครั้ง", offerTypePartners: "ข้อเสนอจากพาร์ทเนอร์", emailLabel: "อีเมลผู้ติดต่อ", contactNameLabel: "ชื่อผู้ติดต่อ", coreContentWebsiteNote: "ข้อมูลนี้จะแสดงบนเว็บไซต์", offerTileTitleHelp: "แสดงบนหน้ารวมข้อเสนอ", offerBannerTitleHelp: "แสดงบนหน้ารายละเอียดข้อเสนอ", offerSubtitleHelp: "ไม่เกิน 150 ตัวอักษร", metaDescriptionHelp: "ไม่เกิน 180 ตัวอักษร", offerDescriptionHelp: "ไม่เกิน 500 ตัวอักษร และระบุประเภทห้องหากเกี่ยวข้อง", accommodationDetailsLabel: "รายละเอียดที่พัก", accommodationDetailsPlaceholder: "ระบุห้องพักและสิทธิประโยชน์ที่เกี่ยวข้อง", packageDetailsLabel: "รายละเอียดแพ็กเกจ", packageDetailsPlaceholder: "ระบุสิ่งที่รวม สิทธิประโยชน์สมาชิก จำนวนคืนขั้นต่ำ และข้อยกเว้น", packageDetailsHelp: "ไม่เกิน 300 ตัวอักษร ระบุสิ่งที่รวม สิทธิประโยชน์สมาชิก จำนวนคืนขั้นต่ำ และข้อยกเว้น", termsPlaceholder: "ระบุข้อกำหนดและเงื่อนไขทั้งหมดเป็นข้อ ๆ", termsHelp: "ไม่เกิน 300 ตัวอักษร ระบุข้อกำหนดและเงื่อนไขทั้งหมดเป็นข้อ ๆ", alignBrandToneButton: "ปรับคำอธิบายข้อเสนอให้สอดคล้องกับโทนแบรนด์ (ไม่บังคับ)", proofForms: "เอกสารที่จำเป็น", imagesRequirementNote: "ต้องมีภาพต้นฉบับ 1 ภาพที่สื่อถึงข้อเสนออย่างถูกต้อง", socialImageTitle: "ภาพโซเชียลมีเดีย", socialImageHelp: "ไม่บังคับ สำหรับโอกาสเผยแพร่บนโซเชียลมีเดีย ระบบจะปรับเป็น JPG ขนาด 1080 x 1080 พิกเซล", translationPreviewTitle: "แปลเนื้อหา (ไม่บังคับ)", translationOptionalNote: "ใช้เฉพาะเมื่อต้องการคำแปลสำหรับตลาดที่เลือก"
  },
  vi: {
    oneOfferTypeNote: "Lưu ý: mỗi lần gửi chỉ dành cho một loại ưu đãi.", offerTypePartners: "Ưu đãi đối tác", emailLabel: "Email liên hệ", contactNameLabel: "Tên người liên hệ", coreContentWebsiteNote: "Nội dung sẽ hiển thị trên website.", offerTileTitleHelp: "Hiển thị trong danh sách ưu đãi.", offerBannerTitleHelp: "Hiển thị trên trang ưu đãi.", offerSubtitleHelp: "Tối đa 150 ký tự.", metaDescriptionHelp: "Tối đa 180 ký tự.", offerDescriptionHelp: "Tối đa 500 ký tự. Bao gồm loại phòng nếu phù hợp.", accommodationDetailsLabel: "Chi tiết lưu trú", accommodationDetailsPlaceholder: "Bao gồm phòng khách sạn và quyền lợi nếu phù hợp.", packageDetailsLabel: "Chi tiết gói", packageDetailsPlaceholder: "Liệt kê hạng mục bao gồm, quyền lợi thành viên, số đêm tối thiểu và ngoại lệ.", packageDetailsHelp: "Tối đa 300 ký tự. Liệt kê hạng mục bao gồm, quyền lợi, số đêm tối thiểu và ngoại lệ.", termsPlaceholder: "Liệt kê tất cả điều khoản và điều kiện theo từng ý.", termsHelp: "Tối đa 300 ký tự. Liệt kê tất cả điều khoản và điều kiện theo từng ý.", alignBrandToneButton: "Điều chỉnh mô tả ưu đãi theo giọng thương hiệu (không bắt buộc)", proofForms: "Tài liệu bắt buộc", imagesRequirementNote: "Cần 1 ảnh gốc thể hiện chính xác ưu đãi.", socialImageTitle: "Ảnh mạng xã hội", socialImageHelp: "Không bắt buộc, dành cho khả năng quảng bá trên mạng xã hội. Ảnh sẽ được đổi thành JPG 1080 x 1080px.", translationPreviewTitle: "Dịch nội dung (không bắt buộc)", translationOptionalNote: "Chỉ sử dụng khi cần bản dịch cho các thị trường đã chọn."
  },
  id: {
    oneOfferTypeNote: "Harap diperhatikan: kirim satu jenis penawaran per pengajuan.", offerTypePartners: "Penawaran partner", emailLabel: "Email kontak", contactNameLabel: "Nama kontak", coreContentWebsiteNote: "Akan ditampilkan di situs web.", offerTileTitleHelp: "Ditampilkan pada daftar penawaran.", offerBannerTitleHelp: "Ditampilkan pada halaman penawaran.", offerSubtitleHelp: "Maksimal 150 karakter.", metaDescriptionHelp: "Maksimal 180 karakter.", offerDescriptionHelp: "Maksimal 500 karakter. Sertakan tipe kamar jika relevan.", accommodationDetailsLabel: "Detail akomodasi", accommodationDetailsPlaceholder: "Sertakan kamar hotel dan manfaat jika relevan.", packageDetailsLabel: "Detail paket", packageDetailsPlaceholder: "Cantumkan inklusi, manfaat anggota, masa inap minimum, dan pengecualian.", packageDetailsHelp: "Maksimal 300 karakter. Cantumkan inklusi, manfaat, masa inap minimum, dan pengecualian.", termsPlaceholder: "Cantumkan semua syarat dan ketentuan dalam poin-poin.", termsHelp: "Maksimal 300 karakter. Cantumkan semua syarat dan ketentuan dalam poin-poin.", alignBrandToneButton: "Selaraskan deskripsi penawaran dengan gaya merek (opsional)", proofForms: "Dokumen wajib", imagesRequirementNote: "Diperlukan 1 gambar asli yang menggambarkan penawaran secara akurat.", socialImageTitle: "Gambar media sosial", socialImageHelp: "Opsional, untuk kemungkinan eksposur media sosial. Gambar akan diubah menjadi JPG 1080 x 1080px.", translationPreviewTitle: "Terjemahkan konten (opsional)", translationOptionalNote: "Gunakan hanya jika terjemahan diperlukan untuk pasar yang dipilih."
  },
  ja: {
    oneOfferTypeNote: "ご注意：1回の送信につき1種類のオファーを送信してください。", offerTypePartners: "パートナーオファー", emailLabel: "連絡先メールアドレス", contactNameLabel: "担当者名", coreContentWebsiteNote: "ウェブサイトに表示される内容です。", offerTileTitleHelp: "オファー一覧に表示されます。", offerBannerTitleHelp: "オファーページに表示されます。", offerSubtitleHelp: "150文字以内。", metaDescriptionHelp: "180文字以内。", offerDescriptionHelp: "500文字以内。該当する場合は客室タイプを含めてください。", accommodationDetailsLabel: "宿泊詳細", accommodationDetailsPlaceholder: "該当する場合は客室と特典を記載してください。", packageDetailsLabel: "パッケージ詳細", packageDetailsPlaceholder: "含まれる内容、会員特典、最低宿泊数、除外事項を記載してください。", packageDetailsHelp: "300文字以内。含まれる内容、会員特典、最低宿泊数、除外事項を記載してください。", termsPlaceholder: "すべての利用規約を箇条書きで記載してください。", termsHelp: "300文字以内。すべての利用規約を箇条書きで記載してください。", alignBrandToneButton: "オファー説明をブランドトーンに合わせる（任意）", proofForms: "必要書類", imagesRequirementNote: "オファーを正確に表す元画像が1枚必要です。", socialImageTitle: "ソーシャルメディア画像", socialImageHelp: "任意。ソーシャルメディア掲載の可能性があります。1080 x 1080pxのJPGに変換されます。", translationPreviewTitle: "コンテンツを翻訳（任意）", translationOptionalNote: "選択した市場で翻訳が必要な場合にのみ使用してください。"
  },
  ar: {
    oneOfferTypeNote: "يرجى الملاحظة: أرسل نوع عرض واحداً في كل طلب.", offerTypePartners: "عروض الشركاء", emailLabel: "البريد الإلكتروني لجهة الاتصال", contactNameLabel: "اسم جهة الاتصال", coreContentWebsiteNote: "سيُعرض هذا المحتوى على الموقع الإلكتروني.", offerTileTitleHelp: "يظهر في قائمة العروض.", offerBannerTitleHelp: "يظهر في صفحة العرض.", offerSubtitleHelp: "حتى 150 حرفاً.", metaDescriptionHelp: "حتى 180 حرفاً.", offerDescriptionHelp: "حتى 500 حرف. أضف نوع الغرفة إذا كان مناسباً.", accommodationDetailsLabel: "تفاصيل الإقامة", accommodationDetailsPlaceholder: "أضف غرفة الفندق والمزايا إذا كانت مناسبة.", packageDetailsLabel: "تفاصيل الباقة", packageDetailsPlaceholder: "اذكر المشتملات ومزايا الأعضاء والحد الأدنى للإقامة والاستثناءات.", packageDetailsHelp: "حتى 300 حرف. اذكر المشتملات والمزايا والحد الأدنى للإقامة والاستثناءات.", termsPlaceholder: "أدرج جميع الشروط والأحكام في نقاط.", termsHelp: "حتى 300 حرف. أدرج جميع الشروط والأحكام في نقاط.", alignBrandToneButton: "مواءمة وصف العرض مع نبرة العلامة التجارية (اختياري)", proofForms: "المستندات المطلوبة", imagesRequirementNote: "مطلوب صورة أصلية واحدة تمثل العرض بدقة.", socialImageTitle: "صورة وسائل التواصل الاجتماعي", socialImageHelp: "اختيارية، لاحتمال النشر على وسائل التواصل. سيُعاد تحجيمها إلى JPG بمقاس 1080 × 1080 بكسل.", translationPreviewTitle: "ترجمة المحتوى (اختياري)", translationOptionalNote: "استخدم هذا فقط عند الحاجة إلى ترجمات للأسواق المحددة."
  },
  tr: {
    oneOfferTypeNote: "Lütfen dikkat: her gönderimde tek bir teklif türü gönderin.", offerTypePartners: "İş ortağı teklifleri", emailLabel: "İletişim e-postası", contactNameLabel: "İletişim kişisi", coreContentWebsiteNote: "Web sitesinde görüntülenecektir.", offerTileTitleHelp: "Teklif listesinde görüntülenir.", offerBannerTitleHelp: "Teklif sayfasında görüntülenir.", offerSubtitleHelp: "En fazla 150 karakter.", metaDescriptionHelp: "En fazla 180 karakter.", offerDescriptionHelp: "En fazla 500 karakter. İlgiliyse oda türünü ekleyin.", accommodationDetailsLabel: "Konaklama ayrıntıları", accommodationDetailsPlaceholder: "İlgiliyse otel odasını ve dahil olanları belirtin.", packageDetailsLabel: "Paket ayrıntıları", packageDetailsPlaceholder: "Dahil olanları, üye avantajlarını, minimum konaklamayı ve istisnaları listeleyin.", packageDetailsHelp: "En fazla 300 karakter. Dahil olanları, avantajları, minimum konaklamayı ve istisnaları listeleyin.", termsPlaceholder: "Tüm hüküm ve koşulları maddeler halinde yazın.", termsHelp: "En fazla 300 karakter. Tüm hüküm ve koşulları maddeler halinde yazın.", alignBrandToneButton: "Teklif açıklamasını marka tonuna uyarla (isteğe bağlı)", proofForms: "Gerekli belgeler", imagesRequirementNote: "Teklifi doğru şekilde temsil eden 1 adet ham görsel gereklidir.", socialImageTitle: "Sosyal medya görseli", socialImageHelp: "İsteğe bağlıdır; sosyal medyada kullanılabilir. Görsel 1080 x 1080px JPG'ye dönüştürülür.", translationPreviewTitle: "İçeriği çevir (isteğe bağlı)", translationOptionalNote: "Yalnızca seçili pazarlar için çeviri gerekiyorsa kullanın."
  }
};

Object.entries(feedbackCopyTranslations).forEach(([language, copy]) => Object.assign(uiTranslations[language], copy));

const accommodationHelpTranslations = {
  en: "Include the hotel room and inclusions if accommodation is part of the event.",
  th: "ระบุห้องพักและสิ่งที่รวม หากอีเวนต์มีที่พักรวมอยู่ด้วย",
  vi: "Bao gồm phòng khách sạn và các quyền lợi nếu sự kiện có kèm lưu trú.",
  id: "Sertakan kamar hotel dan inklusi jika akomodasi merupakan bagian dari event.",
  ja: "イベントに宿泊が含まれる場合は、客室と特典を記載してください。",
  ar: "أضف غرفة الفندق والمزايا إذا كانت الإقامة جزءاً من الفعالية.",
  tr: "Konaklama etkinliğin bir parçasıysa otel odasını ve dahil olanları belirtin.",
};
Object.entries(accommodationHelpTranslations).forEach(([language, accommodationDetailsHelp]) => {
  Object.assign(uiTranslations[language], { accommodationDetailsHelp });
});

const workflowCopyTranslations = {
  en: { contactEmailHelp: "The email address we should use if we need to discuss this offer.", contactNameHelp: "The person responsible for answering questions about this offer.", hotelRidHelp: "Enter the hotel's unique RID code.", hotelNameHelp: "Enter the full hotel name as it should appear on the offer.", cityCountryHelp: "Enter the city and country where the hotel is located.", translationRequiredQuestion: "Is translation to another language required?", translationMarketDisclaimer: "Translation is relevant only when publishing the offer in the selected market is planned.", yesLabel: "Yes", noLabel: "No", masterImageHelp: "Upload one high-quality image. The app will resize it and show previews for the banner, listing tile, and social image formats.", translationPreviewTitle: "Translate content" },
  th: { contactEmailHelp: "อีเมลที่เราควรใช้หากต้องติดต่อเรื่องข้อเสนอนี้", contactNameHelp: "ผู้รับผิดชอบในการตอบคำถามเกี่ยวกับข้อเสนอนี้", hotelRidHelp: "กรอกรหัส RID เฉพาะของโรงแรม", hotelNameHelp: "กรอกชื่อโรงแรมเต็มตามที่ควรแสดงในข้อเสนอ", cityCountryHelp: "กรอกเมืองและประเทศที่โรงแรมตั้งอยู่", translationRequiredQuestion: "ต้องการแปลเป็นภาษาอื่นหรือไม่?", translationMarketDisclaimer: "การแปลเกี่ยวข้องเฉพาะเมื่อมีแผนเผยแพร่ข้อเสนอในตลาดนั้น", yesLabel: "ใช่", noLabel: "ไม่", masterImageHelp: "อัปโหลดภาพคุณภาพสูงหนึ่งภาพ ระบบจะปรับขนาดและแสดงตัวอย่างสำหรับแบนเนอร์ การ์ดรายการ และโซเชียลมีเดีย", translationPreviewTitle: "แปลเนื้อหา" },
  vi: { contactEmailHelp: "Email chúng tôi nên sử dụng nếu cần trao đổi về ưu đãi này.", contactNameHelp: "Người phụ trách trả lời các câu hỏi về ưu đãi này.", hotelRidHelp: "Nhập mã RID riêng của khách sạn.", hotelNameHelp: "Nhập tên đầy đủ của khách sạn như sẽ hiển thị trong ưu đãi.", cityCountryHelp: "Nhập thành phố và quốc gia nơi khách sạn tọa lạc.", translationRequiredQuestion: "Có cần dịch sang ngôn ngữ khác không?", translationMarketDisclaimer: "Bản dịch chỉ phù hợp khi có kế hoạch đăng ưu đãi tại thị trường tương ứng.", yesLabel: "Có", noLabel: "Không", masterImageHelp: "Tải lên một ảnh chất lượng cao. Ứng dụng sẽ đổi kích thước và hiển thị bản xem trước cho banner, ô danh sách và ảnh mạng xã hội.", translationPreviewTitle: "Dịch nội dung" },
  id: { contactEmailHelp: "Alamat email yang dapat kami gunakan jika perlu membahas penawaran ini.", contactNameHelp: "Orang yang bertanggung jawab menjawab pertanyaan tentang penawaran ini.", hotelRidHelp: "Masukkan kode RID unik hotel.", hotelNameHelp: "Masukkan nama lengkap hotel seperti yang akan ditampilkan pada penawaran.", cityCountryHelp: "Masukkan kota dan negara lokasi hotel.", translationRequiredQuestion: "Apakah terjemahan ke bahasa lain diperlukan?", translationMarketDisclaimer: "Terjemahan hanya relevan jika penawaran direncanakan untuk diterbitkan di pasar terkait.", yesLabel: "Ya", noLabel: "Tidak", masterImageHelp: "Unggah satu gambar berkualitas tinggi. Aplikasi akan mengubah ukuran dan menampilkan pratinjau untuk banner, tile daftar, dan gambar media sosial.", translationPreviewTitle: "Terjemahkan konten" },
  ja: { contactEmailHelp: "このオファーについて確認が必要な場合に使用するメールアドレスです。", contactNameHelp: "このオファーに関する質問に回答する担当者です。", hotelRidHelp: "ホテル固有のRIDコードを入力してください。", hotelNameHelp: "オファーに表示するホテルの正式名称を入力してください。", cityCountryHelp: "ホテルが所在する都市と国を入力してください。", translationRequiredQuestion: "他の言語への翻訳は必要ですか？", translationMarketDisclaimer: "翻訳は、該当市場でオファーを公開する予定がある場合にのみ必要です。", yesLabel: "はい", noLabel: "いいえ", masterImageHelp: "高品質の画像を1枚アップロードしてください。バナー、一覧タイル、ソーシャル画像用にリサイズしてプレビューを表示します。", translationPreviewTitle: "コンテンツを翻訳" },
  ar: { contactEmailHelp: "عنوان البريد الإلكتروني الذي سنستخدمه إذا احتجنا إلى مناقشة هذا العرض.", contactNameHelp: "الشخص المسؤول عن الإجابة عن الأسئلة المتعلقة بهذا العرض.", hotelRidHelp: "أدخل رمز RID الفريد للفندق.", hotelNameHelp: "أدخل الاسم الكامل للفندق كما يجب أن يظهر في العرض.", cityCountryHelp: "أدخل المدينة والدولة التي يقع فيها الفندق.", translationRequiredQuestion: "هل يلزم ترجمة العرض إلى لغة أخرى؟", translationMarketDisclaimer: "تكون الترجمة ذات صلة فقط عند التخطيط لنشر العرض في السوق المعني.", yesLabel: "نعم", noLabel: "لا", masterImageHelp: "حمّل صورة واحدة عالية الجودة. سيغيّر التطبيق حجمها ويعرض معاينات للافتة وبطاقة القائمة وصورة وسائل التواصل.", translationPreviewTitle: "ترجمة المحتوى" },
  tr: { contactEmailHelp: "Bu teklif hakkında görüşmemiz gerekirse kullanacağımız e-posta adresi.", contactNameHelp: "Bu teklifle ilgili soruları yanıtlayacak sorumlu kişi.", hotelRidHelp: "Otelin benzersiz RID kodunu girin.", hotelNameHelp: "Teklifte görünmesi gereken tam otel adını girin.", cityCountryHelp: "Otelin bulunduğu şehir ve ülkeyi girin.", translationRequiredQuestion: "Başka bir dile çeviri gerekiyor mu?", translationMarketDisclaimer: "Çeviri yalnızca teklifin ilgili pazarda yayımlanması planlanıyorsa gereklidir.", yesLabel: "Evet", noLabel: "Hayır", masterImageHelp: "Tek bir yüksek kaliteli görsel yükleyin. Uygulama görseli banner, liste kutucuğu ve sosyal medya biçimleri için yeniden boyutlandırıp önizlemeleri gösterir.", translationPreviewTitle: "İçeriği çevir" },
};
Object.entries(workflowCopyTranslations).forEach(([language, copy]) => Object.assign(uiTranslations[language], copy));

const availableLanguagesLabelTranslations = {
  en: "Available languages:",
  th: "ภาษาที่รองรับ:",
  vi: "Ngôn ngữ có sẵn:",
  id: "Bahasa yang tersedia:",
  ja: "利用可能な言語：",
  ar: "اللغات المتاحة:",
  tr: "Mevcut diller:",
};
Object.entries(availableLanguagesLabelTranslations).forEach(([language, translationAvailableLanguagesLabel]) => {
  Object.assign(uiTranslations[language], { translationAvailableLanguagesLabel });
});

const translationAuditCopyTranslations = {
  th: { offerTypeHotelStay: "การเข้าพักโรงแรม", offerTypeDining: "การรับประทานอาหาร", offerTypeEvents: "กิจกรรม", continueButton: "ดำเนินการต่อ" },
  vi: { offerTypeHotelStay: "Lưu trú khách sạn", offerTypeDining: "Ẩm thực", offerTypeEvents: "Sự kiện", continueButton: "Tiếp tục" },
  id: { offerTypeHotelStay: "Menginap di hotel", offerTypeDining: "Kuliner", offerTypeEvents: "Acara", continueButton: "Lanjutkan" },
  ja: { offerTypeHotelStay: "ホテル宿泊", offerTypeDining: "ダイニング", offerTypeEvents: "イベント", continueButton: "続行" },
  ar: { continueButton: "متابعة" },
};
Object.entries(translationAuditCopyTranslations).forEach(([language, copy]) => Object.assign(uiTranslations[language], copy));

const imagePreviewCopyTranslations = {
  en: { previewAfterUpload: "Preview appears after upload", socialImageOptionalNote: "Please note social media marketing exposure is not guaranteed." },
  th: { previewAfterUpload: "ตัวอย่างจะแสดงหลังอัปโหลด", socialImageOptionalNote: "โปรดทราบว่าไม่รับประกันการเผยแพร่ผ่านการตลาดบนโซเชียลมีเดีย" },
  vi: { previewAfterUpload: "Bản xem trước xuất hiện sau khi tải lên", socialImageOptionalNote: "Xin lưu ý rằng việc quảng bá trên mạng xã hội không được đảm bảo." },
  id: { previewAfterUpload: "Pratinjau muncul setelah diunggah", socialImageOptionalNote: "Harap diperhatikan bahwa eksposur pemasaran di media sosial tidak dijamin." },
  ja: { previewAfterUpload: "アップロード後にプレビューが表示されます", socialImageOptionalNote: "ソーシャルメディアでのマーケティング掲載は保証されません。" },
  ar: { previewAfterUpload: "تظهر المعاينة بعد التحميل", socialImageOptionalNote: "يرجى ملاحظة أن الظهور التسويقي على وسائل التواصل الاجتماعي غير مضمون." },
  tr: { previewAfterUpload: "Önizleme yüklemeden sonra görünür", socialImageOptionalNote: "Sosyal medya pazarlama görünürlüğünün garanti edilmediğini lütfen unutmayın." },
};
Object.entries(imagePreviewCopyTranslations).forEach(([language, copy]) => Object.assign(uiTranslations[language], copy));

const runtimeCopyTranslations = {
  en: { moreInformationLabel: "More information", translationSelectionHelp: "Select one or more languages. Use Ctrl/Command-click to select multiple options.", imageInvalidType: "Please upload a PNG, JPG, or WebP image.", imageTooLarge: "Image source file must not exceed 200 MB.", imageProcessing: "Creating banner, listing tile, and social image versions...", imageReady: "All image versions ready from one source image. Source size: {size} KB.", brandToneUnavailable: "Sorry, the Brand Tone Alignment feature is not available at the moment. Please proceed with submitting your offer.", translationUnavailable: "Sorry, the Translation feature is not available at the moment. Please proceed with submitting your offer." },
  th: { moreInformationLabel: "ข้อมูลเพิ่มเติม", translationSelectionHelp: "เลือกหนึ่งภาษาหรือหลายภาษา ใช้ Ctrl/Command-click เพื่อเลือกหลายรายการ", imageInvalidType: "โปรดอัปโหลดภาพ PNG, JPG หรือ WebP", imageTooLarge: "ไฟล์ภาพต้นฉบับต้องมีขนาดไม่เกิน 200 MB", imageProcessing: "กำลังสร้างภาพแบนเนอร์ การ์ดรายการ และโซเชียลมีเดีย...", imageReady: "ภาพทุกเวอร์ชันพร้อมแล้วจากภาพต้นฉบับหนึ่งภาพ ขนาดต้นฉบับ: {size} KB", brandToneUnavailable: "ขออภัย ฟีเจอร์ปรับโทนแบรนด์ไม่พร้อมใช้งานในขณะนี้ โปรดดำเนินการส่งข้อเสนอของคุณต่อไป", translationUnavailable: "ขออภัย ฟีเจอร์แปลภาษาไม่พร้อมใช้งานในขณะนี้ โปรดดำเนินการส่งข้อเสนอของคุณต่อไป" },
  vi: { moreInformationLabel: "Thông tin thêm", translationSelectionHelp: "Chọn một hoặc nhiều ngôn ngữ. Dùng Ctrl/Command-click để chọn nhiều mục.", imageInvalidType: "Vui lòng tải lên ảnh PNG, JPG hoặc WebP.", imageTooLarge: "Tệp ảnh nguồn không được vượt quá 200 MB.", imageProcessing: "Đang tạo các phiên bản banner, ô danh sách và ảnh mạng xã hội...", imageReady: "Đã tạo xong tất cả phiên bản từ một ảnh nguồn. Kích thước nguồn: {size} KB.", brandToneUnavailable: "Rất tiếc, tính năng Điều chỉnh giọng thương hiệu hiện không khả dụng. Vui lòng tiếp tục gửi ưu đãi của bạn.", translationUnavailable: "Rất tiếc, tính năng Dịch thuật hiện không khả dụng. Vui lòng tiếp tục gửi ưu đãi của bạn." },
  id: { moreInformationLabel: "Informasi selengkapnya", translationSelectionHelp: "Pilih satu atau beberapa bahasa. Gunakan Ctrl/Command-click untuk memilih beberapa opsi.", imageInvalidType: "Unggah gambar PNG, JPG, atau WebP.", imageTooLarge: "File gambar sumber tidak boleh melebihi 200 MB.", imageProcessing: "Membuat versi banner, tile daftar, dan gambar media sosial...", imageReady: "Semua versi gambar siap dari satu gambar sumber. Ukuran sumber: {size} KB.", brandToneUnavailable: "Maaf, fitur Penyesuaian Gaya Merek saat ini tidak tersedia. Silakan lanjutkan pengiriman penawaran Anda.", translationUnavailable: "Maaf, fitur Terjemahan saat ini tidak tersedia. Silakan lanjutkan pengiriman penawaran Anda." },
  ja: { moreInformationLabel: "詳細情報", translationSelectionHelp: "1つ以上の言語を選択してください。複数選択にはCtrl/Command-clickを使用します。", imageInvalidType: "PNG、JPG、またはWebP画像をアップロードしてください。", imageTooLarge: "元画像のファイルサイズは200 MB以下にしてください。", imageProcessing: "バナー、一覧タイル、ソーシャル画像を作成しています...", imageReady: "1枚の元画像からすべての画像を作成しました。元画像サイズ：{size} KB。", brandToneUnavailable: "申し訳ありません。ブランドトーン調整機能は現在ご利用いただけません。そのままオファーの送信を続けてください。", translationUnavailable: "申し訳ありません。翻訳機能は現在ご利用いただけません。そのままオファーの送信を続けてください。" },
  ar: { moreInformationLabel: "مزيد من المعلومات", translationSelectionHelp: "اختر لغة واحدة أو أكثر. استخدم Ctrl/Command-click لتحديد عدة خيارات.", imageInvalidType: "يرجى تحميل صورة بصيغة PNG أو JPG أو WebP.", imageTooLarge: "يجب ألا يتجاوز ملف الصورة المصدر 200 ميغابايت.", imageProcessing: "جارٍ إنشاء نسخ اللافتة وبطاقة القائمة وصورة وسائل التواصل...", imageReady: "جميع نسخ الصور جاهزة من صورة مصدر واحدة. حجم المصدر: {size} كيلوبايت.", brandToneUnavailable: "عذرًا، ميزة مواءمة نبرة العلامة التجارية غير متاحة حاليًا. يرجى متابعة إرسال عرضك.", translationUnavailable: "عذرًا، ميزة الترجمة غير متاحة حاليًا. يرجى متابعة إرسال عرضك." },
  tr: { moreInformationLabel: "Daha fazla bilgi", translationSelectionHelp: "Bir veya daha fazla dil seçin. Birden fazla seçim için Ctrl/Command-click kullanın.", imageInvalidType: "Lütfen PNG, JPG veya WebP görseli yükleyin.", imageTooLarge: "Kaynak görsel dosyası 200 MB'ı aşmamalıdır.", imageProcessing: "Banner, liste kutucuğu ve sosyal medya görseli sürümleri oluşturuluyor...", imageReady: "Tüm görsel sürümleri tek bir kaynak görselden hazırlandı. Kaynak boyutu: {size} KB.", brandToneUnavailable: "Üzgünüz, Marka Tonu Uyarlama özelliği şu anda kullanılamıyor. Lütfen teklifinizi göndermeye devam edin.", translationUnavailable: "Üzgünüz, Çeviri özelliği şu anda kullanılamıyor. Lütfen teklifinizi göndermeye devam edin." },
};
Object.entries(runtimeCopyTranslations).forEach(([language, copy]) => Object.assign(uiTranslations[language], copy));

function applyLanguage(language) {
  const copy = uiTranslations[language] || uiTranslations.en;
  window.siteHeader?.setLanguage(language);
  const labels = localizedLanguageLabels[language] || localizedLanguageLabels.en;
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  if (translationAvailableLanguages) {
    const availableLanguages = Object.keys(contentLanguageLabels).map((code) => labels[code] || contentLanguageLabels[code]);
    const availableLanguagesLabel = availableLanguagesLabelTranslations[language] || availableLanguagesLabelTranslations.en;
    translationAvailableLanguages.replaceChildren();
    const label = document.createElement("strong");
    label.textContent = availableLanguagesLabel;
    translationAvailableLanguages.append(label, ` ${new Intl.ListFormat(language, { style: "long", type: "conjunction" }).format(availableLanguages)}`);
  }
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    const value = copy[key] ?? uiTranslations.en[key];
    if (value !== undefined) element.textContent = value;
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    const key = element.dataset.i18nAriaLabel;
    const value = copy[key] ?? uiTranslations.en[key];
    if (value !== undefined) element.setAttribute("aria-label", value);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const key = element.dataset.i18nPlaceholder;
    const value = copy[key] ?? uiTranslations.en[key];
    if (value !== undefined) element.setAttribute("placeholder", value);
  });
  document.querySelectorAll(".field-tooltip-trigger").forEach((element) => {
    element.setAttribute("aria-label", copy.moreInformationLabel || uiTranslations.en.moreInformationLabel);
  });
  if (heroText) heroText.textContent = copy.heroText || uiTranslations.en.heroText;
  translationSourceDisplay.textContent = labels[language] || contentLanguageLabels[language] || contentLanguageLabels.en;
  updateTranslationTargetOptions(language);
  renderTranslationPreviews();
  localStorage.setItem("explorer-offer-language", language);
}

const offerTypeLabels = {
  red_hot_rooms: "Red Hot Rooms",
  more_escapes: "More Escapes",
  hotel_stay: "Hotel stay",
  dining: "Dining",
  events: "Events",
  partners: "Partner Offers",
};

const typeFieldGroups = {
  red_hot_rooms: [
    { name: "booking_start_date", label: "Booking start date", type: "date", required: true },
    { name: "booking_end_date", label: "Booking end date", type: "date", required: true },
    { name: "stay_start_date", label: "Stay start date", type: "date", required: true },
    { name: "stay_end_date", label: "Stay end date", type: "date", required: true },
    { name: "room_type", label: "Room type", placeholder: "Example: King, Queen" },
    { name: "member_benefits", label: "Member benefits", placeholder: "Example: Accor Plus members exclusive Red Hot Rooms rate", required: true },
    { name: "original_price", label: "Original price", placeholder: "Example: THB 2,738++", required: true },
    { name: "discounted_price", label: "Discounted price", placeholder: "Example: THB 1,500++", required: true },
  ],
  more_escapes: [
    { name: "booking_start_date", label: "Booking start date", type: "date", required: true },
    { name: "booking_end_date", label: "Booking end date", type: "date", required: true },
    { name: "stay_start_date", label: "Stay start date", type: "date", required: true },
    { name: "stay_end_date", label: "Stay end date", type: "date", required: true },
    { name: "member_package_price", label: "Member package price", placeholder: "Example: 2 nights from AUD 215", required: true },
    { name: "public_package_value", label: "Public package value", placeholder: "Example: 2 nights from AUD 390" },
  ],
  hotel_stay: [
    { name: "booking_start_date", label: "Booking start date", type: "date", required: true },
    { name: "booking_end_date", label: "Booking end date", type: "date", required: true },
    { name: "stay_start_date", label: "Stay start date", type: "date", required: true },
    { name: "stay_end_date", label: "Stay end date", type: "date", required: true },
    { name: "member_benefits", label: "Member benefits", placeholder: "Example: 10% off family stay package", required: true },
    { name: "member_price_per_night", label: "Member price per night", placeholder: "Example: From SGD 337++ per night", required: true },
    { name: "public_price_per_night", label: "Public price per night", placeholder: "Example: From SGD 375++ per night" },
  ],
  dining: [
    { name: "price", label: "Public Package Price", placeholder: "Example: SGD 68++ per person", required: true },
    { name: "offer_validity_start_date", label: "Offer validity start date", type: "date", required: true },
    { name: "offer_validity_end_date", label: "Offer validity end date", type: "date", required: true },
    { name: "venue", label: "Venue", placeholder: "Example: The Cliff at Sofitel Singapore Sentosa Resort and Spa", required: true },
    { name: "member_benefits", label: "Member benefits", type: "textarea", placeholder: "Describe the member dining benefit, discount, inclusions, or early bird offer.", required: true },
  ],
  events: [
    { name: "public_price", label: "Public Package Price", placeholder: "Example: AUD 169 per person", required: true },
    { name: "member_price", label: "Member price", placeholder: "Example: AUD 139 per person", required: true },
    { name: "event_date", label: "Event date", type: "date", required: true },
    { name: "other_event_dates", label: "Other dates", type: "textarea", placeholder: "List any additional event dates." },
    { name: "event_time", label: "Event time", type: "time", required: true },
    { name: "venue", label: "Venue", placeholder: "Example: Room81 at Sofitel Gold Coast Broadbeach", required: true },
    { name: "exclusive_member_event", label: "Exclusive member event", type: "select", options: ["Yes", "No"], required: true },
  ],
  partners: [
    { name: "partner_name", label: "Partner name", placeholder: "Example: Europcar", required: true },
    { name: "offer_validity_start_date", label: "Offer validity start date", type: "date", required: true },
    { name: "offer_validity_end_date", label: "Offer validity end date", type: "date", required: true },
    { name: "member_benefits", label: "Member benefits", type: "textarea", placeholder: "Describe the exclusive partner benefit for Accor Plus members.", required: true },
  ],
};

const dynamicFieldLabels = {
  th: {
    booking_start_date: "วันที่เริ่มจอง",
    booking_end_date: "วันที่สิ้นสุดการจอง",
    stay_start_date: "วันที่เริ่มเข้าพัก",
    stay_end_date: "วันที่สิ้นสุดการเข้าพัก",
    room_type: "ประเภทห้อง",
    member_benefits: "สิทธิประโยชน์สมาชิก",
    original_price: "ราคาปกติ",
    discounted_price: "ราคาส่วนลด",
    package_details: "รายละเอียดแพ็กเกจ",
    member_package_price: "ราคาแพ็กเกจสำหรับสมาชิก",
    public_package_value: "มูลค่าแพ็กเกจทั่วไป",
    member_price_per_night: "ราคาสมาชิกต่อคืน",
    public_price_per_night: "ราคาทั่วไปต่อคืน",
    price: "ราคา",
    offer_validity_start_date: "วันที่เริ่มข้อเสนอ",
    offer_validity_end_date: "วันที่สิ้นสุดข้อเสนอ",
    venue: "สถานที่",
    booking_email: "จองผ่านอีเมล",
    accommodation_details: "รายละเอียดที่พัก",
    public_price: "ราคาทั่วไป",
    event_date: "วันที่จัดอีเวนต์",
    event_time: "เวลาอีเวนต์",
    member_price: "ราคาสมาชิก",
    partner_name: "ชื่อพาร์ทเนอร์",
  },
  vi: {
    booking_start_date: "Ngày bắt đầu đặt",
    booking_end_date: "Ngày kết thúc đặt",
    stay_start_date: "Ngày bắt đầu lưu trú",
    stay_end_date: "Ngày kết thúc lưu trú",
    room_type: "Loại phòng",
    member_benefits: "Quyền lợi thành viên",
    original_price: "Giá gốc",
    discounted_price: "Giá ưu đãi",
    package_details: "Chi tiết gói",
    member_package_price: "Giá gói cho thành viên",
    public_package_value: "Giá trị gói công khai",
    member_price_per_night: "Giá thành viên mỗi đêm",
    public_price_per_night: "Giá công khai mỗi đêm",
    price: "Giá",
    offer_validity_start_date: "Ngày bắt đầu hiệu lực",
    offer_validity_end_date: "Ngày kết thúc hiệu lực",
    venue: "Địa điểm",
    booking_email: "Đặt qua email",
    accommodation_details: "Chi tiết lưu trú",
    public_price: "Giá công khai",
    event_date: "Ngày sự kiện",
    event_time: "Giờ sự kiện",
    member_price: "Giá thành viên",
    partner_name: "Tên đối tác",
  },
  id: {
    booking_start_date: "Tanggal mulai pemesanan",
    booking_end_date: "Tanggal akhir pemesanan",
    stay_start_date: "Tanggal mulai menginap",
    stay_end_date: "Tanggal akhir menginap",
    room_type: "Tipe kamar",
    member_benefits: "Manfaat anggota",
    original_price: "Harga asli",
    discounted_price: "Harga diskon",
    package_details: "Detail paket",
    member_package_price: "Harga paket anggota",
    public_package_value: "Nilai paket publik",
    member_price_per_night: "Harga anggota per malam",
    public_price_per_night: "Harga publik per malam",
    price: "Harga",
    offer_validity_start_date: "Tanggal mulai penawaran",
    offer_validity_end_date: "Tanggal akhir penawaran",
    venue: "Tempat",
    booking_email: "Pemesanan via email",
    accommodation_details: "Detail akomodasi",
    public_price: "Harga publik",
    event_date: "Tanggal event",
    event_time: "Waktu event",
    member_price: "Harga anggota",
    partner_name: "Nama partner",
  },
  ja: {
    booking_start_date: "予約開始日",
    booking_end_date: "予約終了日",
    stay_start_date: "宿泊開始日",
    stay_end_date: "宿泊終了日",
    room_type: "客室タイプ",
    member_benefits: "会員特典",
    original_price: "通常価格",
    discounted_price: "割引価格",
    package_details: "パッケージ詳細",
    member_package_price: "会員パッケージ価格",
    public_package_value: "一般パッケージ価値",
    member_price_per_night: "会員料金 / 泊",
    public_price_per_night: "一般料金 / 泊",
    price: "価格",
    offer_validity_start_date: "オファー開始日",
    offer_validity_end_date: "オファー終了日",
    venue: "会場",
    booking_email: "メール予約",
    accommodation_details: "宿泊詳細",
    public_price: "一般価格",
    event_date: "イベント日",
    event_time: "イベント時間",
    member_price: "会員価格",
    partner_name: "パートナー名",
  },
  ar: {
    booking_start_date: "تاريخ بدء الحجز",
    booking_end_date: "تاريخ انتهاء الحجز",
    stay_start_date: "تاريخ بدء الإقامة",
    stay_end_date: "تاريخ انتهاء الإقامة",
    room_type: "نوع الغرفة",
    member_benefits: "مزايا الأعضاء",
    original_price: "السعر الأصلي",
    discounted_price: "السعر المخفّض",
    package_details: "تفاصيل الباقة",
    member_package_price: "سعر الباقة للأعضاء",
    public_package_value: "قيمة الباقة العامة",
    member_price_per_night: "سعر العضو لليلة",
    public_price_per_night: "السعر العام لليلة",
    price: "السعر",
    offer_validity_start_date: "تاريخ بدء صلاحية العرض",
    offer_validity_end_date: "تاريخ انتهاء صلاحية العرض",
    venue: "المكان",
    booking_email: "الحجز عبر البريد الإلكتروني",
    accommodation_details: "تفاصيل الإقامة",
    public_price: "السعر العام",
    event_date: "تاريخ الفعالية",
    event_time: "وقت الفعالية",
    member_price: "سعر العضو",
    partner_name: "اسم الشريك",
  },
  tr: {
    booking_start_date: "Rezervasyon başlangıç tarihi", booking_end_date: "Rezervasyon bitiş tarihi", stay_start_date: "Konaklama başlangıç tarihi", stay_end_date: "Konaklama bitiş tarihi", room_type: "Oda türü", member_benefits: "Üye avantajları", original_price: "Orijinal fiyat", discounted_price: "İndirimli fiyat", package_details: "Paket ayrıntıları", member_package_price: "Üye paket fiyatı", public_package_value: "Herkese açık paket değeri", member_price_per_night: "Gecelik üye fiyatı", public_price_per_night: "Gecelik genel fiyat", price: "Fiyat", offer_validity_start_date: "Teklif geçerlilik başlangıcı", offer_validity_end_date: "Teklif geçerlilik bitişi", venue: "Mekân", booking_email: "E-posta ile rezervasyon", accommodation_details: "Konaklama ayrıntıları", public_price: "Genel fiyat", event_date: "Etkinlik tarihi", event_time: "Etkinlik saati", member_price: "Üye fiyatı", partner_name: "İş ortağı adı",
  },
};

const feedbackDynamicFieldLabels = {
  th: { other_event_dates: "วันที่อื่น ๆ", exclusive_member_event: "อีเวนต์เฉพาะสมาชิก" },
  vi: { other_event_dates: "Các ngày khác", exclusive_member_event: "Sự kiện dành riêng cho thành viên" },
  id: { other_event_dates: "Tanggal lainnya", exclusive_member_event: "Event eksklusif anggota" },
  ja: { other_event_dates: "その他の日程", exclusive_member_event: "会員限定イベント" },
  ar: { other_event_dates: "تواريخ أخرى", exclusive_member_event: "فعالية حصرية للأعضاء" },
  tr: { other_event_dates: "Diğer tarihler", exclusive_member_event: "Üyelere özel etkinlik" },
};
Object.entries(feedbackDynamicFieldLabels).forEach(([language, labels]) => Object.assign(dynamicFieldLabels[language], labels));

const offerTypeFeedbackCopy = {
  en: {
    eventTileTitleHelp: "Enter the offer name and restaurant name. Example: An Exclusive Pommery Champagne Pairing Dinner at Tilda.",
    eventBannerTitleHelp: "Enter the offer name and restaurant name. Example: An Exclusive Pommery Champagne Pairing Dinner at Tilda.",
    eventSubtitleHelp: "Up to 150 characters. Summarise the event experience and key inclusion.",
    eventMetaHelp: "Up to 180 characters. Summarise the event, venue and hotel.",
    eventDescriptionHelp: "Up to 500 characters. Describe the event experience, menu or inclusions, price and availability.",
    eventMenuLabel: "Event menu PDF (optional)",
    eventMenuHelp: "Attach the relevant event menu PDF if applicable. Please merge PDFs into one file. PDF must be less than 5 MB.",
    redHotTitleHelp: "Use the hotel name. Example: The Sebel Brisbane.",
    redHotTerms: "Accommodation must be fully prepaid at the time of booking. No cancellation or changes permitted. Subject to availability and a limited allocation of rooms.",
  },
  th: {
    eventTileTitleHelp: "ระบุชื่อข้อเสนอและชื่อห้องอาหาร เช่น An Exclusive Pommery Champagne Pairing Dinner at Tilda",
    eventBannerTitleHelp: "ระบุชื่อข้อเสนอและชื่อห้องอาหาร เช่น An Exclusive Pommery Champagne Pairing Dinner at Tilda",
    eventSubtitleHelp: "ไม่เกิน 150 ตัวอักษร สรุปประสบการณ์อีเวนต์และสิ่งสำคัญที่รวมอยู่",
    eventMetaHelp: "ไม่เกิน 180 ตัวอักษร สรุปอีเวนต์ สถานที่ และโรงแรม",
    eventDescriptionHelp: "ไม่เกิน 500 ตัวอักษร อธิบายประสบการณ์ เมนูหรือสิ่งที่รวม ราคา และช่วงเวลาที่ให้บริการ",
    eventMenuLabel: "PDF เมนูอีเวนต์ (ไม่บังคับ)",
    eventMenuHelp: "แนบ PDF เมนูอีเวนต์ที่เกี่ยวข้องหากมี โปรดรวมเป็นไฟล์เดียวและขนาดต้องน้อยกว่า 5 MB",
    redHotTitleHelp: "ใช้ชื่อโรงแรม เช่น The Sebel Brisbane",
    redHotTerms: "ต้องชำระค่าที่พักเต็มจำนวนเมื่อจอง ไม่อนุญาตให้ยกเลิกหรือเปลี่ยนแปลง ขึ้นอยู่กับจำนวนห้องว่างและโควตาห้องที่จำกัด",
  },
  vi: {
    eventTileTitleHelp: "Nhập tên ưu đãi và tên nhà hàng. Ví dụ: An Exclusive Pommery Champagne Pairing Dinner at Tilda.",
    eventBannerTitleHelp: "Nhập tên ưu đãi và tên nhà hàng. Ví dụ: An Exclusive Pommery Champagne Pairing Dinner at Tilda.",
    eventSubtitleHelp: "Tối đa 150 ký tự. Tóm tắt trải nghiệm sự kiện và quyền lợi chính.",
    eventMetaHelp: "Tối đa 180 ký tự. Tóm tắt sự kiện, địa điểm và khách sạn.",
    eventDescriptionHelp: "Tối đa 500 ký tự. Mô tả trải nghiệm, thực đơn hoặc quyền lợi, giá và thời gian áp dụng.",
    eventMenuLabel: "PDF thực đơn sự kiện (không bắt buộc)",
    eventMenuHelp: "Đính kèm PDF thực đơn sự kiện nếu phù hợp. Vui lòng gộp thành một tệp dưới 5 MB.",
    redHotTitleHelp: "Dùng tên khách sạn. Ví dụ: The Sebel Brisbane.",
    redHotTerms: "Phải thanh toán toàn bộ tiền phòng tại thời điểm đặt. Không được hủy hoặc thay đổi. Tùy tình trạng phòng và số lượng phòng giới hạn.",
  },
  id: {
    eventTileTitleHelp: "Masukkan nama penawaran dan nama restoran. Contoh: An Exclusive Pommery Champagne Pairing Dinner at Tilda.",
    eventBannerTitleHelp: "Masukkan nama penawaran dan nama restoran. Contoh: An Exclusive Pommery Champagne Pairing Dinner at Tilda.",
    eventSubtitleHelp: "Maksimal 150 karakter. Ringkas pengalaman event dan inklusi utama.",
    eventMetaHelp: "Maksimal 180 karakter. Ringkas event, lokasi, dan hotel.",
    eventDescriptionHelp: "Maksimal 500 karakter. Jelaskan pengalaman, menu atau inklusi, harga, dan ketersediaan.",
    eventMenuLabel: "PDF menu event (opsional)",
    eventMenuHelp: "Lampirkan PDF menu event yang relevan jika ada. Gabungkan menjadi satu file berukuran kurang dari 5 MB.",
    redHotTitleHelp: "Gunakan nama hotel. Contoh: The Sebel Brisbane.",
    redHotTerms: "Akomodasi harus dibayar penuh saat pemesanan. Pembatalan atau perubahan tidak diizinkan. Tergantung ketersediaan dan alokasi kamar terbatas.",
  },
  ja: {
    eventTileTitleHelp: "オファー名とレストラン名を入力してください。例：An Exclusive Pommery Champagne Pairing Dinner at Tilda",
    eventBannerTitleHelp: "オファー名とレストラン名を入力してください。例：An Exclusive Pommery Champagne Pairing Dinner at Tilda",
    eventSubtitleHelp: "150文字以内。イベント体験と主な内容を要約してください。",
    eventMetaHelp: "180文字以内。イベント、会場、ホテルを要約してください。",
    eventDescriptionHelp: "500文字以内。体験、メニューまたは特典、料金、提供期間を記載してください。",
    eventMenuLabel: "イベントメニューPDF（任意）",
    eventMenuHelp: "該当する場合はイベントメニューPDFを添付してください。1つのファイルにまとめ、5 MB未満にしてください。",
    redHotTitleHelp: "ホテル名を使用してください。例：The Sebel Brisbane",
    redHotTerms: "予約時に宿泊料金全額の事前支払いが必要です。キャンセルや変更はできません。空室状況および限定された客室数によりご利用いただけない場合があります。",
  },
  ar: {
    eventTileTitleHelp: "أدخل اسم العرض واسم المطعم. مثال: An Exclusive Pommery Champagne Pairing Dinner at Tilda.",
    eventBannerTitleHelp: "أدخل اسم العرض واسم المطعم. مثال: An Exclusive Pommery Champagne Pairing Dinner at Tilda.",
    eventSubtitleHelp: "حتى 150 حرفاً. لخّص تجربة الفعالية وأبرز ما تتضمنه.",
    eventMetaHelp: "حتى 180 حرفاً. لخّص الفعالية والمكان والفندق.",
    eventDescriptionHelp: "حتى 500 حرف. صف التجربة والقائمة أو المزايا والسعر وفترة التوفر.",
    eventMenuLabel: "قائمة الفعالية بصيغة PDF (اختياري)",
    eventMenuHelp: "أرفق قائمة الفعالية ذات الصلة إن وجدت. ادمج الملفات في ملف واحد يقل حجمه عن 5 ميغابايت.",
    redHotTitleHelp: "استخدم اسم الفندق. مثال: The Sebel Brisbane.",
    redHotTerms: "يجب دفع قيمة الإقامة بالكامل عند الحجز. لا يُسمح بالإلغاء أو التعديل. يخضع العرض للتوافر ولعدد محدود من الغرف.",
  },
  tr: {
    eventTileTitleHelp: "Teklif adını ve restoran adını girin. Örnek: An Exclusive Pommery Champagne Pairing Dinner at Tilda.",
    eventBannerTitleHelp: "Teklif adını ve restoran adını girin. Örnek: An Exclusive Pommery Champagne Pairing Dinner at Tilda.",
    eventSubtitleHelp: "En fazla 150 karakter. Etkinlik deneyimini ve temel içeriği özetleyin.",
    eventMetaHelp: "En fazla 180 karakter. Etkinliği, mekanı ve oteli özetleyin.",
    eventDescriptionHelp: "En fazla 500 karakter. Deneyimi, menüyü veya dahil olanları, fiyatı ve geçerlilik dönemini açıklayın.",
    eventMenuLabel: "Etkinlik menüsü PDF (isteğe bağlı)",
    eventMenuHelp: "Varsa ilgili etkinlik menüsünü PDF olarak ekleyin. Dosyaları tek dosyada birleştirin; dosya 5 MB'tan küçük olmalıdır.",
    redHotTitleHelp: "Otel adını kullanın. Örnek: The Sebel Brisbane.",
    redHotTerms: "Konaklama bedelinin tamamı rezervasyon sırasında ödenmelidir. İptal veya değişiklik yapılamaz. Müsaitliğe ve sınırlı oda kontenjanına tabidir.",
  },
};

const diningMenuCopy = {
  en: { label: "Menu attachment PDF (optional)", help: "Attach the relevant dining menu PDF if available. Please merge PDFs into one file. PDF must be less than 5 MB." },
  th: { label: "ไฟล์แนบเมนู PDF (ไม่บังคับ)", help: "แนบเมนูอาหาร PDF ที่เกี่ยวข้องหากมี โปรดรวมเป็นไฟล์เดียวและขนาดต้องน้อยกว่า 5 MB" },
  vi: { label: "Tệp PDF thực đơn đính kèm (không bắt buộc)", help: "Đính kèm PDF thực đơn nhà hàng nếu có. Vui lòng gộp thành một tệp dưới 5 MB." },
  id: { label: "Lampiran menu PDF (opsional)", help: "Lampirkan PDF menu dining yang relevan jika tersedia. Gabungkan menjadi satu file berukuran kurang dari 5 MB." },
  ja: { label: "メニュー添付PDF（任意）", help: "該当するダイニングメニューPDFがある場合は添付してください。1つのファイルにまとめ、5 MB未満にしてください。" },
  ar: { label: "مرفق قائمة الطعام بصيغة PDF (اختياري)", help: "أرفق قائمة الطعام ذات الصلة بصيغة PDF إن توفرت. ادمج الملفات في ملف واحد يقل حجمه عن 5 ميغابايت." },
  tr: { label: "Menü eki PDF (isteğe bağlı)", help: "Varsa ilgili yemek menüsünü PDF olarak ekleyin. Dosyaları tek dosyada birleştirin; dosya 5 MB'tan küçük olmalıdır." },
};

const helperNoteTranslations = {
  en: "Select an offer type to see the fields required for that manual process.",
  th: "เลือกประเภทข้อเสนอเพื่อดูช่องข้อมูลที่จำเป็นสำหรับขั้นตอนนั้น",
  vi: "Chọn loại ưu đãi để xem các trường cần thiết cho quy trình đó.",
  id: "Pilih jenis penawaran untuk melihat kolom yang diperlukan untuk proses tersebut.",
  ja: "オファー種別を選択すると、その手順に必要な項目が表示されます。",
  ar: "اختر نوع العرض لعرض الحقول المطلوبة لهذه العملية.",
  tr: "Bu süreç için gerekli alanları görmek üzere bir teklif türü seçin.",
};

const dateRangePairs = [
  { start: "booking_start_date", end: "booking_end_date", label: "Booking period" },
  { start: "stay_start_date", end: "stay_end_date", label: "Stay period" },
  { start: "offer_validity_start_date", end: "offer_validity_end_date", label: "Offer validity" },
];

function setMessage(message, type = "") {
  formMessage.textContent = message;
  formMessage.className = `form-message ${type}`.trim();
}

function validateDates() {
  dateMessage.textContent = "";
  for (const pair of dateRangePairs) {
    const start = dynamicFieldValue(pair.start);
    const end = dynamicFieldValue(pair.end);
    if (start && end && start > end) {
      dateMessage.textContent = `${pair.label} start date must be before the end date.`;
      return false;
    }
  }
  return true;
}

function isStayOffer() {
  return ["red_hot_rooms", "more_escapes", "hotel_stay"].includes(offerType.value);
}

function isDiningOrEventOffer() {
  return ["dining", "events"].includes(offerType.value);
}

function isPartnerOffer() {
  return offerType.value === "partners";
}

function requiresBookingScreenshot() {
  return Boolean(uploadRequirementsByOfferType[offerType.value]?.bookingScreenshot);
}

function updateProofUploadFields(clearInactive = false) {
  const requirements = uploadRequirementsByOfferType[offerType.value] || {};
  const needsRateScreenshot = Boolean(requirements.rateScreenshot);
  const needsMenuPdf = Boolean(requirements.menuPdf);
  const requiresMenuPdf = Boolean(requirements.menuPdfRequired);
  const needsBookingScreenshot = Boolean(requirements.bookingScreenshot);
  const rateScreenshotInput = form.elements.rate_screenshot;
  const menuPdfInput = form.elements.menu_pdf;
  const bookingScreenshotInput = form.elements.booking_screenshot;

  rateScreenshotCard.classList.toggle("is-hidden", !needsRateScreenshot);
  menuPdfCard.classList.toggle("is-hidden", !needsMenuPdf);
  bookingScreenshotCard.classList.toggle("is-hidden", !needsBookingScreenshot);
  rateScreenshotInput.required = needsRateScreenshot;
  menuPdfInput.required = requiresMenuPdf;
  bookingScreenshotInput.required = needsBookingScreenshot;

  [
    [rateScreenshotInput, needsRateScreenshot],
    [menuPdfInput, needsMenuPdf],
    [bookingScreenshotInput, needsBookingScreenshot],
  ].forEach(([input, required]) => {
    if (clearInactive && !required) input.value = "";
    if (!required) updateFileName(input);
  });
}

function selectedBookingMethod() {
  return isDiningOrEventOffer() ? (form.elements.booking_method?.value || "booking_link") : "booking_link";
}

function updateBookingMethodFields(clearInactive = false) {
  const offersBookingChoice = isDiningOrEventOffer();
  const bookingLinkOption = form.querySelector('input[name="booking_method"][value="booking_link"]');
  if (!offersBookingChoice || !form.elements.booking_method?.value) bookingLinkOption.checked = true;
  const method = selectedBookingMethod();
  const usesBookingLink = method === "booking_link";
  const usesEmailRsvp = offersBookingChoice && method === "email_rsvp";
  const bookingLinkInput = form.elements.booking_link;
  const bookingEmailInput = form.elements.booking_email;

  bookingMethodFieldset.classList.toggle("is-hidden", !offersBookingChoice);
  bookingLinkFields.classList.toggle("is-hidden", !usesBookingLink);
  bookingEmailFields.classList.toggle("is-hidden", !usesEmailRsvp);
  bookingLinkInput.required = usesBookingLink;
  bookingEmailInput.required = usesEmailRsvp;

  if (clearInactive && !usesBookingLink) bookingLinkInput.value = "";
  if (clearInactive && !usesEmailRsvp) bookingEmailInput.value = "";
  updateProofUploadFields(clearInactive);
}

function renderTypeSpecificFields() {
  const selected = offerType.value;
  const fields = typeFieldGroups[selected] || [];
  const language = languageSelect.value || "en";
  const existingValues = collectDynamicFields();
  typeSpecificFields.innerHTML = "";
  accommodationDetailsCoreField.classList.toggle("is-hidden", selected !== "events");
  form.elements.accommodation_details.required = false;

  if (!selected) {
    return;
  }

  const grid = document.createElement("div");
  grid.className = "grid two dynamic-grid";

  fields.forEach((field) => {
    const label = document.createElement("label");
    if (field.name === "member_benefits") label.classList.add("full-width-field");
    const labelText = document.createElement("span");
    labelText.textContent = dynamicFieldLabels[language]?.[field.name] || field.label;
    label.append(labelText);
    const input = document.createElement(field.type === "textarea" ? "textarea" : field.type === "select" ? "select" : "input");
    input.name = field.name;
    input.dataset.dynamicField = "true";
    input.required = Boolean(field.required);
    input.placeholder = field.placeholder || "";
    if (field.type === "select") {
      const emptyOption = document.createElement("option");
      emptyOption.value = "";
      emptyOption.textContent = (uiTranslations[language] || uiTranslations.en).selectOne;
      input.append(emptyOption);
      field.options.forEach((value) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = field.name === "exclusive_member_event"
          ? (value === "Yes" ? (uiTranslations[language] || uiTranslations.en).yesLabel : (uiTranslations[language] || uiTranslations.en).noLabel)
          : value;
        input.append(option);
      });
    }
    input.value = existingValues[field.name] || "";
    if (field.type === "textarea") input.rows = 4;
    if (["date", "time"].includes(field.type)) input.type = field.type;
    if (field.type === "date") input.addEventListener("input", validateDates);
    label.append(input);
    grid.append(label);
  });

  typeSpecificFields.append(grid);
  updateBookingMethodFields();
}

function updateCoreOfferGuidance() {
  const selected = offerType.value;
  const language = languageSelect.value || "en";
  const copy = uiTranslations[language] || uiTranslations.en;
  const feedbackCopy = offerTypeFeedbackCopy[language] || offerTypeFeedbackCopy.en;
  const tileTitle = offerTileTitleInput;
  const subtitle = form.elements.offer_subtitle;
  const metaDescription = form.elements.meta_description;
  const terms = form.elements.terms;
  const tileHelp = document.querySelector("[data-i18n='offerTileTitleHelp']");
  const bannerHelp = document.querySelector("[data-i18n='offerBannerTitleHelp']");
  const subtitleHelp = document.querySelector("[data-i18n='offerSubtitleHelp']");
  const metaHelp = document.querySelector("[data-i18n='metaDescriptionHelp']");
  const descriptionHelp = document.querySelector("[data-i18n='offerDescriptionHelp']");
  const isRedHotRooms = selected === "red_hot_rooms";

  offerSubtitleField.classList.toggle("is-hidden", isRedHotRooms);
  subtitle.required = !isRedHotRooms;
  if (isRedHotRooms) {
    subtitle.value = "";
  }

  tileHelp.textContent = copy.offerTileTitleHelp;
  bannerHelp.textContent = copy.offerBannerTitleHelp;
  subtitleHelp.textContent = copy.offerSubtitleHelp;
  metaHelp.textContent = copy.metaDescriptionHelp;
  descriptionHelp.textContent = copy.offerDescriptionHelp;
  menuPdfLabel.textContent = copy.menuPdfLabel;
  menuPdfHelp.textContent = copy.menuPdfHelp;

  if (selected === "events") {
    tileTitle.placeholder = "Example: An Exclusive Pommery Champagne Pairing Dinner at Tilda";
    offerBannerTitleInput.placeholder = "Example: An Exclusive Pommery Champagne Pairing Dinner at Tilda";
    subtitle.placeholder = "Example: Discover a specially curated three-course menu at Tilda";
    metaDescription.placeholder = "Example: Discover a curated dining event at Tilda at Sofitel Wentworth Sydney.";
    tileHelp.textContent = feedbackCopy.eventTileTitleHelp;
    bannerHelp.textContent = feedbackCopy.eventBannerTitleHelp;
    subtitleHelp.textContent = feedbackCopy.eventSubtitleHelp;
    metaHelp.textContent = feedbackCopy.eventMetaHelp;
    descriptionHelp.textContent = feedbackCopy.eventDescriptionHelp;
    menuPdfLabel.textContent = feedbackCopy.eventMenuLabel;
    menuPdfHelp.textContent = feedbackCopy.eventMenuHelp;
  } else if (selected === "dining") {
    const diningCopy = diningMenuCopy[language] || diningMenuCopy.en;
    menuPdfLabel.textContent = diningCopy.label;
    menuPdfHelp.textContent = diningCopy.help;
  } else if (isRedHotRooms) {
    tileTitle.placeholder = "Example: The Sebel Brisbane";
    offerBannerTitleInput.placeholder = "Example: The Sebel Brisbane";
    metaDescription.placeholder = copy.metaDescriptionHelp;
    tileHelp.textContent = feedbackCopy.redHotTitleHelp;
    bannerHelp.textContent = feedbackCopy.redHotTitleHelp;
    updateRedHotRoomsTitles();
  } else if (selected === "more_escapes") {
    tileTitle.placeholder = "Example: Sofitel Sydney Darling Harbour";
    offerBannerTitleInput.placeholder = "Example: More Escapes at Sofitel Sydney Darling Harbour";
    subtitle.placeholder = "Example: Explorer members receive a luxury escape with premium inclusions.";
    metaDescription.placeholder = "Example: 2-night luxury escape including upgrade, parking and breakfast.";
    updateMoreEscapesBannerTitle();
  } else {
    tileTitle.placeholder = "Shown on listing tiles";
    offerBannerTitleInput.placeholder = "Shown on the offer page banner";
    subtitle.placeholder = "Short member-facing benefit line";
    metaDescription.placeholder = "Up to 180 characters for search/social preview";
  }

  if (isRedHotRooms && (!terms.value.trim() || terms.dataset.redHotDefault === "true")) {
    terms.value = feedbackCopy.redHotTerms;
    terms.dataset.redHotDefault = "true";
  } else if (!isRedHotRooms && terms.dataset.redHotDefault === "true") {
    terms.value = "";
    terms.dataset.redHotDefault = "false";
  }
}

function updateOfferDependentVisibility() {
  const hasOfferType = Boolean(offerType.value);
  form.classList.toggle("offer-type-pending", !hasOfferType);
  offerDependentNavigationItems.forEach((item) => item?.classList.toggle("is-offer-dependent-hidden", !hasOfferType));
}

function updateMoreEscapesBannerTitle() {
  if (offerType.value !== "more_escapes") return;
  const hotelName = hotelNameInput.value.trim();
  const suggestion = hotelName ? `More Escapes at ${hotelName}` : "";
  if (!offerBannerTitleInput.value.trim() || offerBannerTitleInput.dataset.autoSuggested === "true") {
    offerBannerTitleInput.value = suggestion;
    offerBannerTitleInput.dataset.autoSuggested = "true";
  }
}

function updateRedHotRoomsTitles() {
  if (offerType.value !== "red_hot_rooms") return;
  const hotelName = hotelNameInput.value.trim();
  [offerTileTitleInput, offerBannerTitleInput].forEach((input) => {
    if (!input.value.trim() || input.dataset.redHotAutoSuggested === "true") {
      input.value = hotelName;
      input.dataset.redHotAutoSuggested = "true";
    }
  });
}

hotelNameInput.addEventListener("input", () => {
  updateMoreEscapesBannerTitle();
  updateRedHotRoomsTitles();
});
offerTileTitleInput.addEventListener("input", (event) => {
  if (event.isTrusted) offerTileTitleInput.dataset.redHotAutoSuggested = "false";
});
offerBannerTitleInput.addEventListener("input", (event) => {
  if (event.isTrusted) {
    offerBannerTitleInput.dataset.autoSuggested = "false";
    offerBannerTitleInput.dataset.redHotAutoSuggested = "false";
  }
});
form.elements.terms.addEventListener("input", (event) => {
  if (event.isTrusted) form.elements.terms.dataset.redHotDefault = "false";
});

function validateRequiredDetails() {
  const missing = [];
  if (!isPartnerOffer()) {
    if (!form.elements.hotel_rid_code.value.trim()) missing.push("hotel RID code");
    if (!form.elements.hotel_name.value.trim()) missing.push("hotel name");
    if (!form.elements.city_country.value.trim()) missing.push("city - country");
  }
  if (isPartnerOffer() && !dynamicFieldValue("partner_name")) {
    missing.push("partner name");
  }

  if (missing.length) {
    setMessage(`Please complete: ${missing.join(", ")}.`, "error");
    return false;
  }
  return true;
}

function validateRequiredUploads() {
  const missing = [];
  if (isStayOffer() && !form.elements.rate_screenshot.files.length) {
    missing.push("rate screenshot");
  }
  if (uploadRequirementsByOfferType[offerType.value]?.menuPdfRequired && !form.elements.menu_pdf.files.length) {
    missing.push("menu PDF");
  }
  const menuPdf = form.elements.menu_pdf.files[0];
  if (menuPdf && menuPdf.size >= maxPdfUploadSize) {
    menuPdfMessage.textContent = "PDF files must be less than 5 MB. Please reduce the file size and try again.";
    setMessage("The menu PDF must be less than 5 MB.", "error");
    return false;
  }
  if (requiresBookingScreenshot() && !form.elements.booking_screenshot.files.length) {
    missing.push("final booking-page screenshot");
  }
  if (!resizedBannerFile) {
    missing.push("banner image");
  }
  if (!resizedListingTileFile) {
    missing.push("listing tile image");
  }
  if (!resizedSocialFile) {
    missing.push("social image");
  }

  if (missing.length) {
    setMessage(`Please add the required upload: ${missing.join(", ")}.`, "error");
    return false;
  }
  return true;
}

async function resizeImage(file, targetWidth = 1600, targetHeight = 1000, cover = false) {
  const bitmap = await createImageBitmap(file);
  const scale = cover
    ? Math.max(targetWidth / bitmap.width, targetHeight / bitmap.height)
    : Math.min(1, targetWidth / bitmap.width, targetHeight / bitmap.height);
  const width = cover ? targetWidth : Math.round(bitmap.width * scale);
  const height = cover ? targetHeight : Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (cover) {
    const sourceWidth = targetWidth / scale;
    const sourceHeight = targetHeight / scale;
    const sourceX = (bitmap.width - sourceWidth) / 2;
    const sourceY = (bitmap.height - sourceHeight) / 2;
    context.drawImage(bitmap, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);
  } else {
    context.drawImage(bitmap, 0, 0, width, height);
  }

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.86));
  return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
}

async function handleImageUpload(input, preview, message, setFile, options) {
  const file = input.files[0];
  setFile(null);
  preview.style.display = "none";
  preview.closest(".upload-zone")?.classList.remove("has-preview");
  message.textContent = "";

  if (!file) return;
  if (!file.type.startsWith("image/")) {
    message.textContent = "Please upload a PNG, JPG, or WebP image.";
    input.value = "";
    return;
  }
  if (file.size > maxImageUploadSize) {
    message.textContent = "Image source file must not exceed 200 MB.";
    input.value = "";
    return;
  }

  message.textContent = "Resizing image...";
  const resized = await resizeImage(file, options.width, options.height, options.cover);
  const finalFile = new File([resized], options.outputName, { type: "image/jpeg" });
  setFile(finalFile);
  preview.src = URL.createObjectURL(finalFile);
  preview.style.display = "block";
  preview.closest(".upload-zone")?.classList.add("has-preview");

  const before = Math.round(file.size / 1024);
  const after = Math.round(finalFile.size / 1024);
  message.textContent = `${options.label} ready. Auto-resized to ${options.width} x ${options.height}px from ${before} KB to ${after} KB.`;
}

function showPreview(preview, file) {
  preview.src = URL.createObjectURL(file);
  preview.style.display = "block";
  preview.closest(".upload-zone")?.classList.add("has-preview");
}

async function handleMasterImageUpload() {
  const copy = uiTranslations[languageSelect.value] || uiTranslations.en;
  const file = masterImageInput.files[0];
  masterImageInput.closest(".upload-zone")?.classList.remove("has-preview");
  bannerInput.closest(".upload-zone")?.classList.remove("has-preview");
  listingTileInput.closest(".upload-zone")?.classList.remove("has-preview");
  socialInput.closest(".upload-zone")?.classList.remove("has-preview");
  masterBannerPreview.style.display = "none";
  masterListingPreview.style.display = "none";
  masterSocialPreview.style.display = "none";
  generatedImagePreviews.classList.add("is-hidden");
  masterImageMessage.textContent = "";

  if (!file) return;
  if (!file.type.startsWith("image/")) {
    masterImageMessage.textContent = copy.imageInvalidType;
    masterImageInput.value = "";
    return;
  }
  if (file.size > maxImageUploadSize) {
    masterImageMessage.textContent = copy.imageTooLarge;
    masterImageInput.value = "";
    return;
  }

  masterImageMessage.textContent = copy.imageProcessing;
  const [banner, listingTile, social] = await Promise.all([
    resizeImage(file, 2048, 1366, true),
    resizeImage(file, 400, 250, true),
    resizeImage(file, 1080, 1080, true),
  ]);

  resizedBannerFile = new File([banner], "banner-2048x1366.jpg", { type: "image/jpeg" });
  resizedListingTileFile = new File([listingTile], "listing-tile-400x250.jpg", { type: "image/jpeg" });
  resizedSocialFile = new File([social], "social-1080x1080.jpg", { type: "image/jpeg" });

  showPreview(masterBannerPreview, resizedBannerFile);
  showPreview(masterListingPreview, resizedListingTileFile);
  showPreview(masterSocialPreview, resizedSocialFile);
  generatedImagePreviews.classList.remove("is-hidden");
  showPreview(bannerPreview, resizedBannerFile);
  showPreview(listingTilePreview, resizedListingTileFile);
  showPreview(socialPreview, resizedSocialFile);

  const before = Math.round(file.size / 1024);
  masterImageMessage.textContent = copy.imageReady.replace("{size}", before);
  bannerMessage.textContent = "Banner image ready from master upload.";
  listingTileMessage.textContent = "Listing tile image ready from master upload.";
  socialMessage.textContent = "Social image ready from master upload.";
}

masterImageInput.addEventListener("change", handleMasterImageUpload);

bannerInput.addEventListener("change", () => handleImageUpload(
  bannerInput,
  bannerPreview,
  bannerMessage,
  (file) => { resizedBannerFile = file; },
  { width: 2048, height: 1366, cover: true, label: "Banner image", outputName: "banner-2048x1366.jpg" },
));

listingTileInput.addEventListener("change", () => handleImageUpload(
  listingTileInput,
  listingTilePreview,
  listingTileMessage,
  (file) => { resizedListingTileFile = file; },
  { width: 400, height: 250, cover: true, label: "Listing tile image", outputName: "listing-tile-400x250.jpg" },
));

socialInput.addEventListener("change", () => handleImageUpload(
  socialInput,
  socialPreview,
  socialMessage,
  (file) => { resizedSocialFile = file; },
  { width: 1080, height: 1080, cover: true, label: "Social image", outputName: "social-1080x1080.jpg" },
));

function updateFileName(input) {
  const filename = document.querySelector(`[data-file-name-for="${input.name}"]`);
  if (filename) filename.textContent = input.files[0]?.name || ((uiTranslations[languageSelect.value] || uiTranslations.en).noFileSelected || "No file selected");
  input.closest(".file-card")?.classList.toggle("has-file", Boolean(input.files[0]));
}

document.querySelectorAll('input[type="file"]').forEach((input) => {
  input.addEventListener("change", () => updateFileName(input));
});
form.elements.menu_pdf.addEventListener("change", () => {
  const file = form.elements.menu_pdf.files[0];
  menuPdfMessage.textContent = "";
  if (file && file.size >= maxPdfUploadSize) {
    menuPdfMessage.textContent = "PDF files must be less than 5 MB. Please reduce the file size and try again.";
    form.elements.menu_pdf.value = "";
    updateFileName(form.elements.menu_pdf);
  }
});

alignBrandToneButton.addEventListener("click", async () => {
  const copy = uiTranslations[languageSelect.value] || uiTranslations.en;
  const description = offerDescription.value.trim();
  if (!description) {
    brandToneStatus.textContent = copy.alignBrandToneEmpty;
    brandToneStatus.className = "muted error";
    offerDescription.focus();
    return;
  }

  alignBrandToneButton.disabled = true;
  alignBrandToneButton.textContent = copy.alignBrandToneWorking;
  brandToneStatus.textContent = copy.alignBrandToneProgress;
  brandToneStatus.className = "muted";

  try {
    const response = await window.authenticatedFetch("/.netlify/functions/align-brand-tone", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ description }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Brand tone alignment failed.");

    offerDescription.value = result.description;
    offerDescription.dispatchEvent(new Event("input", { bubbles: true }));
    brandToneStatus.textContent = copy.alignBrandToneSuccess;
    brandToneStatus.className = "muted success";
    offerDescription.focus();
  } catch (error) {
    console.error("Brand tone alignment unavailable after retry", error);
    brandToneStatus.textContent = copy.brandToneUnavailable;
    brandToneStatus.className = "muted error";
  } finally {
    alignBrandToneButton.disabled = false;
    alignBrandToneButton.textContent = (uiTranslations[languageSelect.value] || uiTranslations.en).alignBrandToneButton;
  }
});

translateContentButton.addEventListener("click", async () => {
  const sourceLanguage = languageSelect.value;
  const targetLanguages = Array.from(translationTargetLanguage.selectedOptions).map((option) => option.value);
  const content = buildContentForTranslation();

  if (!content) {
    setTranslationStatus("Enter the offer content first, then generate a translation draft.");
    return;
  }

  if (!targetLanguages.length) {
    setTranslationStatus("Select at least one language to translate.");
    return;
  }
  translateContentButton.disabled = true;
  translateContentButton.textContent = "Translating...";
  setTranslationStatus(`Generating ${targetLanguages.length} translation${targetLanguages.length === 1 ? "" : "s"}...`);

  try {
    for (const targetLanguage of targetLanguages) {
      const text = await translateText(content, sourceLanguage, targetLanguage);
      persistTranslationPreview(targetLanguage, text);
      renderTranslationPreviews();
    }
    setTranslationStatus(`${targetLanguages.length} optional translation${targetLanguages.length === 1 ? "" : "s"} generated and included automatically.`);
  } catch (error) {
    console.error("Translation unavailable after retry", error);
    const copy = uiTranslations[languageSelect.value] || uiTranslations.en;
    setTranslationStatus(copy.translationUnavailable, "error");
  } finally {
    translateContentButton.disabled = false;
    translateContentButton.textContent = (uiTranslations[languageSelect.value] || uiTranslations.en).previewTranslatedButton;
  }
});

function persistTranslationPreview(targetLanguage, value) {
  const sourceLanguage = languageSelect.value;
  const text = String(value || "").trim();

  if (!text) {
    delete generatedContentTranslations[targetLanguage];
    return;
  }

  generatedContentTranslations[targetLanguage] = {
    language_code: targetLanguage,
    language: contentLanguageLabels[targetLanguage],
    source_language_code: sourceLanguage,
    source_language: contentLanguageLabels[sourceLanguage],
    provider: sourceLanguage === targetLanguage ? "Copied source content" : "Google Gemini",
    saved_at: new Date().toISOString(),
    text,
  };
}

function renderTranslationPreviews() {
  translationPreviewList.innerHTML = "";
  Object.values(generatedContentTranslations).forEach((item) => {
    const panel = document.createElement("div");
    panel.className = "translation-preview-panel";
    const label = document.createElement("label");
    const title = document.createElement("span");
    title.textContent = `${item.language} translation`;
    const textarea = document.createElement("textarea");
    textarea.rows = 8;
    textarea.value = item.text;
    textarea.addEventListener("input", () => persistTranslationPreview(item.language_code, textarea.value));
    label.append(title, textarea);
    const help = document.createElement("p");
    help.className = "muted translation-edit-help";
    help.textContent = "Optional. Edits are saved automatically with the offer.";
    panel.append(label, help);
    translationPreviewList.append(panel);
  });
}

offerType.addEventListener("change", () => {
  offerTypeTiles.forEach((tile) => {
    const selected = tile.dataset.offerType === offerType.value;
    tile.classList.toggle("is-selected", selected);
    tile.setAttribute("aria-pressed", String(selected));
  });
  updateOfferDependentVisibility();
  renderTypeSpecificFields();
  updateCoreOfferGuidance();
  updateBookingMethodFields(true);
});
offerTypeTiles.forEach((tile) => {
  tile.addEventListener("click", () => {
    offerType.value = tile.dataset.offerType;
    offerType.dispatchEvent(new Event("change", { bubbles: true }));
  });
});
form.querySelectorAll('input[name="booking_method"]').forEach((input) => {
  input.addEventListener("change", () => updateBookingMethodFields(true));
});
form.querySelectorAll('input[name="translation_required"]').forEach((input) => {
  input.addEventListener("change", () => {
    const translationRequired = input.value === "yes" && input.checked;
    translationComponent.classList.toggle("is-hidden", !translationRequired);
    if (!translationRequired) {
      generatedContentTranslations = {};
      renderTranslationPreviews();
      setTranslationStatus("");
    }
  });
});
languageSelect.addEventListener("change", () => {
  applyLanguage(languageSelect.value);
  renderTypeSpecificFields();
  updateCoreOfferGuidance();
});

translationTargetLanguage.addEventListener("change", () => setTranslationStatus(""));

function setActiveFormSection(sectionId) {
  const activeIndex = sectionNavigationButtons.findIndex((button) => button.dataset.scrollTarget === sectionId);
  sectionNavigationButtons.forEach((button, index) => {
    button.parentElement.classList.toggle("active", index === activeIndex);
    button.parentElement.classList.toggle("completed", index < activeIndex);
  });
  if (formProgressBar && activeIndex >= 0) {
    const percent = ((activeIndex + 1) / sectionNavigationButtons.length) * 100;
    formProgressBar.style.width = `${percent}%`;
    window.siteHeader?.setProgress(percent);
  }
}

function updateActiveFormSection() {
  const marker = window.innerHeight * 0.32;
  let activeSectionId = sectionNavigationButtons[0]?.dataset.scrollTarget;

  sectionNavigationButtons.forEach((button) => {
    const section = document.getElementById(button.dataset.scrollTarget);
    if (section && section.getBoundingClientRect().top <= marker) {
      activeSectionId = section.id;
    }
  });

  if (activeSectionId) setActiveFormSection(activeSectionId);
}

let sectionScrollFrame = null;
function scheduleActiveFormSectionUpdate() {
  if (sectionScrollFrame !== null) return;
  sectionScrollFrame = window.requestAnimationFrame(() => {
    updateActiveFormSection();
    sectionScrollFrame = null;
  });
}

sectionNavigationButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.scrollTarget);
    if (!target) return;

    setActiveFormSection(target.id);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

window.addEventListener("scroll", scheduleActiveFormSectionUpdate, { passive: true });
window.addEventListener("resize", scheduleActiveFormSectionUpdate);
updateActiveFormSection();

function fieldValue(name) {
  const element = form.elements[name];
  if (!element) return "";
  if (element.type === "checkbox") return element.checked ? element.value : "";
  return element.value.trim();
}

function dynamicFieldValue(name) {
  const element = typeSpecificFields.querySelector(`[name="${name}"]`);
  return element ? element.value.trim() : "";
}

function collectDynamicFields() {
  return Array.from(typeSpecificFields.querySelectorAll("[data-dynamic-field]")).reduce((result, element) => {
    result[element.name] = element.value.trim();
    return result;
  }, {});
}

function readableFieldName(name) {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function labelForDynamicField(name) {
  const language = languageSelect.value || "en";
  const selected = offerType.value;
  const field = (typeFieldGroups[selected] || []).find((item) => item.name === name);
  return dynamicFieldLabels[language]?.[name] || field?.label || readableFieldName(name);
}

function selectedOfferTypeLabel() {
  return offerTypeLabels[fieldValue("offer_type")] || fieldValue("offer_type");
}

function buildContentForTranslation() {
  const dynamicLines = Object.entries(collectDynamicFields())
    .filter(([, value]) => value)
    .map(([key, value]) => [labelForDynamicField(key), value]);

  const contentLines = [
    ["Submission contact", fieldValue("person_in_charge_name")],
    ["Email", fieldValue("email")],
    ["Hotel RID code", fieldValue("hotel_rid_code")],
    ["Hotel name", fieldValue("hotel_name")],
    ["City - Country", fieldValue("city_country")],
    ["Offer type", selectedOfferTypeLabel()],
    ["Offer tile title", fieldValue("offer_tile_title")],
    ["Offer banner title", fieldValue("offer_banner_title")],
    ["Offer subtitle", fieldValue("offer_subtitle")],
    ["Meta description", fieldValue("meta_description")],
    ["Offer description", fieldValue("offer_description")],
    ["Accommodation details", fieldValue("accommodation_details")],
    ...dynamicLines,
    ["Booking method", selectedBookingMethod() === "email_rsvp" ? "Booking via email / RSVP form" : "Booking link"],
    ["Booking link", fieldValue("booking_link")],
    ["Booking email or RSVP form", fieldValue("booking_email")],
    ["Terms and conditions", fieldValue("terms")],
    ["Final acknowledgement", fieldValue("acknowledgement")],
  ].filter(([, value]) => value);

  return contentLines.map(([label, value]) => `${label}:\n${value}`).join("\n\n");
}

async function translateText(text, sourceLanguage, targetLanguage) {
  if (sourceLanguage === targetLanguage) return text;
  const response = await window.authenticatedFetch("/.netlify/functions/translate-content", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text, source_language: sourceLanguage, target_language: targetLanguage }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "The translation service is not available right now.");
  return result.translation;
}

function setTranslationStatus(message, type = "") {
  translationStatus.textContent = message;
  translationStatus.className = `muted ${type}`.trim();
}

function buildSubmissionRecord() {
  const submittedNow = new Date();
  const submissionDate = [submittedNow.getFullYear(), String(submittedNow.getMonth() + 1).padStart(2, "0"), String(submittedNow.getDate()).padStart(2, "0")].join("-");
  const translationRequired = fieldValue("translation_required");
  const requestedTranslationLanguages = translationRequired === "yes"
    ? Array.from(translationTargetLanguage.selectedOptions).map((option) => option.value)
    : [];
  return {
    id: null,
    offer_id: "",
    generated_at: submittedNow.toISOString(),
    submission_date: submissionDate,
    email: fieldValue("email"),
    person_in_charge_name: fieldValue("person_in_charge_name"),
    hotel_rid_code: fieldValue("hotel_rid_code"),
    hotel_name: fieldValue("hotel_name"),
    city_country: fieldValue("city_country"),
    offer_type: offerTypeLabels[fieldValue("offer_type")] || fieldValue("offer_type"),
    offer_tile_title: fieldValue("offer_tile_title"),
    offer_banner_title: fieldValue("offer_banner_title"),
    offer_subtitle: fieldValue("offer_subtitle"),
    offer_description: fieldValue("offer_description"),
    auto_translations: generatedContentTranslations,
    meta_description: fieldValue("meta_description"),
    offer_details: {
      ...collectDynamicFields(),
      accommodation_details: fieldValue("accommodation_details"),
      booking_method: selectedBookingMethod() === "email_rsvp" ? "Booking via email / RSVP form" : "Booking link",
      booking_email: fieldValue("booking_email"),
      translation_required: translationRequired === "yes" ? "Yes" : "No",
      translation_languages: requestedTranslationLanguages.join(", "),
    },
    booking_link: fieldValue("booking_link"),
    terms: fieldValue("terms"),
    acknowledgement: fieldValue("acknowledgement"),
  };
}

function formatDateForDisplay(value) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function buildDateRangeSummary(record) {
  const details = record.offer_details || {};
  const lines = [];

  if (details.booking_start_date || details.booking_end_date) {
    lines.push(`Booking period: ${formatDateForDisplay(details.booking_start_date) || "Not provided"} to ${formatDateForDisplay(details.booking_end_date) || "Not provided"}`);
  }
  if (details.stay_start_date || details.stay_end_date) {
    lines.push(`Stay period: ${formatDateForDisplay(details.stay_start_date) || "Not provided"} to ${formatDateForDisplay(details.stay_end_date) || "Not provided"}`);
  }
  if (details.offer_validity_start_date || details.offer_validity_end_date) {
    lines.push(`Offer validity: ${formatDateForDisplay(details.offer_validity_start_date) || "Not provided"} to ${formatDateForDisplay(details.offer_validity_end_date) || "Not provided"}`);
  }
  if (details.event_date || details.event_time) {
    lines.push(`Event: ${formatDateForDisplay(details.event_date) || "Not provided"} ${details.event_time || ""}`.trim());
  }

  return lines.join("\n") || "Not provided";
}

async function fileToBase64(file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    const timeout = window.setTimeout(() => {
      reader.abort();
      reject(new Error(`Preparing ${file.name} took too long. Please use a smaller image and try again.`));
    }, 8000);
    reader.addEventListener("load", () => {
      window.clearTimeout(timeout);
      resolve(reader.result);
    }, { once: true });
    reader.addEventListener("error", () => {
      window.clearTimeout(timeout);
      reject(reader.error || new Error(`Could not read ${file.name}.`));
    }, { once: true });
    reader.readAsDataURL(file);
  });

  return String(dataUrl).split(",")[1] || "";
}

async function buildSubmissionAssets() {
  const uploadMap = {
    rate_screenshot: form.elements.rate_screenshot?.files?.[0] || null,
    booking_screenshot: form.elements.booking_screenshot?.files?.[0] || null,
    banner_image: resizedBannerFile,
    listing_tile_image: resizedListingTileFile,
    social_image: resizedSocialFile,
    menu_pdf: form.elements.menu_pdf?.files?.[0] || null,
  };
  return Promise.all(Object.entries(uploadMap).filter(([, file]) => Boolean(file)).map(async ([field, file]) => {
    const processedFile = ["rate_screenshot", "booking_screenshot"].includes(field)
      ? await resizeImage(file, 1600, 1600, false)
      : file;
    return {
      field,
      file_name: processedFile.name,
      file_type: processedFile.type || "image/jpeg",
      file_size_kb: Math.round(processedFile.size / 1024),
      data_base64: await fileToBase64(processedFile),
    };
  }));
}

async function postSubmission(payload) {
  const response = await window.authenticatedFetch("/.netlify/functions/submit-offer", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload),
  });
  const responseText = await response.text();
  let result = {};
  try {
    result = JSON.parse(responseText || "{}");
  } catch (error) {
    result = {};
  }
  if (!response.ok) {
    if (response.status === 413) {
      throw new Error(result.error || "A file is too large. PDFs must be less than 5 MB.");
    }
    const diagnostic = [result.host && `Host: ${result.host}`, result.reason && `Reason: ${result.reason}`]
      .filter(Boolean)
      .join(" · ");
    throw new Error(
      [result.error || `Submission service failed (${response.status}). ${responseText.slice(0, 180)}`.trim(), diagnostic]
        .filter(Boolean)
        .join(" ")
    );
  }
  return result;
}

function updateSubmissionProgress(text, percent) {
  submissionProgress.classList.remove("is-hidden");
  submissionProgressText.textContent = text;
  submissionProgressBar.style.width = `${percent}%`;
}

async function submitOfferToDrive(record, turnstileToken = "") {
  updateSubmissionProgress("Creating your secure submission folder…", 8);
  const created = await postSubmission({ ...record, turnstile_token: turnstileToken });
  const assets = await buildSubmissionAssets();
  const uploadedAssets = [];
  for (let index = 0; index < assets.length; index += 1) {
    const asset = assets[index];
    updateSubmissionProgress(`Saving file ${index + 1} of ${assets.length}…`, 15 + Math.round(((index + 1) / Math.max(assets.length, 1)) * 65));
    const folderId = asset.file_type === "application/pdf" ? created.storage.documentsFolderId : created.storage.imagesFolderId;
    const result = await postSubmission({ action: "upload_asset", folder_id: folderId, asset });
    uploadedAssets.push(result.asset);
  }
  updateSubmissionProgress("Finalising your offer…", 88);
  const result = await postSubmission({ action: "finalize_submission", offer_id: created.offer_id, folder_id: created.storage.folderId, record, assets: uploadedAssets });
  if (result.asana?.ok && result.asana.gid) {
    updateSubmissionProgress("Adding images to the Asana task…", 94);
    result.asana.attachments = await attachImagesToAsana(result.asana.gid, assets);
  }
  updateSubmissionProgress("Offer successfully submitted.", 100);
  return result;
}

async function attachImageToAsana(taskGid, asset) {
  const controller = new AbortController();
  let timeout;
  const deadline = new Promise((resolve, reject) => {
    timeout = window.setTimeout(() => {
      controller.abort();
      reject(new Error("Image attachment timed out."));
    }, 12000);
  });
  try {
    const request = window.authenticatedFetch("/.netlify/functions/submit-offer", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "attach_image", task_gid: taskGid, asset }),
      signal: controller.signal,
    });
    const response = await Promise.race([request, deadline]);
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || `Image attachment failed (${response.status}).`);
    return result.attachment;
  } finally {
    window.clearTimeout(timeout);
  }
}

async function attachImagesToAsana(taskGid, assets) {
  const uploads = assets.filter((asset) => String(asset.file_type || "").startsWith("image/"));
  const results = await Promise.all(uploads.map(async (asset) => {
    try {
      return await attachImageToAsana(taskGid, asset);
    } catch (error) {
      console.error("Could not attach image to Asana", asset.file_name, error);
      return { file_name: asset.file_name, ok: false, error: error.message };
    }
  }));
  return {
    attempted: results.length,
    attached: results.filter((result) => result?.ok).length,
    failed: results.filter((result) => !result?.ok).length,
    results,
  };
}

async function waitForTurnstile() {
  const startedAt = Date.now();
  while (!window.turnstile) {
    if (Date.now() - startedAt > 10000) {
      throw new Error("Turnstile did not load.");
    }
    await new Promise((resolve) => window.setTimeout(resolve, 50));
  }
  return window.turnstile;
}

async function requestTurnstileToken() {
  const turnstile = await waitForTurnstile();
  if (activeTurnstileWidgetId !== null) {
    turnstile.remove(activeTurnstileWidgetId);
    activeTurnstileWidgetId = null;
  }
  turnstileContainer.replaceChildren();

  return new Promise((resolve, reject) => {
    let settled = false;
    let verificationTimeout;
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(verificationTimeout);
      callback(value);
    };
    const fail = () => {
      if (activeTurnstileWidgetId !== null) {
        turnstile.remove(activeTurnstileWidgetId);
        activeTurnstileWidgetId = null;
      }
      finish(reject, new Error("Turnstile verification failed."));
    };
    verificationTimeout = window.setTimeout(fail, 15000);

    activeTurnstileWidgetId = turnstile.render(turnstileContainer, {
      sitekey: TURNSTILE_SITE_KEY,
      action: "submit_offer",
      execution: "execute",
      appearance: "always",
      size: "flexible",
      callback: (token) => finish(resolve, token),
      "error-callback": fail,
      "expired-callback": fail,
      "timeout-callback": fail,
    });
    turnstile.execute(activeTurnstileWidgetId);
  });
}

function clearTurnstileWidget() {
  if (activeTurnstileWidgetId !== null && window.turnstile) {
    window.turnstile.remove(activeTurnstileWidgetId);
    activeTurnstileWidgetId = null;
  }
  turnstileContainer.replaceChildren();
}

async function validateBookingLink(bookingLink, turnstileToken) {
  const response = await window.authenticatedFetch("/.netlify/functions/validate-booking-link", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ booking_link: bookingLink, turnstile_token: turnstileToken }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "The booking link could not be validated.");
  return result;
}

function showBookingLinkNotLive(bookingLink, copy) {
  bookingPreview.href = bookingLink;
  bookingPreview.textContent = bookingLink;
  bookingDialogTitle.textContent = copy.bookingLinkNotLiveTitle;
  bookingDialogText.textContent = copy.bookingLinkNotLiveText;
  bookingDialog.dataset.status = "warning";
  bookingDialog.querySelector(".booking-dialog-continue").hidden = true;
  return new Promise((resolve) => {
    bookingDialog.addEventListener("close", () => resolve(false), { once: true });
    bookingDialog.showModal();
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage("");

  if (!form.reportValidity() || !validateDates() || !validateRequiredDetails() || !validateRequiredUploads()) {
    if (!formMessage.textContent) {
      setMessage("Please fix the highlighted fields before submitting the offer.", "error");
    }
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  const copy = uiTranslations[languageSelect.value] || uiTranslations.en;
  submitButton.textContent = copy.turnstileVerifying;

  try {
    const record = buildSubmissionRecord();
    let turnstileToken = await requestTurnstileToken();
    if (selectedBookingMethod() === "booking_link") {
      submitButton.textContent = copy.bookingLinkChecking;
      const validation = await validateBookingLink(record.booking_link, turnstileToken);
      if (!validation.live) {
        await showBookingLinkNotLive(record.booking_link, copy);
        return;
      }
      submitButton.textContent = copy.turnstileVerifying;
      turnstileToken = await requestTurnstileToken();
    }
    submitButton.textContent = "Creating ZIP and saving to Google Drive...";
    const result = await submitOfferToDrive(record, turnstileToken);
    const confirmation = {
      offer_id: result.offer_id,
      hotel_name: record.hotel_name || record.offer_details.partner_name || "Not provided",
      hotel_rid_code: record.hotel_rid_code || "Not provided",
      city_country: record.city_country || "",
      offer_tile_title: record.offer_tile_title || "Not provided",
      offer_type: record.offer_type || "Not provided",
      email: record.email || "Not provided",
      booking_link: record.booking_link || "Not provided",
      booking_details: record.booking_link || record.offer_details.booking_email || "Not provided",
      date_range: buildDateRangeSummary(record),
      submitted_at: new Date().toISOString(),
      drive: result.drive,
      asana: result.asana,
    };
    sessionStorage.setItem("offerSubmissionConfirmation", JSON.stringify(confirmation));
    window.location.assign("/confirmation.html");
  } catch (error) {
    submissionProgress.classList.add("is-hidden");
    const isTurnstileError = /turnstile/i.test(error.message || "");
    setMessage(isTurnstileError ? copy.turnstileUnavailable : (error.message || "The submission could not be completed."), "error");
  } finally {
    clearTurnstileWidget();
    submitButton.disabled = false;
    submitButton.textContent = copy.submitButton;
  }
});

form.addEventListener("reset", () => {
  setTimeout(() => {
    resizedBannerFile = null;
    resizedListingTileFile = null;
    resizedSocialFile = null;
    masterBannerPreview.style.display = "none";
    masterListingPreview.style.display = "none";
    masterSocialPreview.style.display = "none";
    generatedImagePreviews.classList.add("is-hidden");
    bannerPreview.style.display = "none";
    listingTilePreview.style.display = "none";
    socialPreview.style.display = "none";
    document.querySelectorAll(".upload-zone.has-preview").forEach((zone) => zone.classList.remove("has-preview"));
    document.querySelectorAll(".file-card.has-file").forEach((card) => card.classList.remove("has-file"));
    masterImageMessage.textContent = "";
    bannerMessage.textContent = "";
    listingTileMessage.textContent = "";
    socialMessage.textContent = "";
    document.querySelectorAll('input[type="file"]').forEach((input) => updateFileName(input));
    generatedContentTranslations = {};
    translationComponent.classList.add("is-hidden");
    form.querySelector('button[type="submit"]').textContent = (uiTranslations[languageSelect.value] || uiTranslations.en).submitButton;
    renderTranslationPreviews();
    setTranslationStatus("");
    dateMessage.textContent = "";
    renderTypeSpecificFields();
    offerType.dispatchEvent(new Event("change", { bubbles: true }));
    updateBookingMethodFields();
    setMessage("");
  });
});

const savedLanguage = localStorage.getItem("explorer-offer-language") || "en";
languageSelect.value = savedLanguage;
applyLanguage(savedLanguage);
updateOfferDependentVisibility();
renderTypeSpecificFields();
updateCoreOfferGuidance();
updateBookingMethodFields();
const savedHotelPrefill = sessionStorage.getItem("offerHotelPrefill");
if (savedHotelPrefill) {
  try {
    const hotelPrefill = JSON.parse(savedHotelPrefill);
    ["hotel_name", "hotel_rid_code", "city_country"].forEach((field) => {
      if (form.elements[field] && hotelPrefill[field]) form.elements[field].value = hotelPrefill[field];
    });
  } finally {
    sessionStorage.removeItem("offerHotelPrefill");
  }
}

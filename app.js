const form = document.querySelector("#offerForm");
const offerStartSection = document.querySelector("#offerStartSection");
const offerWorkspace = document.querySelector("#offerWorkspace");
const confirmationScreen = document.querySelector("#confirmationScreen");
const startActionButtons = Array.from(document.querySelectorAll("[data-start-action]"));
const retrievePanel = document.querySelector("#retrievePanel");
const retrieveModeLabel = document.querySelector("#retrieveModeLabel");
const retrieveTitle = document.querySelector("#retrieveTitle");
const retrieveMessage = document.querySelector("#retrieveMessage");
const retrieveResults = document.querySelector("#retrieveResults");
const searchOfferButton = document.querySelector("#searchOfferButton");
const backToStartButton = document.querySelector("#backToStartButton");
const editModeNotice = document.querySelector("#editModeNotice");
const confirmationNewOfferButton = document.querySelector("#confirmationNewOfferButton");
const confirmationBackButton = document.querySelector("#confirmationBackButton");
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
const languageSelect = document.querySelector("#languageSelect");
const heroText = document.querySelector("[data-i18n='heroText']");
const sectionNavigationButtons = Array.from(document.querySelectorAll("[data-scroll-target]"));
const translationSourceDisplay = document.querySelector("#translationSourceDisplay");
const translationTargetLanguage = document.querySelector("#translationTargetLanguage");
const translateContentButton = document.querySelector("#translateContentButton");
const saveTranslationPreviewButton = document.querySelector("#saveTranslationPreviewButton");
const translationPreview = document.querySelector("#translationPreview");
const translationStatus = document.querySelector("#translationStatus");
const confirmationOfferId = document.querySelector("#confirmationOfferId");
const confirmationHotelName = document.querySelector("#confirmationHotelName");
const confirmationHotelCode = document.querySelector("#confirmationHotelCode");
const confirmationOfferTitle = document.querySelector("#confirmationOfferTitle");
const confirmationEmail = document.querySelector("#confirmationEmail");
const confirmationBookingLink = document.querySelector("#confirmationBookingLink");
const confirmationDateRange = document.querySelector("#confirmationDateRange");

let resizedBannerFile = null;
let resizedListingTileFile = null;
let resizedSocialFile = null;
let generatedContentTranslations = {};
let retrieveMode = "view";
let editingOffer = null;

const maxImageUploadSize = 200 * 1024 * 1024;

const contentLanguageLabels = {
  en: "English",
  th: "Thai",
  vi: "Vietnamese",
  id: "Bahasa Indonesia",
  ja: "Japanese",
};

const localizedLanguageLabels = {
  en: { en: "English", th: "Thai", vi: "Vietnamese", id: "Bahasa Indonesia", ja: "Japanese" },
  th: { en: "อังกฤษ", th: "ไทย", vi: "เวียดนาม", id: "บาฮาซาอินโดนีเซีย", ja: "ญี่ปุ่น" },
  vi: { en: "Tiếng Anh", th: "Tiếng Thái", vi: "Tiếng Việt", id: "Bahasa Indonesia", ja: "Tiếng Nhật" },
  id: { en: "Inggris", th: "Thailand", vi: "Vietnam", id: "Bahasa Indonesia", ja: "Jepang" },
  ja: { en: "英語", th: "タイ語", vi: "ベトナム語", id: "インドネシア語", ja: "日本語" },
};

function updateTranslationTargetOptions(sourceLanguage) {
  const currentTarget = translationTargetLanguage.value;
  const pageLanguage = languageSelect.value || "en";
  const labels = localizedLanguageLabels[pageLanguage] || localizedLanguageLabels.en;
  translationTargetLanguage.innerHTML = "";

  Object.keys(contentLanguageLabels).forEach((code) => {
    if (code === sourceLanguage) return;
    const option = document.createElement("option");
    option.value = code;
    option.textContent = labels[code] || contentLanguageLabels[code];
    translationTargetLanguage.append(option);
  });

  if (currentTarget && currentTarget !== sourceLanguage) {
    translationTargetLanguage.value = currentTarget;
  }
}

const uiTranslations = {
  en: {
    marketLabel: "Pacific marketing platform",
    languageLabel: "Language",
    heroTitle: "ALL Accor+ Explorer Offers Portal",
    heroText: "Create campaign-ready hotel, dining, event, and partner offers for Explorer.",
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
    confirmationText: "Use this Offer ID to retrieve, view, or edit the offer later.",
    submissionDateRangeLabel: "Submission date range",
    createAnotherButton: "Create another offer",
    backToOptionsButton: "Back to options",
    sideEyebrow: "Explorer partners",
    sideTitle: "Offer submission",
    stepHotel: "Hotel details",
    stepOffer: "Offer and dates",
    stepProof: "Proof and forms",
    stepImages: "Images and review",
    stepTranslations: "Translations",
    modeTitle: "No-backend mode",
    modeText: "Submissions are packaged in the browser as a ZIP file. Nothing is stored on this page.",
    formEyebrow: "Stay and dining offers",
    formTitle: "Submit a complete offer in one pass",
    statusPill: "Static package",
    hotelDetails: "Hotel details",
    coreContent: "Core offer content",
    datesBooking: "Dates and booking",
    proofForms: "Proof and required forms",
    imagesTitle: "Images",
    finalAcknowledgement: "Final acknowledgement",
    clearButton: "Clear",
    submitButton: "Create Package and Submit",
    dialogTitle: "Double-check the booking link",
    dialogText: "Hotels will send guests to this exact URL. Please confirm it opens the correct booking page for this offer.",
    goBackButton: "Go back",
    confirmButton: "Confirm and create package",
  },
  th: {
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
    confirmationText: "ใช้ Offer ID นี้เพื่อเรียกดู ดู หรือแก้ไขข้อเสนอในภายหลัง",
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
    modeTitle: "โหมดไม่มีแบ็กเอนด์",
    modeText: "ข้อมูลจะถูกจัดเป็นไฟล์ ZIP ในเบราว์เซอร์ และไม่มีการจัดเก็บบนหน้านี้",
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
    submitButton: "Create Package and Submit",
    dialogTitle: "ตรวจสอบลิงก์จองอีกครั้ง",
    dialogText: "แขกจะถูกส่งไปยัง URL นี้ โปรดยืนยันว่าเป็นหน้าจองที่ถูกต้องสำหรับข้อเสนอนี้",
    goBackButton: "กลับไปแก้ไข",
    confirmButton: "ยืนยันและสร้างแพ็กเกจ",
  },
  vi: {
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
    confirmationText: "Dùng Offer ID này để truy xuất, xem hoặc chỉnh sửa ưu đãi sau.",
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
    modeTitle: "Chế độ không backend",
    modeText: "Bài gửi được đóng gói thành tệp ZIP trong trình duyệt. Trang này không lưu trữ dữ liệu.",
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
    submitButton: "Create Package and Submit",
    dialogTitle: "Kiểm tra lại liên kết đặt chỗ",
    dialogText: "Khách sẽ được chuyển đến chính URL này. Vui lòng xác nhận đây là trang đặt chỗ đúng cho ưu đãi.",
    goBackButton: "Quay lại",
    confirmButton: "Xác nhận và tạo gói",
  },
  id: {
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
    confirmationText: "Gunakan Offer ID ini untuk mengambil, melihat, atau mengedit penawaran nanti.",
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
    modeTitle: "Mode tanpa backend",
    modeText: "Pengiriman dikemas di browser sebagai file ZIP. Tidak ada data yang disimpan di halaman ini.",
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
    submitButton: "Create Package and Submit",
    dialogTitle: "Periksa kembali tautan pemesanan",
    dialogText: "Tamu akan diarahkan ke URL ini. Pastikan tautan membuka halaman pemesanan yang benar untuk penawaran ini.",
    goBackButton: "Kembali",
    confirmButton: "Konfirmasi dan buat paket",
  },
  ja: {
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
    confirmationText: "このOffer IDを使って、後でオファーの取得、表示、編集ができます。",
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
    modeTitle: "バックエンドなしモード",
    modeText: "提出内容はブラウザ内でZIPファイル化されます。このページには保存されません。",
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
    submitButton: "Create Package and Submit",
    dialogTitle: "予約リンクを再確認",
    dialogText: "ゲストはこのURLに移動します。このオファーの正しい予約ページであることを確認してください。",
    goBackButton: "戻る",
    confirmButton: "確認してパッケージ作成",
  },
};

const formCopyTranslations = {
  en: {
    emailLabel: "Email",
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
    termsLabel: "Terms and conditions",
    rateScreenshotLabel: "Rate screenshot",
    rateScreenshotHelp: "Please show the loaded rate available at all.com. Max 1 MB image.",
    menuPdfLabel: "Dining / event menu PDF",
    menuPdfHelp: "Please merge PDFs into one file. Max 10 MB.",
    bookingScreenshotLabel: "Final booking page screenshot",
    bookingScreenshotHelp: "For dining / event offers with a booking URL. Max 1 MB image.",
    departmentConfirmationText: "All relevant hotel departments can confirm the rate loading is set up correctly for members to book.",
    masterImageTitle: "Use one image for all placements",
    masterImageHelp: "Upload one high-quality image and the app will resize it into banner, listing tile, and social versions.",
    bannerImageTitle: "Banner image",
    bannerImageHelp: "Upload any image size. The app will auto-resize it to 2048 x 1366px JPG. Source file must not exceed 200 MB. No text and no logo.",
    listingTileImageTitle: "Listing tile image",
    listingTileImageHelp: "Upload any image size. The app will auto-resize it to 400 x 250px JPG. Source file must not exceed 200 MB.",
    socialImageTitle: "Social image",
    socialImageHelp: "Upload any image size. The app will auto-resize it to 1080 x 1080px JPG. Source file must not exceed 200 MB.",
    translationPreviewTitle: "Preview translated content",
    translationSourcePrefix: "The offer content entered above is treated as",
    translationSourceSuffix: "based on the language selected in the top-right corner.",
    previewInLabel: "Preview in",
    previewTranslatedButton: "Preview translated content",
    savePreviewButton: "Save preview to package",
    translatedPreviewLabel: "Translated preview",
    acknowledgementText: "I understand incomplete or inaccurate submissions may delay promotion, and assets are due 6 weeks in advance.",
  },
  th: {
    formTitle: "ส่งข้อเสนอที่ครบถ้วนในครั้งเดียว",
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
    termsLabel: "ข้อกำหนดและเงื่อนไข",
    rateScreenshotLabel: "ภาพหน้าจอราคา",
    rateScreenshotHelp: "โปรดแสดงราคาที่โหลดไว้บน all.com ขนาดภาพสูงสุด 1 MB",
    menuPdfLabel: "เมนู PDF สำหรับห้องอาหาร / อีเวนต์",
    menuPdfHelp: "โปรดรวมไฟล์ PDF เป็นไฟล์เดียว ขนาดสูงสุด 10 MB",
    bookingScreenshotLabel: "ภาพหน้าจอหน้าจองสุดท้าย",
    bookingScreenshotHelp: "สำหรับข้อเสนอห้องอาหาร / อีเวนต์ที่มี URL จอง ขนาดภาพสูงสุด 1 MB",
    departmentConfirmationText: "ทุกแผนกที่เกี่ยวข้องของโรงแรมยืนยันได้ว่าการโหลดราคาได้รับการตั้งค่าอย่างถูกต้องเพื่อให้สมาชิกจองได้",
    masterImageTitle: "ใช้ภาพเดียวสำหรับทุกตำแหน่ง",
    masterImageHelp: "อัปโหลดภาพคุณภาพสูงหนึ่งภาพ แล้วระบบจะปรับขนาดเป็นแบนเนอร์ ไทล์รายการ และภาพโซเชียล",
    bannerImageTitle: "ภาพแบนเนอร์",
    bannerImageHelp: "อัปโหลดภาพขนาดใดก็ได้ ระบบจะปรับเป็น JPG 2048 x 1366px ไฟล์ต้นฉบับต้องไม่เกิน 200 MB ไม่มีข้อความและโลโก้",
    listingTileImageTitle: "ภาพไทล์รายการ",
    listingTileImageHelp: "อัปโหลดภาพขนาดใดก็ได้ ระบบจะปรับเป็น JPG 400 x 250px ไฟล์ต้นฉบับต้องไม่เกิน 200 MB",
    socialImageTitle: "ภาพโซเชียล",
    socialImageHelp: "อัปโหลดภาพขนาดใดก็ได้ ระบบจะปรับเป็น JPG 1080 x 1080px ไฟล์ต้นฉบับต้องไม่เกิน 200 MB",
    translationPreviewTitle: "ดูตัวอย่างเนื้อหาที่แปล",
    translationSourcePrefix: "เนื้อหาข้อเสนอที่กรอกด้านบนจะถือว่าเป็นภาษา",
    translationSourceSuffix: "ตามภาษาที่เลือกที่มุมขวาบน",
    previewInLabel: "ดูตัวอย่างเป็น",
    previewTranslatedButton: "ดูตัวอย่างคำแปล",
    savePreviewButton: "บันทึกตัวอย่างลงแพ็กเกจ",
    translatedPreviewLabel: "ตัวอย่างคำแปล",
    acknowledgementText: "ฉันเข้าใจว่าการส่งข้อมูลที่ไม่ครบถ้วนหรือไม่ถูกต้องอาจทำให้การโปรโมตล่าช้า และต้องส่งไฟล์ล่วงหน้า 6 สัปดาห์",
  },
  vi: {
    formTitle: "Gửi một ưu đãi hoàn chỉnh trong một lần",
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
    termsLabel: "Điều khoản và điều kiện",
    rateScreenshotLabel: "Ảnh chụp màn hình giá",
    rateScreenshotHelp: "Vui lòng hiển thị mức giá đã được tải trên all.com. Ảnh tối đa 1 MB.",
    menuPdfLabel: "PDF menu ẩm thực / sự kiện",
    menuPdfHelp: "Vui lòng gộp các PDF thành một tệp. Tối đa 10 MB.",
    bookingScreenshotLabel: "Ảnh chụp trang đặt chỗ cuối cùng",
    bookingScreenshotHelp: "Dành cho ưu đãi ẩm thực / sự kiện có URL đặt chỗ. Ảnh tối đa 1 MB.",
    departmentConfirmationText: "Tất cả bộ phận liên quan của khách sạn xác nhận việc tải giá đã được thiết lập đúng để thành viên đặt chỗ.",
    masterImageTitle: "Dùng một ảnh cho mọi vị trí",
    masterImageHelp: "Tải lên một ảnh chất lượng cao và ứng dụng sẽ đổi kích thước thành banner, ô danh sách và ảnh mạng xã hội.",
    bannerImageTitle: "Ảnh banner",
    bannerImageHelp: "Tải lên ảnh kích thước bất kỳ. Ứng dụng sẽ tự đổi thành JPG 2048 x 1366px. Tệp gốc không quá 200 MB. Không có chữ và logo.",
    listingTileImageTitle: "Ảnh ô danh sách",
    listingTileImageHelp: "Tải lên ảnh kích thước bất kỳ. Ứng dụng sẽ tự đổi thành JPG 400 x 250px. Tệp gốc không quá 200 MB.",
    socialImageTitle: "Ảnh mạng xã hội",
    socialImageHelp: "Tải lên ảnh kích thước bất kỳ. Ứng dụng sẽ tự đổi thành JPG 1080 x 1080px. Tệp gốc không quá 200 MB.",
    translationPreviewTitle: "Xem trước nội dung đã dịch",
    translationSourcePrefix: "Nội dung ưu đãi bên trên được xem là",
    translationSourceSuffix: "dựa trên ngôn ngữ đã chọn ở góc trên bên phải.",
    previewInLabel: "Xem trước bằng",
    previewTranslatedButton: "Xem trước bản dịch",
    savePreviewButton: "Lưu bản xem trước vào gói",
    translatedPreviewLabel: "Bản dịch xem trước",
    acknowledgementText: "Tôi hiểu rằng nội dung gửi không đầy đủ hoặc không chính xác có thể làm chậm chương trình khuyến mãi, và tài sản cần gửi trước 6 tuần.",
  },
  id: {
    formTitle: "Kirim penawaran lengkap dalam satu langkah",
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
    termsLabel: "Syarat dan ketentuan",
    rateScreenshotLabel: "Screenshot tarif",
    rateScreenshotHelp: "Tampilkan tarif yang sudah dimuat di all.com. Gambar maks. 1 MB.",
    menuPdfLabel: "PDF menu dining / event",
    menuPdfHelp: "Gabungkan PDF menjadi satu file. Maks. 10 MB.",
    bookingScreenshotLabel: "Screenshot halaman pemesanan akhir",
    bookingScreenshotHelp: "Untuk penawaran dining / event dengan URL pemesanan. Gambar maks. 1 MB.",
    departmentConfirmationText: "Semua departemen hotel terkait dapat mengonfirmasi bahwa pemuatan tarif sudah benar agar anggota dapat memesan.",
    masterImageTitle: "Gunakan satu gambar untuk semua penempatan",
    masterImageHelp: "Unggah satu gambar berkualitas tinggi dan aplikasi akan mengubah ukurannya menjadi banner, listing tile, dan sosial.",
    bannerImageTitle: "Gambar banner",
    bannerImageHelp: "Unggah gambar ukuran apa pun. Aplikasi akan mengubahnya menjadi JPG 2048 x 1366px. File sumber maks. 200 MB. Tanpa teks dan logo.",
    listingTileImageTitle: "Gambar listing tile",
    listingTileImageHelp: "Unggah gambar ukuran apa pun. Aplikasi akan mengubahnya menjadi JPG 400 x 250px. File sumber maks. 200 MB.",
    socialImageTitle: "Gambar sosial",
    socialImageHelp: "Unggah gambar ukuran apa pun. Aplikasi akan mengubahnya menjadi JPG 1080 x 1080px. File sumber maks. 200 MB.",
    translationPreviewTitle: "Pratinjau konten terjemahan",
    translationSourcePrefix: "Konten penawaran yang diisi di atas dianggap sebagai",
    translationSourceSuffix: "berdasarkan bahasa yang dipilih di kanan atas.",
    previewInLabel: "Pratinjau dalam",
    previewTranslatedButton: "Pratinjau terjemahan",
    savePreviewButton: "Simpan pratinjau ke paket",
    translatedPreviewLabel: "Pratinjau terjemahan",
    acknowledgementText: "Saya memahami bahwa pengiriman yang tidak lengkap atau tidak akurat dapat menunda promosi, dan aset harus dikirim 6 minggu sebelumnya.",
  },
  ja: {
    formTitle: "完全なオファーを一度で送信",
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
    termsLabel: "利用規約",
    rateScreenshotLabel: "料金スクリーンショット",
    rateScreenshotHelp: "all.comで読み込まれた料金を表示してください。画像は最大1 MBです。",
    menuPdfLabel: "ダイニング / イベント メニューPDF",
    menuPdfHelp: "PDFは1つのファイルにまとめてください。最大10 MBです。",
    bookingScreenshotLabel: "最終予約ページのスクリーンショット",
    bookingScreenshotHelp: "予約URLがあるダイニング / イベントオファー用です。画像は最大1 MBです。",
    departmentConfirmationText: "関連するホテル部門は、会員が予約できるよう料金ロードが正しく設定されていることを確認できます。",
    masterImageTitle: "1枚の画像をすべての配置に使用",
    masterImageHelp: "高品質な画像を1枚アップロードすると、バナー、一覧タイル、ソーシャル用にリサイズされます。",
    bannerImageTitle: "バナー画像",
    bannerImageHelp: "任意サイズの画像をアップロードできます。アプリが2048 x 1366px JPGに自動リサイズします。元ファイルは200 MB以下。文字とロゴは不可。",
    listingTileImageTitle: "一覧タイル画像",
    listingTileImageHelp: "任意サイズの画像をアップロードできます。アプリが400 x 250px JPGに自動リサイズします。元ファイルは200 MB以下。",
    socialImageTitle: "ソーシャル画像",
    socialImageHelp: "任意サイズの画像をアップロードできます。アプリが1080 x 1080px JPGに自動リサイズします。元ファイルは200 MB以下。",
    translationPreviewTitle: "翻訳コンテンツをプレビュー",
    translationSourcePrefix: "上記に入力されたオファー内容は",
    translationSourceSuffix: "右上で選択された言語として扱われます。",
    previewInLabel: "プレビュー言語",
    previewTranslatedButton: "翻訳をプレビュー",
    savePreviewButton: "プレビューをパッケージに保存",
    translatedPreviewLabel: "翻訳プレビュー",
    acknowledgementText: "不完全または不正確な提出はプロモーションの遅延につながる可能性があり、素材は6週間前までに提出する必要があることを理解しています。",
  },
};

Object.entries(formCopyTranslations).forEach(([language, copy]) => {
  Object.assign(uiTranslations[language], copy);
});

function applyLanguage(language) {
  const copy = uiTranslations[language] || uiTranslations.en;
  const labels = localizedLanguageLabels[language] || localizedLanguageLabels.en;
  document.documentElement.lang = language;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (Object.hasOwn(copy, key)) element.textContent = copy[key];
  });
  if (heroText) heroText.textContent = copy.heroText || uiTranslations.en.heroText;
  translationSourceDisplay.textContent = labels[language] || contentLanguageLabels[language] || contentLanguageLabels.en;
  if (!retrievePanel.hidden) {
    retrieveModeLabel.textContent = retrieveMode === "edit" ? copy.retrieveEditEyebrow : copy.retrieveViewEyebrow;
  }
  if (editingOffer) {
    editModeNotice.textContent = copy.retrieveEditNotice.replace("{offerId}", offerIdForRecord(editingOffer));
    form.querySelector('button[type="submit"]').textContent = copy.updateSubmitButton;
  }
  updateTranslationTargetOptions(language);
  localStorage.setItem("explorer-offer-language", language);
}

const offerTypeLabels = {
  red_hot_rooms: "Red Hot Rooms",
  more_escapes: "More Escapes",
  hotel_stay: "Hotel stay",
  dining: "Dining",
  events: "Events",
  partners: "Partners",
};

const offerTypeGuidance = {
  red_hot_rooms: "Room-only, limited-time member rate. The manual process references DSO / Tarskey DSO and fixed prepaid, non-refundable terms.",
  more_escapes: "Two or more night package with inclusions such as dining, wellness, transfers, parking, or third-party experiences.",
  hotel_stay: "Member-exclusive hotel offer, generally at least 10% off public rate, with one offer loaded for any given dates.",
  dining: "Restaurant or bar offer available to members, usually bookable through Table Plus / ResDiary or via email.",
  events: "Member event or hotel event, with event dates, RSVP timing, venue, pricing, and optional accommodation details.",
  partners: "Partner offer available to Accor Plus members, usually not attached to a hotel location.",
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
    { name: "package_details", label: "Package details", type: "textarea", placeholder: "List inclusions for the package, minimum stay, meal/spa/transfer benefits, and exclusions.", required: true },
    { name: "booking_start_date", label: "Booking start date", type: "date", required: true },
    { name: "booking_end_date", label: "Booking end date", type: "date", required: true },
    { name: "stay_start_date", label: "Stay start date", type: "date", required: true },
    { name: "stay_end_date", label: "Stay end date", type: "date", required: true },
    { name: "member_benefits", label: "Member benefits", placeholder: "Example: Accor Plus member exclusive package", required: true },
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
    { name: "price", label: "Price", placeholder: "Example: SGD 68++ per person" },
    { name: "offer_validity_start_date", label: "Offer validity start date", type: "date", required: true },
    { name: "offer_validity_end_date", label: "Offer validity end date", type: "date", required: true },
    { name: "venue", label: "Venue", placeholder: "Example: The Cliff at Sofitel Singapore Sentosa Resort and Spa", required: true },
    { name: "member_benefits", label: "Member benefits", type: "textarea", placeholder: "Describe the member dining benefit, discount, inclusions, or early bird offer.", required: true },
    { name: "booking_email", label: "Booking via email", placeholder: "Example: recipient and subject, or NIL" },
  ],
  events: [
    { name: "accommodation_details", label: "Accommodation details", type: "textarea", placeholder: "Optional stay package or room-night details connected to the event." },
    { name: "public_price", label: "Public price", placeholder: "Example: N/A or AUD 169 per person" },
    { name: "event_date", label: "Event date", type: "date", required: true },
    { name: "event_time", label: "Event time", type: "time", required: true },
    { name: "venue", label: "Venue", placeholder: "Example: Room81 at Sofitel Gold Coast Broadbeach", required: true },
    { name: "member_price", label: "Member price", placeholder: "Example: AUD 139 per person", required: true },
    { name: "booking_email", label: "Booking via email / RSVP form", placeholder: "Example: recipient and subject, RSVP form URL, or NIL" },
  ],
  partners: [
    { name: "partner_name", label: "Partner name", placeholder: "Example: Europcar", required: true },
    { name: "offer_validity_start_date", label: "Offer validity start date", type: "date", required: true },
    { name: "offer_validity_end_date", label: "Offer validity end date", type: "date", required: true },
    { name: "member_benefits", label: "Member benefits", type: "textarea", placeholder: "Describe the exclusive partner benefit for Accor Plus members.", required: true },
    { name: "booking_email", label: "Booking via email / RSVP form", placeholder: "Example: recipient and subject, form URL, or NIL" },
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
};

const helperNoteTranslations = {
  en: "Select an offer type to see the fields required for that manual process.",
  th: "เลือกประเภทข้อเสนอเพื่อดูช่องข้อมูลที่จำเป็นสำหรับขั้นตอนนั้น",
  vi: "Chọn loại ưu đãi để xem các trường cần thiết cho quy trình đó.",
  id: "Pilih jenis penawaran untuk melihat kolom yang diperlukan untuk proses tersebut.",
  ja: "オファー種別を選択すると、その手順に必要な項目が表示されます。",
};

const offerTypeGuidanceTranslations = {
  th: {
    red_hot_rooms: "ราคาห้องพักสำหรับสมาชิกแบบจำกัดเวลา",
    more_escapes: "แพ็กเกจอย่างน้อยสองคืนพร้อมสิทธิประโยชน์ เช่น อาหาร สปา รถรับส่ง ที่จอดรถ หรือประสบการณ์จากบุคคลที่สาม",
    hotel_stay: "ข้อเสนอพิเศษสำหรับสมาชิก โดยทั่วไปลดอย่างน้อย 10% จากราคาสาธารณะ",
    dining: "ข้อเสนอร้านอาหารหรือบาร์สำหรับสมาชิก โดยทั่วไปสามารถจองผ่าน Table Plus / ResDiary หรืออีเมล",
    events: "อีเวนต์สำหรับสมาชิกหรืออีเวนต์ของโรงแรม พร้อมวันที่ RSVP สถานที่ ราคา และรายละเอียดที่พักถ้ามี",
    partners: "ข้อเสนอพาร์ทเนอร์สำหรับสมาชิก Accor Plus โดยทั่วไปไม่ผูกกับที่ตั้งโรงแรม",
  },
  vi: {
    red_hot_rooms: "Giá phòng giới hạn thời gian dành cho thành viên.",
    more_escapes: "Gói từ hai đêm trở lên với các quyền lợi như ẩm thực, wellness, đưa đón, đỗ xe hoặc trải nghiệm bên thứ ba.",
    hotel_stay: "Ưu đãi khách sạn dành riêng cho thành viên, thường giảm ít nhất 10% so với giá công khai.",
    dining: "Ưu đãi nhà hàng hoặc bar dành cho thành viên, thường đặt qua Table Plus / ResDiary hoặc email.",
    events: "Sự kiện thành viên hoặc sự kiện khách sạn với ngày sự kiện, hạn RSVP, địa điểm, giá và chi tiết lưu trú nếu có.",
    partners: "Ưu đãi đối tác dành cho thành viên Accor Plus, thường không gắn với địa điểm khách sạn.",
  },
  id: {
    red_hot_rooms: "Tarif kamar khusus anggota untuk periode terbatas.",
    more_escapes: "Paket dua malam atau lebih dengan manfaat seperti dining, wellness, transfer, parkir, atau pengalaman pihak ketiga.",
    hotel_stay: "Penawaran hotel eksklusif anggota, umumnya minimal 10% lebih rendah dari harga publik.",
    dining: "Penawaran restoran atau bar untuk anggota, biasanya dapat dipesan melalui Table Plus / ResDiary atau email.",
    events: "Event anggota atau event hotel dengan tanggal event, batas RSVP, tempat, harga, dan detail akomodasi bila ada.",
    partners: "Penawaran partner untuk anggota Accor Plus, biasanya tidak terikat dengan lokasi hotel.",
  },
  ja: {
    red_hot_rooms: "期間限定の会員向け客室料金です。",
    more_escapes: "ダイニング、ウェルネス、送迎、駐車場、外部体験などを含む2泊以上のパッケージです。",
    hotel_stay: "会員限定のホテルオファーで、通常は一般料金から少なくとも10%割引です。",
    dining: "会員向けレストランまたはバーのオファーで、通常はTable Plus / ResDiaryまたはメールで予約できます。",
    events: "イベント日、RSVP期限、会場、価格、必要に応じた宿泊詳細を含む会員イベントまたはホテルイベントです。",
    partners: "Accor Plus会員向けのパートナーオファーで、通常はホテル所在地に紐づきません。",
  },
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

function showStartScreen() {
  offerStartSection.classList.remove("is-hidden");
  offerWorkspace.classList.add("is-hidden");
  confirmationScreen.classList.add("is-hidden");
  retrievePanel.hidden = true;
  retrieveMessage.textContent = "";
  retrieveResults.innerHTML = "";
  offerStartSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showCreateForm() {
  editingOffer = null;
  editModeNotice.hidden = true;
  editModeNotice.textContent = "";
  form.querySelector('button[type="submit"]').textContent = (uiTranslations[languageSelect.value] || uiTranslations.en).submitButton;
  offerStartSection.classList.add("is-hidden");
  confirmationScreen.classList.add("is-hidden");
  offerWorkspace.classList.remove("is-hidden");
  offerWorkspace.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showRetrievePanel(mode) {
  retrieveMode = mode;
  const copy = uiTranslations[languageSelect.value] || uiTranslations.en;
  retrieveModeLabel.textContent = mode === "edit" ? copy.retrieveEditEyebrow : copy.retrieveViewEyebrow;
  retrievePanel.hidden = false;
  retrieveMessage.textContent = "";
  retrieveResults.innerHTML = "";
  retrievePanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setRetrieveMessage(message, type = "") {
  retrieveMessage.textContent = message;
  retrieveMessage.className = `muted ${type}`.trim();
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function offerIdForRecord(record) {
  return record.offer_id || formatOfferId(record.id);
}

function searchValue(id) {
  return document.getElementById(id).value.trim();
}

function buildOfferSearchParams() {
  const params = new URLSearchParams();
  const offerId = searchValue("offerSearchId");
  const email = searchValue("offerSearchEmail");
  const hotelName = searchValue("offerSearchHotel");
  const hotelCode = searchValue("offerSearchHotelCode");

  if (offerId) params.set("offer_id", offerId);
  if (email) params.set("email", email);
  if (hotelName) params.set("hotel_name", hotelName);
  if (hotelCode) params.set("hotel_rid_code", hotelCode);
  return params;
}

async function fetchOffers(params) {
  const response = await fetch(`/.netlify/functions/get-offer?${params.toString()}`);
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || "The offer lookup could not be completed.");
  }
  return result.offers || [];
}

function renderOfferResults(offers) {
  const copy = uiTranslations[languageSelect.value] || uiTranslations.en;
  retrieveResults.innerHTML = "";

  offers.forEach((offer, index) => {
    const card = document.createElement("article");
    card.className = "retrieved-offer-card";
    card.innerHTML = `
      <div>
        <h4>${escapeHtml(offer.offer_tile_title || offer.offer_banner_title || "Untitled offer")}</h4>
        <p>${escapeHtml(offer.hotel_name || offer.offer_details?.partner_name || "Hotel / partner not provided")}</p>
        <div class="retrieved-offer-meta">
          <span>${escapeHtml(offerIdForRecord(offer))}</span>
          <span>${escapeHtml(offer.offer_type || "Offer type not provided")}</span>
          <span>${escapeHtml(offer.email || "Email not provided")}</span>
        </div>
      </div>
    `;

    const action = document.createElement("button");
    action.type = "button";
    action.textContent = retrieveMode === "edit" ? copy.retrieveEditEyebrow : copy.retrieveViewEyebrow;
    action.addEventListener("click", () => {
      if (retrieveMode === "edit") {
        loadOfferForEdit(offers[index]);
      } else {
        renderOfferDetail(offers[index]);
      }
    });

    card.append(action);
    retrieveResults.append(card);
  });
}

function detailRowsForOffer(offer) {
  const details = offer.offer_details || {};
  return [
    ["Offer ID", offerIdForRecord(offer)],
    ["Hotel name", offer.hotel_name || details.partner_name],
    ["Hotel code", offer.hotel_rid_code],
    ["Offer type", offer.offer_type],
    ["Offer title", offer.offer_tile_title],
    ["Submitter email", offer.email],
    ["Booking link", offer.booking_link],
    ["Date range", buildDateRangeSummary({ offer_details: details })],
    ["Offer description", offer.offer_description],
    ["Terms", offer.terms],
  ].filter(([, value]) => value);
}

function renderOfferDetail(offer) {
  const copy = uiTranslations[languageSelect.value] || uiTranslations.en;
  retrieveResults.innerHTML = `
    <article class="retrieved-offer-detail">
      <h4>${escapeHtml(offer.offer_tile_title || offer.offer_banner_title || "Untitled offer")}</h4>
      <p>${escapeHtml(copy.retrieveImagesNotice)}</p>
      <dl class="retrieved-offer-fields">
        ${detailRowsForOffer(offer).map(([label, value]) => `
          <div>
            <dt>${escapeHtml(label)}</dt>
            <dd>${escapeHtml(value)}</dd>
          </div>
        `).join("")}
      </dl>
    </article>
  `;
  setRetrieveMessage(`${copy.retrieveViewEyebrow}: ${offerIdForRecord(offer)}`, "success");
}

async function handleRetrieveSearch() {
  const copy = uiTranslations[languageSelect.value] || uiTranslations.en;
  const params = buildOfferSearchParams();
  retrieveResults.innerHTML = "";

  if (!params.toString()) {
    setRetrieveMessage(copy.retrieveNoCriteriaMessage, "error");
    return;
  }

  searchOfferButton.disabled = true;
  searchOfferButton.textContent = copy.retrieveSearchingMessage;
  setRetrieveMessage(copy.retrieveSearchingMessage);

  try {
    const offers = await fetchOffers(params);
    if (!offers.length) {
      setRetrieveMessage(copy.retrieveNoResultsMessage, "error");
      return;
    }

    renderOfferResults(offers);
    setRetrieveMessage(copy.retrieveResultsMessage, "success");
  } catch (error) {
    setRetrieveMessage(error.message || "The offer lookup could not be completed.", "error");
  } finally {
    searchOfferButton.disabled = false;
    searchOfferButton.textContent = copy.searchOfferButton;
  }
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

function renderTypeSpecificFields() {
  const selected = offerType.value;
  const fields = typeFieldGroups[selected] || [];
  const language = languageSelect.value || "en";
  const existingValues = collectDynamicFields();
  typeSpecificFields.innerHTML = "";

  if (!selected) {
    typeSpecificFields.innerHTML = `<p class="helper-note">${helperNoteTranslations[language] || helperNoteTranslations.en}</p>`;
    return;
  }

  const guidance = document.createElement("div");
  guidance.className = "process-note";
  guidance.innerHTML = `<strong>${offerTypeLabels[selected]}</strong><span>${offerTypeGuidanceTranslations[language]?.[selected] || offerTypeGuidance[selected]}</span>`;
  typeSpecificFields.append(guidance);

  const grid = document.createElement("div");
  grid.className = "grid two dynamic-grid";

  fields.forEach((field) => {
    const label = document.createElement("label");
    label.textContent = dynamicFieldLabels[language]?.[field.name] || field.label;
    const input = document.createElement(field.type === "textarea" ? "textarea" : "input");
    input.name = field.name;
    input.dataset.dynamicField = "true";
    input.required = Boolean(field.required);
    input.placeholder = field.placeholder || "";
    input.value = existingValues[field.name] || "";
    if (field.type === "textarea") input.rows = 4;
    if (["date", "time"].includes(field.type)) input.type = field.type;
    if (field.type === "date") input.addEventListener("input", validateDates);
    label.append(input);
    grid.append(label);
  });

  typeSpecificFields.append(grid);
}

function normalizeOfferType(value) {
  if (!value) return "";
  const exactMatch = Object.entries(offerTypeLabels).find(([, label]) => label === value);
  if (exactMatch) return exactMatch[0];
  const normalized = String(value).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  return Object.hasOwn(offerTypeLabels, normalized) ? normalized : "";
}

function setFormField(name, value) {
  const element = form.elements[name];
  if (!element) return;
  if (element.type === "checkbox") {
    element.checked = Boolean(value);
    return;
  }
  element.value = value || "";
}

function fillFormFromOffer(offer) {
  const offerTypeValue = normalizeOfferType(offer.offer_type);
  setFormField("email", offer.email);
  setFormField("person_in_charge_name", offer.person_in_charge_name);
  setFormField("hotel_rid_code", offer.hotel_rid_code);
  setFormField("hotel_name", offer.hotel_name);
  setFormField("city_country", offer.city_country);
  setFormField("offer_type", offerTypeValue);
  setFormField("offer_tile_title", offer.offer_tile_title);
  setFormField("offer_banner_title", offer.offer_banner_title);
  setFormField("offer_subtitle", offer.offer_subtitle);
  setFormField("meta_description", offer.meta_description);
  setFormField("offer_description", offer.offer_description);
  setFormField("booking_link", offer.booking_link);
  setFormField("terms", offer.terms);
  setFormField("department_confirmation", offer.department_confirmation);
  setFormField("acknowledgement", offer.acknowledgement);

  renderTypeSpecificFields();
  Object.entries(offer.offer_details || {}).forEach(([name, value]) => {
    const element = typeSpecificFields.querySelector(`[name="${name}"]`);
    if (element) element.value = value || "";
  });

  generatedContentTranslations = offer.auto_translations || {};
  translationPreview.value = "";
  setTranslationStatus("");
}

function loadOfferForEdit(offer) {
  const copy = uiTranslations[languageSelect.value] || uiTranslations.en;
  editingOffer = offer;
  fillFormFromOffer(offer);
  editModeNotice.textContent = copy.retrieveEditNotice.replace("{offerId}", offerIdForRecord(offer));
  editModeNotice.hidden = false;
  form.querySelector('button[type="submit"]').textContent = copy.updateSubmitButton;
  offerStartSection.classList.add("is-hidden");
  confirmationScreen.classList.add("is-hidden");
  offerWorkspace.classList.remove("is-hidden");
  offerWorkspace.scrollIntoView({ behavior: "smooth", block: "start" });
}

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
  const existingFiles = editingOffer?.files || {};
  if (isStayOffer() && !form.elements.rate_screenshot.files.length && !existingFiles.rate_screenshot) {
    missing.push("rate screenshot");
  }
  if (isDiningOrEventOffer() && !form.elements.menu_pdf.files.length && !existingFiles.menu_pdf) {
    missing.push("menu PDF");
  }
  if (isDiningOrEventOffer() && !form.elements.booking_screenshot.files.length && !existingFiles.booking_screenshot) {
    missing.push("final booking-page screenshot");
  }
  if (!resizedBannerFile && !existingFiles.banner_image) {
    missing.push("banner image");
  }
  if (!resizedListingTileFile && !existingFiles.listing_tile_image) {
    missing.push("listing tile image");
  }
  if (!resizedSocialFile && !existingFiles.social_image) {
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

  const before = Math.round(file.size / 1024);
  const after = Math.round(finalFile.size / 1024);
  message.textContent = `${options.label} ready. Auto-resized to ${options.width} x ${options.height}px from ${before} KB to ${after} KB.`;
}

function showPreview(preview, file) {
  preview.src = URL.createObjectURL(file);
  preview.style.display = "block";
}

async function handleMasterImageUpload() {
  const file = masterImageInput.files[0];
  masterBannerPreview.style.display = "none";
  masterListingPreview.style.display = "none";
  masterSocialPreview.style.display = "none";
  masterImageMessage.textContent = "";

  if (!file) return;
  if (!file.type.startsWith("image/")) {
    masterImageMessage.textContent = "Please upload a PNG, JPG, or WebP image.";
    masterImageInput.value = "";
    return;
  }
  if (file.size > maxImageUploadSize) {
    masterImageMessage.textContent = "Image source file must not exceed 200 MB.";
    masterImageInput.value = "";
    return;
  }

  masterImageMessage.textContent = "Creating banner, listing tile, and social image versions...";
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
  showPreview(bannerPreview, resizedBannerFile);
  showPreview(listingTilePreview, resizedListingTileFile);
  showPreview(socialPreview, resizedSocialFile);

  const before = Math.round(file.size / 1024);
  masterImageMessage.textContent = `All image versions ready from one source image. Source size: ${before} KB.`;
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

translateContentButton.addEventListener("click", async () => {
  const sourceLanguage = languageSelect.value;
  const targetLanguage = translationTargetLanguage.value;
  const content = buildContentForTranslation();

  if (!content) {
    setTranslationStatus("Enter the offer content first, then generate a translation draft.");
    return;
  }

  translateContentButton.disabled = true;
  translateContentButton.textContent = "Translating...";
  setTranslationStatus(`Generating ${contentLanguageLabels[targetLanguage]} draft translation...`);

  try {
    translationPreview.value = await translateText(content, sourceLanguage, targetLanguage);
    setTranslationStatus(`Draft ${contentLanguageLabels[targetLanguage]} translation generated. Review or edit it, then save the preview to the package.`);
  } catch (error) {
    setTranslationStatus(`${error.message} You can still paste a translation into the preview and save it to the package.`);
  } finally {
    translateContentButton.disabled = false;
    translateContentButton.textContent = (uiTranslations[languageSelect.value] || uiTranslations.en).previewTranslatedButton;
  }
});

saveTranslationPreviewButton.addEventListener("click", () => {
  const sourceLanguage = languageSelect.value;
  const targetLanguage = translationTargetLanguage.value;
  const text = translationPreview.value.trim();

  if (!text) {
    setTranslationStatus("Add or generate preview text before saving it to the package.");
    return;
  }

  generatedContentTranslations[targetLanguage] = {
    language_code: targetLanguage,
    language: contentLanguageLabels[targetLanguage],
    source_language_code: sourceLanguage,
    source_language: contentLanguageLabels[sourceLanguage],
    provider: sourceLanguage === targetLanguage ? "Copied source content" : "MyMemory public API prototype",
    saved_at: new Date().toISOString(),
    text,
  };
  setTranslationStatus(`${contentLanguageLabels[targetLanguage]} preview saved into the package.`);
});

startActionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.startAction;
    if (action === "create") {
      showCreateForm();
      return;
    }
    showRetrievePanel(action);
  });
});

searchOfferButton.addEventListener("click", handleRetrieveSearch);
backToStartButton.addEventListener("click", showStartScreen);
confirmationNewOfferButton.addEventListener("click", () => {
  form.reset();
  showCreateForm();
});
confirmationBackButton.addEventListener("click", showStartScreen);

offerType.addEventListener("change", renderTypeSpecificFields);
languageSelect.addEventListener("change", () => {
  applyLanguage(languageSelect.value);
  renderTypeSpecificFields();
});

sectionNavigationButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.scrollTarget);
    if (!target) return;

    sectionNavigationButtons.forEach((item) => item.parentElement.classList.remove("active"));
    button.parentElement.classList.add("active");
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

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

function collectTranslations() {
  return {
    zh_hans: fieldValue("translation_zh"),
    vi: fieldValue("translation_vi"),
    th: fieldValue("translation_th"),
    id: fieldValue("translation_id"),
  };
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
    ...dynamicLines,
    ["Booking link", fieldValue("booking_link")],
    ["Terms and conditions", fieldValue("terms")],
    ["Department confirmation", fieldValue("department_confirmation")],
    ["Final acknowledgement", fieldValue("acknowledgement")],
  ].filter(([, value]) => value);

  return contentLines.map(([label, value]) => `${label}:\n${value}`).join("\n\n");
}

function chunkText(text, maxLength = 450) {
  const chunks = [];
  let current = "";

  text.split(/\n{2,}/).forEach((paragraph) => {
    const trimmed = paragraph.trim();
    if (!trimmed) return;

    if ([current, trimmed].filter(Boolean).join("\n\n").length <= maxLength) {
      current = [current, trimmed].filter(Boolean).join("\n\n");
      return;
    }

    if (current) chunks.push(current);
    current = "";

    if (trimmed.length <= maxLength) {
      current = trimmed;
      return;
    }

    trimmed.split(/\s+/).forEach((word) => {
      if ([current, word].filter(Boolean).join(" ").length > maxLength) {
        if (current) chunks.push(current);
        current = word;
      } else {
        current = [current, word].filter(Boolean).join(" ");
      }
    });
  });

  if (current) chunks.push(current);
  return chunks;
}

async function translateChunk(chunk, sourceLanguage, targetLanguage) {
  if (sourceLanguage === targetLanguage) return chunk;

  const langpair = `${sourceLanguage}|${targetLanguage}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${encodeURIComponent(langpair)}&mt=1`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("The translation service is not available right now.");

  const data = await response.json();
  const translatedText = data?.responseData?.translatedText;
  if (!translatedText || data.responseStatus >= 400) {
    throw new Error(data?.responseDetails || "No translation was returned.");
  }
  return translatedText;
}

async function translateText(text, sourceLanguage, targetLanguage) {
  const chunks = chunkText(text);
  const translatedChunks = [];

  for (const chunk of chunks) {
    translatedChunks.push(await translateChunk(chunk, sourceLanguage, targetLanguage));
  }

  return translatedChunks.join("\n\n");
}

function setTranslationStatus(message, type = "") {
  translationStatus.textContent = message;
  translationStatus.className = `muted ${type}`.trim();
}

function fileInfo(name, replacementFile = null) {
  const file = replacementFile || form.elements[name]?.files?.[0];
  if (!file) return editingOffer?.files?.[name] || null;
  return {
    file_name: file.name,
    file_type: file.type || "application/octet-stream",
    file_size_kb: Math.round(file.size / 1024),
  };
}

function buildSubmissionRecord() {
  return {
    id: editingOffer?.id || null,
    offer_id: editingOffer ? offerIdForRecord(editingOffer) : "",
    generated_at: new Date().toISOString(),
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
    translations: collectTranslations(),
    auto_translations: generatedContentTranslations,
    meta_description: fieldValue("meta_description"),
    offer_details: collectDynamicFields(),
    booking_link: fieldValue("booking_link"),
    terms: fieldValue("terms"),
    department_confirmation: fieldValue("department_confirmation"),
    acknowledgement: fieldValue("acknowledgement"),
    files: {
      rate_screenshot: fileInfo("rate_screenshot"),
      menu_pdf: fileInfo("menu_pdf"),
      booking_screenshot: fileInfo("booking_screenshot"),
      banner_image: fileInfo("banner_image", resizedBannerFile),
      listing_tile_image: fileInfo("listing_tile_image", resizedListingTileFile),
      social_image: fileInfo("social_image", resizedSocialFile),
    },
  };
}

function formatOfferId(databaseId) {
  const numericId = Number(databaseId);
  if (Number.isFinite(numericId) && numericId > 0) {
    return `EXP-${new Date().getFullYear()}-${String(numericId).padStart(6, "0")}`;
  }
  return `EXP-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
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

function showConfirmation(record) {
  confirmationOfferId.textContent = record.offer_id;
  confirmationHotelName.textContent = record.hotel_name || record.offer_details.partner_name || "Not provided";
  confirmationHotelCode.textContent = record.hotel_rid_code || "Not provided";
  confirmationOfferTitle.textContent = record.offer_tile_title || "Not provided";
  confirmationEmail.textContent = record.email || "Not provided";
  confirmationBookingLink.textContent = record.booking_link || "Not provided";
  confirmationDateRange.textContent = buildDateRangeSummary(record);

  offerWorkspace.classList.add("is-hidden");
  offerStartSection.classList.add("is-hidden");
  confirmationScreen.classList.remove("is-hidden");
  confirmationScreen.scrollIntoView({ behavior: "smooth", block: "start" });
}

function buildSummaryText(record) {
  const detailLines = Object.entries(record.offer_details)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key.replace(/_/g, " ")}: ${value}`);
  const translationLines = Object.entries(record.translations)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key.replace("_", "-")}: ${value}`);
  const autoTranslationLines = Object.entries(record.auto_translations || {})
    .map(([, item]) => `${item.language} from ${item.source_language}:\n${item.text}`);

  return [
    "Explorer Offer Submission",
    "",
    `Offer ID: ${record.offer_id || "Pending"}`,
    `Generated: ${record.generated_at}`,
    `Type: ${record.offer_type}`,
    `Hotel / Partner: ${record.hotel_name || record.offer_details.partner_name || "Not provided"}`,
    `RID: ${record.hotel_rid_code || "Not provided"}`,
    `City - Country: ${record.city_country || "Not provided"}`,
    `Offer tile title: ${record.offer_tile_title}`,
    `Offer banner title: ${record.offer_banner_title}`,
    `Subtitle: ${record.offer_subtitle}`,
    `Contact: ${record.person_in_charge_name} <${record.email}>`,
    `Booking link: ${record.booking_link}`,
    "",
    "Core content",
    record.offer_description,
    "",
    "Translations",
    translationLines.length ? translationLines.join("\n\n") : "No translations provided",
    "",
    "Prototype auto-translation previews",
    autoTranslationLines.length ? autoTranslationLines.join("\n\n") : "No auto-translation preview saved",
    "",
    "Offer type details",
    detailLines.length ? detailLines.join("\n") : "No additional details provided",
    "",
    "Terms",
    record.terms || "Not provided",
    "",
    "Confirmations",
    `Department confirmation: ${record.department_confirmation}`,
    `Acknowledgement: ${record.acknowledgement}`,
  ].join("\n");
}

function safeName(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70) || "explorer-offer";
}

function uint16(value) {
  return [value & 255, (value >> 8) & 255];
}

function uint32(value) {
  return [value & 255, (value >> 8) & 255, (value >> 16) & 255, (value >> 24) & 255];
}

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let crc = index;
  for (let bit = 0; bit < 8; bit += 1) {
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }
  return crc >>> 0;
});

function crc32(bytes) {
  let crc = 0xffffffff;
  bytes.forEach((byte) => {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  });
  return (crc ^ 0xffffffff) >>> 0;
}

function datePartsForZip(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = Math.floor(date.getSeconds() / 2);
  return {
    time: (hours << 11) | (minutes << 5) | seconds,
    date: ((year - 1980) << 9) | (month << 5) | day,
  };
}

async function createZip(files) {
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const now = datePartsForZip(new Date());

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const dataBytes = new Uint8Array(await file.blob.arrayBuffer());
    const checksum = crc32(dataBytes);

    const localHeader = new Uint8Array([
      ...uint32(0x04034b50),
      ...uint16(20),
      ...uint16(0),
      ...uint16(0),
      ...uint16(now.time),
      ...uint16(now.date),
      ...uint32(checksum),
      ...uint32(dataBytes.length),
      ...uint32(dataBytes.length),
      ...uint16(nameBytes.length),
      ...uint16(0),
    ]);

    localParts.push(localHeader, nameBytes, dataBytes);

    const centralHeader = new Uint8Array([
      ...uint32(0x02014b50),
      ...uint16(20),
      ...uint16(20),
      ...uint16(0),
      ...uint16(0),
      ...uint16(now.time),
      ...uint16(now.date),
      ...uint32(checksum),
      ...uint32(dataBytes.length),
      ...uint32(dataBytes.length),
      ...uint16(nameBytes.length),
      ...uint16(0),
      ...uint16(0),
      ...uint16(0),
      ...uint16(0),
      ...uint32(0),
      ...uint32(offset),
    ]);

    centralParts.push(centralHeader, nameBytes);
    offset += localHeader.length + nameBytes.length + dataBytes.length;
  }

  const centralSize = centralParts.reduce((total, part) => total + part.length, 0);
  const endRecord = new Uint8Array([
    ...uint32(0x06054b50),
    ...uint16(0),
    ...uint16(0),
    ...uint16(files.length),
    ...uint16(files.length),
    ...uint32(centralSize),
    ...uint32(offset),
    ...uint16(0),
  ]);

  return new Blob([...localParts, ...centralParts, endRecord], { type: "application/zip" });
}

function selectedFile(name) {
  return form.elements[name]?.files?.[0] || null;
}

function addFile(files, folder, file) {
  if (!file) return;
  const extension = file.name.split(".").pop() || "bin";
  const baseName = file.name.replace(/\.[^.]+$/, "");
  files.push({ name: `${folder}/${safeName(baseName) || "file"}.${extension}`, blob: file });
}

function getPackageFiles(record) {
  const files = [
    {
      name: "submission.json",
      blob: new Blob([JSON.stringify(record, null, 2)], { type: "application/json" }),
    },
    {
      name: "submission-summary.txt",
      blob: new Blob([buildSummaryText(record)], { type: "text/plain" }),
    },
  ];

  addFile(files, "uploads", selectedFile("rate_screenshot"));
  addFile(files, "uploads", selectedFile("menu_pdf"));
  addFile(files, "uploads", selectedFile("booking_screenshot"));
  addFile(files, "uploads", resizedBannerFile);
  addFile(files, "uploads", resizedListingTileFile);
  addFile(files, "uploads", resizedSocialFile);
  return files;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function createSubmissionPackage() {
  const record = buildSubmissionRecord();
  const packageName = safeName(`${record.hotel_name || record.offer_details.partner_name}-${record.offer_tile_title}`);
  const zip = await createZip(getPackageFiles(record));
  downloadBlob(zip, `${packageName}-explorer-offer-submission.zip`);
}

async function fileToBase64(file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });

  return String(dataUrl).split(",")[1] || "";
}

async function blobToBase64(blob) {
  return fileToBase64(blob);
}

async function buildStorageUploads() {
  const uploadMap = {
    banner_image: resizedBannerFile,
    listing_tile_image: resizedListingTileFile,
    social_image: resizedSocialFile,
  };
  const uploads = [];

  for (const [field, file] of Object.entries(uploadMap)) {
    if (!file) continue;
    uploads.push({
      field,
      file_name: file.name,
      file_type: file.type || "image/jpeg",
      file_size_kb: Math.round(file.size / 1024),
      data_base64: await fileToBase64(file),
    });
  }

  return uploads;
}

async function buildRecordForSave(record) {
  return {
    ...record,
    asset_uploads: await buildStorageUploads(),
  };
}

async function storeSubmission(record) {
  const payload = await buildRecordForSave(record);
  const response = await fetch("/.netlify/functions/submit-offer", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || "Submission could not be stored.");
  }
  return result;
}

async function updateSubmission(record) {
  const payload = await buildRecordForSave(record);
  const response = await fetch("/.netlify/functions/update-offer", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ offer_id: record.offer_id, verify_email: editingOffer?.email, submission: payload }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || "Submission could not be updated.");
  }
  return result;
}

async function sendPackageEmail(record, zip, filename) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);
  let response;
  try {
    response = await fetch("/.netlify/functions/email-package", {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        offer: {
          offer_id: record.offer_id,
          hotel_name: record.hotel_name,
          partner_name: record.offer_details?.partner_name,
          offer_tile_title: record.offer_tile_title,
          offer_banner_title: record.offer_banner_title,
          email: record.email,
          booking_link: record.booking_link,
        },
        attachment: {
          file_name: filename,
          mime_type: "application/zip",
          data_base64: await blobToBase64(zip),
        },
      }),
    });
  } finally {
    window.clearTimeout(timeout);
  }

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || "Package email could not be sent.");
  }
  return result;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage("");

  if (!form.reportValidity() || !validateDates() || !validateRequiredDetails() || !validateRequiredUploads()) {
    if (!formMessage.textContent) {
      setMessage("Please fix the highlighted fields before creating the package.", "error");
    }
    return;
  }

  const bookingLink = form.elements.booking_link.value.trim();
  bookingPreview.href = bookingLink;
  bookingPreview.textContent = bookingLink;

  const result = await new Promise((resolve) => {
    bookingDialog.addEventListener("close", () => resolve(bookingDialog.returnValue), { once: true });
    bookingDialog.showModal();
  });

  if (result !== "confirm") return;

  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = editingOffer ? "Updating package..." : "Creating package...";

  try {
    const record = buildSubmissionRecord();
    const savedSubmission = editingOffer ? await updateSubmission(record) : await storeSubmission(record);
    record.id = savedSubmission.id || record.id;
    record.offer_id = savedSubmission.offer_id || formatOfferId(savedSubmission.id);
    if (savedSubmission.offer?.files) {
      record.files = savedSubmission.offer.files;
    }
    const packageName = safeName(`${record.hotel_name || record.offer_details.partner_name}-${record.offer_tile_title}`);
    const packageFilename = `${packageName}-explorer-offer-submission.zip`;
    const zip = await createZip(getPackageFiles(record));
    downloadBlob(zip, packageFilename);
    setMessage(editingOffer ? "Submission updated and package created." : "Submission stored and package created.", "success");
    if (editingOffer) {
      editingOffer = savedSubmission.offer || { ...editingOffer, ...record };
    }
    showConfirmation(record);
    sendPackageEmail(record, zip, packageFilename)
      .then(() => {
        record.email_delivery = { ok: true };
      })
      .catch((error) => {
        record.email_delivery = { ok: false, error: error.message };
        console.warn("Package email could not be sent.", error);
      });
  } catch (error) {
    setMessage(error.message || "The submission could not be completed.", "error");
  } finally {
    submitButton.disabled = false;
    const copy = uiTranslations[languageSelect.value] || uiTranslations.en;
    submitButton.textContent = editingOffer ? copy.updateSubmitButton : copy.submitButton;
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
    bannerPreview.style.display = "none";
    listingTilePreview.style.display = "none";
    socialPreview.style.display = "none";
    masterImageMessage.textContent = "";
    bannerMessage.textContent = "";
    listingTileMessage.textContent = "";
    socialMessage.textContent = "";
    generatedContentTranslations = {};
    editingOffer = null;
    editModeNotice.hidden = true;
    editModeNotice.textContent = "";
    form.querySelector('button[type="submit"]').textContent = (uiTranslations[languageSelect.value] || uiTranslations.en).submitButton;
    translationPreview.value = "";
    setTranslationStatus("");
    dateMessage.textContent = "";
    renderTypeSpecificFields();
    setMessage("");
  });
});

const savedLanguage = localStorage.getItem("explorer-offer-language") || "en";
languageSelect.value = savedLanguage;
applyLanguage(savedLanguage);
renderTypeSpecificFields();

const rawConfirmation = sessionStorage.getItem("offerSubmissionConfirmation");
const confirmationLanguage = localStorage.getItem("explorer-offer-language") || "en";

const confirmationCopy = {
  en: {
    eyebrow: "Submission complete", headline: "Offer created successfully", intro: "Your offer has been received and archived securely.", reference: "Offer ID", copyId: "Copy ID", copied: "Copied", copyFailed: "Select and copy the ID manually.", whatNext: "Next steps", received: "Received", inReview: "In review", live: "Live", createAnother: "Create another offer", notProvided: "Not provided", driveLabel: "Submission archive", driveCreated: "Your ZIP archive has been saved to Google Drive.", openDrive: "View ZIP in Google Drive",
  },
  th: {
    eyebrow: "ส่งข้อมูลเรียบร้อย", headline: (title) => `${title} กำลังเข้าสู่การตรวจสอบ`, intro: "เราได้รับข้อเสนอของคุณและส่งให้ทีมตรวจสอบแล้ว", reference: "หมายเลขอ้างอิงข้อเสนอ", copyId: "คัดลอก ID", copied: "คัดลอกแล้ว", copyFailed: "โปรดเลือกและคัดลอก ID ด้วยตนเอง", whatNext: "ขั้นตอนต่อไป", received: "ได้รับแล้ว", inReview: "กำลังตรวจสอบ", live: "เผยแพร่", hotelName: "ชื่อโรงแรม", hotelCode: "รหัสโรงแรม", offerType: "ประเภทข้อเสนอ", offerTitle: "ชื่อข้อเสนอ", submitterEmail: "อีเมลผู้ส่ง", bookingMethod: "วิธีการจอง", dateRange: "ช่วงวันที่ส่งข้อมูล", createAnother: "สร้างข้อเสนออื่น", notProvided: "ไม่ได้ระบุ", asanaCreated: "งานตรวจสอบใน Asana พร้อมแล้ว", openAsana: "ดูงานใน Asana", noImages: "ไม่ได้เลือกภาพสำหรับแนบ", imagesAttached: (count) => `แนบภาพ ${count} ภาพกับงานตรวจสอบแล้ว`, imagesFailed: (attached, attempted, failed) => `แนบภาพสำเร็จ ${attached} จาก ${attempted} ภาพ และไม่สำเร็จ ${failed} ภาพ`,
  },
  vi: {
    eyebrow: "Gửi hoàn tất", headline: (title) => `${title} đang được chuyển đến bước xét duyệt`, intro: "Ưu đãi của bạn đã được tiếp nhận và gửi đến nhóm xét duyệt.", reference: "Mã tham chiếu ưu đãi", copyId: "Sao chép ID", copied: "Đã sao chép", copyFailed: "Hãy chọn và sao chép ID theo cách thủ công.", whatNext: "Điều gì xảy ra tiếp theo?", received: "Đã nhận", inReview: "Đang xét duyệt", live: "Đang hoạt động", hotelName: "Tên khách sạn", hotelCode: "Mã khách sạn", offerType: "Loại ưu đãi", offerTitle: "Tiêu đề ưu đãi", submitterEmail: "Email người gửi", bookingMethod: "Phương thức đặt chỗ", dateRange: "Khoảng ngày gửi", createAnother: "Tạo ưu đãi khác", notProvided: "Không được cung cấp", asanaCreated: "Tác vụ xét duyệt Asana đã sẵn sàng.", openAsana: "Xem tác vụ trong Asana", noImages: "Không có hình ảnh nào được chọn để đính kèm.", imagesAttached: (count) => `Đã đính kèm ${count} hình ảnh vào tác vụ xét duyệt.`, imagesFailed: (attached, attempted, failed) => `Đã đính kèm ${attached}/${attempted} hình ảnh. ${failed} hình ảnh không thành công.`,
  },
  id: {
    eyebrow: "Pengiriman selesai", headline: (title) => `${title} sedang menuju proses peninjauan`, intro: "Penawaran Anda telah diterima dan dikirim kepada tim untuk ditinjau.", reference: "Referensi penawaran", copyId: "Salin ID", copied: "Disalin", copyFailed: "Pilih dan salin ID secara manual.", whatNext: "Apa yang terjadi selanjutnya?", received: "Diterima", inReview: "Sedang ditinjau", live: "Tayang", hotelName: "Nama hotel", hotelCode: "Kode hotel", offerType: "Jenis penawaran", offerTitle: "Judul penawaran", submitterEmail: "Email pengirim", bookingMethod: "Metode pemesanan", dateRange: "Rentang tanggal pengiriman", createAnother: "Buat penawaran lain", notProvided: "Tidak tersedia", asanaCreated: "Tugas peninjauan Asana sudah siap.", openAsana: "Lihat tugas di Asana", noImages: "Tidak ada gambar yang dipilih untuk dilampirkan.", imagesAttached: (count) => `${count} gambar dilampirkan ke tugas peninjauan.`, imagesFailed: (attached, attempted, failed) => `${attached} dari ${attempted} gambar berhasil dilampirkan. ${failed} gagal.`,
  },
  ja: {
    eyebrow: "提出完了", headline: (title) => `${title} は審査へ進みます`, intro: "オファーを受け付け、チームの審査に送りました。", reference: "オファー参照番号", copyId: "IDをコピー", copied: "コピーしました", copyFailed: "IDを選択して手動でコピーしてください。", whatNext: "今後の流れ", received: "受付済み", inReview: "審査中", live: "公開", hotelName: "ホテル名", hotelCode: "ホテルコード", offerType: "オファー種別", offerTitle: "オファータイトル", submitterEmail: "提出者メール", bookingMethod: "予約方法", dateRange: "提出日付範囲", createAnother: "別のオファーを作成", notProvided: "未入力", asanaCreated: "Asanaの審査タスクを作成しました。", openAsana: "Asanaでタスクを見る", noImages: "添付する画像が選択されていません。", imagesAttached: (count) => `${count}枚の画像を審査タスクに添付しました。`, imagesFailed: (attached, attempted, failed) => `${attempted}枚中${attached}枚を添付しました。${failed}枚は失敗しました。`,
  },
  ar: {
    eyebrow: "اكتمل الإرسال", headline: (title) => `${title} في طريقه إلى المراجعة`, intro: "تم استلام عرضك وإرساله إلى الفريق للمراجعة.", reference: "مرجع العرض", copyId: "نسخ المعرّف", copied: "تم النسخ", copyFailed: "حدد المعرّف وانسخه يدويًا.", whatNext: "ماذا سيحدث بعد ذلك؟", received: "تم الاستلام", inReview: "قيد المراجعة", live: "منشور", hotelName: "اسم الفندق", hotelCode: "رمز الفندق", offerType: "نوع العرض", offerTitle: "عنوان العرض", submitterEmail: "البريد الإلكتروني للمرسل", bookingMethod: "طريقة الحجز", dateRange: "نطاق تاريخ الإرسال", createAnother: "إنشاء عرض آخر", notProvided: "غير متوفر", asanaCreated: "مهمة المراجعة في Asana جاهزة.", openAsana: "عرض المهمة في Asana", noImages: "لم يتم اختيار صور لإرفاقها.", imagesAttached: (count) => `تم إرفاق ${count} من الصور بمهمة المراجعة.`, imagesFailed: (attached, attempted, failed) => `تم إرفاق ${attached} من أصل ${attempted} صورة. تعذر إرفاق ${failed}.`,
  },
  tr: {
    eyebrow: "Gönderim tamamlandı", headline: "Teklif başarıyla oluşturuldu", intro: "Teklifiniz alındı ve güvenli şekilde arşivlendi.", reference: "Teklif ID", copyId: "ID'yi kopyala", copied: "Kopyalandı", copyFailed: "ID'yi seçip elle kopyalayın.", whatNext: "Sonraki adımlar", received: "Alındı", inReview: "İnceleniyor", live: "Yayında", createAnother: "Başka bir teklif oluştur", notProvided: "Belirtilmedi", driveLabel: "Gönderim arşivi", driveCreated: "ZIP arşiviniz Google Drive'a kaydedildi.", openDrive: "ZIP'i Google Drive'da görüntüle",
  },
};

const simplifiedConfirmationCopy = {
  th: { headline: "สร้างข้อเสนอสำเร็จ", driveLabel: "ไฟล์เก็บถาวรการส่งข้อมูล" },
  vi: { headline: "Đã tạo ưu đãi thành công", driveLabel: "Tệp lưu trữ nội dung gửi" },
  id: { headline: "Penawaran berhasil dibuat", driveLabel: "Arsip pengiriman" },
  ja: { headline: "オファーを作成しました", driveLabel: "提出アーカイブ" },
  ar: { headline: "تم إنشاء العرض بنجاح", driveLabel: "أرشيف الإرسال" },
  tr: { headline: "Teklif başarıyla oluşturuldu", driveLabel: "Gönderim arşivi" },
};
const copy = {
  ...(confirmationCopy[confirmationLanguage] || confirmationCopy.en),
  ...(simplifiedConfirmationCopy[confirmationLanguage] || {}),
};
if (confirmationLanguage === "en") copy.whatNext = "What happens next";
document.documentElement.lang = confirmationLanguage;
document.documentElement.dir = confirmationLanguage === "ar" ? "rtl" : "ltr";

document.querySelectorAll("[data-confirmation-i18n]").forEach((element) => {
  const value = copy[element.dataset.confirmationI18n] || confirmationCopy.en[element.dataset.confirmationI18n];
  if (typeof value === "string") element.textContent = value;
});

if (!rawConfirmation) {
  window.location.replace("/");
} else {
  const confirmation = JSON.parse(rawConfirmation);
  const offerTitle = confirmation.offer_tile_title || copy.notProvided;
  const hotelName = confirmation.hotel_name || copy.notProvided;
  const offerTypes = {
    red_hot_rooms: { label: "Red Hot Rooms", icon: "RHR", badge: true },
    more_escapes: { label: "More Escapes", icon: "%", badge: true },
    hotel_stay: { label: "Hotel stay", icon: "⌂" },
    dining: { label: "Dining", icon: "◇" },
    events: { label: "Events", icon: "✦" },
    partners: { label: "Partners", icon: "∞" },
  };
  const offerType = offerTypes[confirmation.offer_type] || { label: confirmation.offer_type || "Offer", icon: "◇" };
  document.title = `${offerTitle} | Explorer Offers Collection`;
  document.getElementById("confirmationTitle").textContent = confirmationLanguage === "en"
    ? `Your ${offerType.label} offer is submitted`
    : copy.headline;
  document.getElementById("confirmationOfferTitle").textContent = offerTitle;
  document.getElementById("confirmationHotelName").textContent = hotelName;
  document.getElementById("confirmationOfferId").textContent = confirmation.offer_id;
  const typeIcon = document.getElementById("confirmationOfferTypeIcon");
  typeIcon.textContent = offerType.icon;
  typeIcon.classList.toggle("is-badge", Boolean(offerType.badge));

  const copyStatus = document.getElementById("copyOfferIdStatus");
  document.getElementById("copyOfferIdButton").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(confirmation.offer_id);
      copyStatus.textContent = copy.copied;
    } catch (error) {
      copyStatus.textContent = copy.copyFailed;
    }
  });

  const createAnotherLabel = document.getElementById("createAnotherOfferLabel");
  if (confirmationLanguage === "en" && hotelName !== copy.notProvided) {
    createAnotherLabel.textContent = `Create another offer for ${hotelName}`;
  }
  document.getElementById("createAnotherOfferButton").addEventListener("click", () => {
    sessionStorage.setItem("offerHotelPrefill", JSON.stringify({
      hotel_name: confirmation.hotel_name || "",
      hotel_rid_code: confirmation.hotel_rid_code || "",
      city_country: confirmation.city_country || "",
    }));
  });
}

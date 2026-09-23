const rawConfirmation = sessionStorage.getItem("offerSubmissionConfirmation");
const confirmationLanguage = localStorage.getItem("explorer-offer-language") || "en";

const confirmationCopy = {
  en: {
    eyebrow: "Submission complete", headline: (title) => `${title} is on its way to review`, intro: "Your offer has been received and sent to the team for review.", reference: "Offer reference", copyId: "Copy ID", copied: "Copied", copyFailed: "Select and copy the ID manually.", whatNext: "What happens next?", received: "Received", inReview: "In review", live: "Live", hotelName: "Hotel name", hotelCode: "Hotel code", offerType: "Offer type", offerTitle: "Offer title", submitterEmail: "Submitter email", bookingMethod: "Booking method", dateRange: "Submission date range", createAnother: "Create another offer", notProvided: "Not provided", asanaCreated: "The Asana review task is ready.", openAsana: "See task in Asana", noImages: "No images were selected for attachment.", imagesAttached: (count) => `${count} image${count === 1 ? "" : "s"} attached to the review task.`, imagesFailed: (attached, attempted, failed) => `${attached} of ${attempted} images attached. ${failed} failed.`,
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
};

const copy = confirmationCopy[confirmationLanguage] || confirmationCopy.en;
document.documentElement.lang = confirmationLanguage;
document.documentElement.dir = confirmationLanguage === "ar" ? "rtl" : "ltr";

document.querySelectorAll("[data-confirmation-i18n]").forEach((element) => {
  const value = copy[element.dataset.confirmationI18n];
  if (typeof value === "string") element.textContent = value;
});

const offerTypePresentation = {
  "red hot rooms": { icon: "RHR", className: "badge" },
  "more escapes": { icon: "%", className: "badge" },
  "hotel stay": { icon: '<svg viewBox="0 0 32 32" focusable="false"><path d="M4 23V10m0 9h24v7m-24 0v-7m6 0v-6h7c3 0 5 2 5 5v1M4 13h6v6"/></svg>', className: "svg" },
  dining: { icon: '<svg viewBox="0 0 32 32" focusable="false"><path d="M9 4v10m-4-10v7c0 3 2 5 4 5s4-2 4-5V4M9 16v12M22 28V4c4 3 5 8 3 13h-3"/></svg>', className: "svg" },
  events: { icon: '<svg viewBox="0 0 32 32" focusable="false"><path d="m5 11 6 5 5-10 5 10 6-5-3 14H8L5 11Zm4 14h14"/></svg>', className: "svg" },
  partners: { icon: '<svg viewBox="0 0 32 32" focusable="false"><path d="m12 11 3-3c2-2 5-2 7 0l7 7-7 7m-2-12-8 8m-2-8-7 7 7 7 3-3m-6-7 7 7m-3-11 8 8"/></svg>', className: "svg" },
};

function applyOfferTypeIcon(element, offerType) {
  const presentation = offerTypePresentation[String(offerType || "").toLowerCase()] || { icon: "✦", className: "" };
  if (presentation.className === "svg") element.innerHTML = presentation.icon;
  else element.textContent = presentation.icon;
  element.classList.toggle("is-badge", presentation.className === "badge");
  element.classList.toggle("has-svg", presentation.className === "svg");
}

if (!rawConfirmation) {
  window.location.replace("/");
} else {
  const confirmation = JSON.parse(rawConfirmation);
  const setText = (id, value) => {
    document.getElementById(id).textContent = value || copy.notProvided;
  };

  const offerTitle = confirmation.offer_tile_title || copy.notProvided;
  document.title = `${offerTitle} | Explorer Offers Collection`;
  document.getElementById("confirmationTitle").textContent = copy.headline(offerTitle);
  setText("confirmationOfferId", confirmation.offer_id);
  setText("confirmationHotelName", confirmation.hotel_name);
  setText("confirmationHotelCode", confirmation.hotel_rid_code);
  setText("confirmationOfferType", confirmation.offer_type);
  setText("confirmationOfferTitle", offerTitle);
  setText("confirmationEmail", confirmation.email);
  setText("confirmationBookingLink", confirmation.booking_details || confirmation.booking_link);
  setText("confirmationDateRange", confirmation.date_range);
  applyOfferTypeIcon(document.getElementById("ticketOfferTypeIcon"), confirmation.offer_type);
  applyOfferTypeIcon(document.getElementById("detailOfferTypeIcon"), confirmation.offer_type);

  const copyButton = document.getElementById("copyOfferIdButton");
  const copyStatus = document.getElementById("copyOfferIdStatus");
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(confirmation.offer_id);
      copyStatus.textContent = copy.copied;
      copyButton.classList.add("is-copied");
      window.setTimeout(() => {
        copyStatus.textContent = "";
        copyButton.classList.remove("is-copied");
      }, 2200);
    } catch (error) {
      copyStatus.textContent = copy.copyFailed;
    }
  });

  document.getElementById("confirmationAsanaStatus").textContent = copy.asanaCreated;
  const asanaButton = document.getElementById("openAsanaButton");
  if (confirmation.asana?.permalink_url) {
    asanaButton.href = confirmation.asana.permalink_url;
    asanaButton.classList.remove("is-hidden");
  }

  const attachments = confirmation.attachments || {};
  const attachmentStatus = document.getElementById("confirmationAttachmentStatus");
  if (!attachments.attempted) {
    attachmentStatus.textContent = copy.noImages;
  } else if (!attachments.failed) {
    attachmentStatus.textContent = copy.imagesAttached(attachments.attached);
    attachmentStatus.classList.add("success");
  } else {
    attachmentStatus.textContent = copy.imagesFailed(attachments.attached, attachments.attempted, attachments.failed);
    attachmentStatus.classList.add("error");
  }
}

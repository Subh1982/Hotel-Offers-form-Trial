const rawConfirmation = sessionStorage.getItem("offerSubmissionConfirmation");
const confirmationLanguage = localStorage.getItem("explorer-offer-language") || "en";
const confirmationCopy = {
  en: {
    eyebrow: "Submission complete", title: "Asana task created successfully", intro: "Your offer has been sent to Asana for the team to review.", reference: "Reference", hotelName: "Hotel name", hotelCode: "Hotel code", offerTitle: "Offer title", submitterEmail: "Submitter email", bookingMethod: "Booking method", dateRange: "Submission date range", createAnother: "Create another offer", notProvided: "Not provided", asanaCreated: "Asana task created successfully.", openAsana: " Open task in Asana", noImages: "No images were selected for attachment.", imagesAttached: (count) => `${count} image${count === 1 ? "" : "s"} attached to the Asana task.`, imagesFailed: (attached, attempted, failed) => `${attached} of ${attempted} images attached. ${failed} failed.`,
  },
  th: {
    eyebrow: "ส่งข้อมูลเรียบร้อย", title: "สร้างงาน Asana สำเร็จ", intro: "ข้อเสนอของคุณถูกส่งไปยัง Asana เพื่อให้ทีมตรวจสอบแล้ว", reference: "หมายเลขอ้างอิง", hotelName: "ชื่อโรงแรม", hotelCode: "รหัสโรงแรม", offerTitle: "ชื่อข้อเสนอ", submitterEmail: "อีเมลผู้ส่ง", bookingMethod: "วิธีการจอง", dateRange: "ช่วงวันที่ส่งข้อมูล", createAnother: "สร้างข้อเสนออื่น", notProvided: "ไม่ได้ระบุ", asanaCreated: "สร้างงาน Asana สำเร็จ", openAsana: " เปิดงานใน Asana", noImages: "ไม่ได้เลือกภาพสำหรับแนบ", imagesAttached: (count) => `แนบภาพ ${count} ภาพกับงาน Asana แล้ว`, imagesFailed: (attached, attempted, failed) => `แนบภาพสำเร็จ ${attached} จาก ${attempted} ภาพ และไม่สำเร็จ ${failed} ภาพ`,
  },
  vi: {
    eyebrow: "Gửi hoàn tất", title: "Đã tạo tác vụ Asana thành công", intro: "Ưu đãi của bạn đã được gửi đến Asana để nhóm xem xét.", reference: "Mã tham chiếu", hotelName: "Tên khách sạn", hotelCode: "Mã khách sạn", offerTitle: "Tiêu đề ưu đãi", submitterEmail: "Email người gửi", bookingMethod: "Phương thức đặt chỗ", dateRange: "Khoảng ngày gửi", createAnother: "Tạo ưu đãi khác", notProvided: "Không được cung cấp", asanaCreated: "Đã tạo tác vụ Asana thành công.", openAsana: " Mở tác vụ trong Asana", noImages: "Không có hình ảnh nào được chọn để đính kèm.", imagesAttached: (count) => `Đã đính kèm ${count} hình ảnh vào tác vụ Asana.`, imagesFailed: (attached, attempted, failed) => `Đã đính kèm ${attached}/${attempted} hình ảnh. ${failed} hình ảnh không thành công.`,
  },
  id: {
    eyebrow: "Pengiriman selesai", title: "Tugas Asana berhasil dibuat", intro: "Penawaran Anda telah dikirim ke Asana untuk ditinjau oleh tim.", reference: "Referensi", hotelName: "Nama hotel", hotelCode: "Kode hotel", offerTitle: "Judul penawaran", submitterEmail: "Email pengirim", bookingMethod: "Metode pemesanan", dateRange: "Rentang tanggal pengiriman", createAnother: "Buat penawaran lain", notProvided: "Tidak tersedia", asanaCreated: "Tugas Asana berhasil dibuat.", openAsana: " Buka tugas di Asana", noImages: "Tidak ada gambar yang dipilih untuk dilampirkan.", imagesAttached: (count) => `${count} gambar dilampirkan ke tugas Asana.`, imagesFailed: (attached, attempted, failed) => `${attached} dari ${attempted} gambar berhasil dilampirkan. ${failed} gagal.`,
  },
  ja: {
    eyebrow: "提出完了", title: "Asanaタスクが正常に作成されました", intro: "オファーはチームの確認用としてAsanaに送信されました。", reference: "参照番号", hotelName: "ホテル名", hotelCode: "ホテルコード", offerTitle: "オファータイトル", submitterEmail: "提出者メール", bookingMethod: "予約方法", dateRange: "提出日付範囲", createAnother: "別のオファーを作成", notProvided: "未入力", asanaCreated: "Asanaタスクが正常に作成されました。", openAsana: " Asanaでタスクを開く", noImages: "添付する画像が選択されていません。", imagesAttached: (count) => `${count}枚の画像をAsanaタスクに添付しました。`, imagesFailed: (attached, attempted, failed) => `${attempted}枚中${attached}枚を添付しました。${failed}枚は失敗しました。`,
  },
  ar: {
    eyebrow: "اكتمل الإرسال", title: "تم إنشاء مهمة Asana بنجاح", intro: "تم إرسال عرضك إلى Asana ليتمكن الفريق من مراجعته.", reference: "المرجع", hotelName: "اسم الفندق", hotelCode: "رمز الفندق", offerTitle: "عنوان العرض", submitterEmail: "البريد الإلكتروني للمرسل", bookingMethod: "طريقة الحجز", dateRange: "نطاق تاريخ الإرسال", createAnother: "إنشاء عرض آخر", notProvided: "غير متوفر", asanaCreated: "تم إنشاء مهمة Asana بنجاح.", openAsana: " فتح المهمة في Asana", noImages: "لم يتم اختيار صور لإرفاقها.", imagesAttached: (count) => `تم إرفاق ${count} من الصور بمهمة Asana.`, imagesFailed: (attached, attempted, failed) => `تم إرفاق ${attached} من أصل ${attempted} صورة. تعذر إرفاق ${failed}.`,
  },
};
const copy = confirmationCopy[confirmationLanguage] || confirmationCopy.en;

document.documentElement.lang = confirmationLanguage;
document.documentElement.dir = confirmationLanguage === "ar" ? "rtl" : "ltr";
document.querySelectorAll("[data-confirmation-i18n]").forEach((element) => {
  const value = copy[element.dataset.confirmationI18n];
  if (typeof value === "string") element.textContent = value;
});

if (!rawConfirmation) {
  window.location.replace("/");
} else {
  const confirmation = JSON.parse(rawConfirmation);
  const setText = (id, value) => {
    document.getElementById(id).textContent = value || copy.notProvided;
  };

  setText("confirmationOfferId", confirmation.offer_id);
  setText("confirmationHotelName", confirmation.hotel_name);
  setText("confirmationHotelCode", confirmation.hotel_rid_code);
  setText("confirmationOfferTitle", confirmation.offer_tile_title);
  setText("confirmationEmail", confirmation.email);
  setText("confirmationBookingLink", confirmation.booking_details || confirmation.booking_link);
  setText("confirmationDateRange", confirmation.date_range);

  const asanaStatus = document.getElementById("confirmationAsanaStatus");
  asanaStatus.append(copy.asanaCreated);
  if (confirmation.asana?.permalink_url) {
    const link = document.createElement("a");
    link.href = confirmation.asana.permalink_url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = copy.openAsana;
    asanaStatus.append(link);
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

const rawConfirmation = sessionStorage.getItem("offerSubmissionConfirmation");
const confirmationLanguage = localStorage.getItem("explorer-offer-language") || "en";
const confirmationCopy = {
  en: {
    eyebrow: "Submission complete", title: "Asana task created successfully", intro: "Your offer has been sent to Asana for the team to review.", reference: "Reference", hotelName: "Hotel name", hotelCode: "Hotel code", offerTitle: "Offer title", submitterEmail: "Submitter email", bookingMethod: "Booking method", dateRange: "Submission date range", createAnother: "Create another offer", notProvided: "Not provided", asanaCreated: "Asana task created successfully.", openAsana: " Open task in Asana", noImages: "No images were selected for attachment.", imagesAttached: (count) => `${count} image${count === 1 ? "" : "s"} attached to the Asana task.`, imagesFailed: (attached, attempted, failed) => `${attached} of ${attempted} images attached. ${failed} failed.`,
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

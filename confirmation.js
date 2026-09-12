const rawConfirmation = sessionStorage.getItem("offerSubmissionConfirmation");

if (!rawConfirmation) {
  window.location.replace("/");
} else {
  const confirmation = JSON.parse(rawConfirmation);
  const setText = (id, value) => {
    document.getElementById(id).textContent = value || "Not provided";
  };

  setText("confirmationOfferId", confirmation.offer_id);
  setText("confirmationHotelName", confirmation.hotel_name);
  setText("confirmationHotelCode", confirmation.hotel_rid_code);
  setText("confirmationOfferTitle", confirmation.offer_tile_title);
  setText("confirmationEmail", confirmation.email);
  setText("confirmationBookingLink", confirmation.booking_details || confirmation.booking_link);
  setText("confirmationDateRange", confirmation.date_range);

  const asanaStatus = document.getElementById("confirmationAsanaStatus");
  asanaStatus.append("Asana task created successfully.");
  if (confirmation.asana?.permalink_url) {
    const link = document.createElement("a");
    link.href = confirmation.asana.permalink_url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = " Open task in Asana";
    asanaStatus.append(link);
  }

  const attachments = confirmation.attachments || {};
  const attachmentStatus = document.getElementById("confirmationAttachmentStatus");
  if (!attachments.attempted) {
    attachmentStatus.textContent = "No images were selected for attachment.";
  } else if (!attachments.failed) {
    attachmentStatus.textContent = `${attachments.attached} image${attachments.attached === 1 ? "" : "s"} attached to the Asana task.`;
    attachmentStatus.classList.add("success");
  } else {
    attachmentStatus.textContent = `${attachments.attached} of ${attachments.attempted} images attached. ${attachments.failed} failed.`;
    attachmentStatus.classList.add("error");
  }
}

const form = document.querySelector("#offerForm");
const bannerInput = document.querySelector("#bannerInput");
const bannerPreview = document.querySelector("#bannerPreview");
const bannerMessage = document.querySelector("#bannerMessage");
const originalInput = document.querySelector("#originalInput");
const originalPreview = document.querySelector("#originalPreview");
const originalMessage = document.querySelector("#originalMessage");
const formMessage = document.querySelector("#formMessage");
const dateMessage = document.querySelector("#dateMessage");
const bookingDialog = document.querySelector("#bookingDialog");
const bookingPreview = document.querySelector("#bookingPreview");

let resizedBannerFile = null;
let optimizedOriginalFile = null;

const dateFields = [
  "public_start_date",
  "public_end_date",
  "actual_start_date",
  "actual_end_date",
].map((name) => form.elements[name]);

function setMessage(message, type = "") {
  formMessage.textContent = message;
  formMessage.className = `form-message ${type}`.trim();
}

function validateDates() {
  const publicStart = form.elements.public_start_date.value;
  const publicEnd = form.elements.public_end_date.value;
  const actualStart = form.elements.actual_start_date.value;
  const actualEnd = form.elements.actual_end_date.value;

  dateMessage.textContent = "";
  if (publicStart && publicEnd && publicStart > publicEnd) {
    dateMessage.textContent = "The published start date must be before the published end date.";
    return false;
  }
  if (actualStart && actualEnd && actualStart > actualEnd) {
    dateMessage.textContent = "The actual start date must be before the actual end date.";
    return false;
  }
  if (publicStart && publicEnd && actualStart && actualEnd && (publicStart !== actualStart || publicEnd !== actualEnd)) {
    dateMessage.textContent = "Published dates must match the actual offer dates before submission.";
    return false;
  }
  return true;
}

function isStayOffer() {
  const type = form.elements.offer_type.value.toLowerCase();
  return type.includes("stay") || type.includes("room");
}

function isDiningOrEventOffer() {
  const type = form.elements.offer_type.value.toLowerCase();
  return type.includes("dining") || type.includes("event");
}

function validateRequiredUploads() {
  const missing = [];
  if (isStayOffer() && !form.elements.rate_screenshot.files.length) {
    missing.push("rate screenshot");
  }
  if (isDiningOrEventOffer() && !form.elements.menu_pdf.files.length) {
    missing.push("menu PDF");
  }
  if (isDiningOrEventOffer() && !form.elements.booking_screenshot.files.length) {
    missing.push("final booking-page screenshot");
  }
  if (!form.elements.offer_page_form.files.length) {
    missing.push("offer page spreadsheet");
  }
  if (!resizedBannerFile) {
    missing.push("banner image");
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

  message.textContent = "Resizing image...";
  const resized = await resizeImage(file, options.width, options.height, options.cover);
  setFile(resized);
  preview.src = URL.createObjectURL(resized);
  preview.style.display = "block";

  const before = Math.round(file.size / 1024);
  const after = Math.round(resized.size / 1024);
  message.textContent = `${options.label} ready. Resized from ${before} KB to ${after} KB.`;
}

bannerInput.addEventListener("change", () => handleImageUpload(
  bannerInput,
  bannerPreview,
  bannerMessage,
  (file) => { resizedBannerFile = file; },
  { width: 2048, height: 1366, cover: true, label: "Banner image" },
));

originalInput.addEventListener("change", () => handleImageUpload(
  originalInput,
  originalPreview,
  originalMessage,
  (file) => { optimizedOriginalFile = file; },
  { width: 2400, height: 2400, cover: false, label: "Original image" },
));

dateFields.forEach((field) => field.addEventListener("input", validateDates));

function fieldValue(name) {
  const element = form.elements[name];
  if (!element) return "";
  if (element.type === "checkbox") return element.checked ? element.value : "";
  return element.value.trim();
}

function fileInfo(name, replacementFile = null) {
  const file = replacementFile || form.elements[name]?.files?.[0];
  if (!file) return null;
  return {
    file_name: file.name,
    file_type: file.type || "application/octet-stream",
    file_size_kb: Math.round(file.size / 1024),
  };
}

function buildSubmissionRecord() {
  return {
    generated_at: new Date().toISOString(),
    email: fieldValue("email"),
    person_in_charge_name: fieldValue("person_in_charge_name"),
    hotel_rid_code: fieldValue("hotel_rid_code"),
    hotel_name: fieldValue("hotel_name"),
    offer_type: fieldValue("offer_type"),
    offer_name: fieldValue("offer_name"),
    inclusions: fieldValue("inclusions"),
    offer_value: fieldValue("offer_value"),
    public_start_date: fieldValue("public_start_date"),
    public_end_date: fieldValue("public_end_date"),
    actual_start_date: fieldValue("actual_start_date"),
    actual_end_date: fieldValue("actual_end_date"),
    booking_link: fieldValue("booking_link"),
    terms: fieldValue("terms"),
    department_confirmation: fieldValue("department_confirmation"),
    acknowledgement: fieldValue("acknowledgement"),
    files: {
      rate_screenshot: fileInfo("rate_screenshot"),
      menu_pdf: fileInfo("menu_pdf"),
      booking_screenshot: fileInfo("booking_screenshot"),
      offer_page_form: fileInfo("offer_page_form"),
      banner_image: fileInfo("banner_image", resizedBannerFile),
      original_image: fileInfo("original_image", optimizedOriginalFile),
    },
  };
}

function buildSummaryText(record) {
  return [
    "Explorer Offer Submission",
    "",
    `Generated: ${record.generated_at}`,
    `Hotel: ${record.hotel_name}`,
    `RID: ${record.hotel_rid_code}`,
    `Offer: ${record.offer_name}`,
    `Type: ${record.offer_type}`,
    `Contact: ${record.person_in_charge_name} <${record.email}>`,
    `Booking link: ${record.booking_link}`,
    "",
    "Dates",
    `Published: ${record.public_start_date} to ${record.public_end_date}`,
    `Actual: ${record.actual_start_date} to ${record.actual_end_date}`,
    "",
    "Offer details",
    `Inclusions: ${record.inclusions || "Not provided"}`,
    `Offer value: ${record.offer_value || "Not provided"}`,
    `Terms: ${record.terms || "Not provided"}`,
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
  files.push({ name: `${folder}/${safeName(file.name) || "file"}.${file.name.split(".").pop() || "bin"}`, blob: file });
}

async function createSubmissionPackage() {
  const record = buildSubmissionRecord();
  const packageName = safeName(`${record.hotel_name}-${record.offer_name}`);
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
  addFile(files, "uploads", selectedFile("offer_page_form"));
  addFile(files, "uploads", resizedBannerFile);
  addFile(files, "uploads", optimizedOriginalFile);

  const zip = await createZip(files);
  const url = URL.createObjectURL(zip);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${packageName}-explorer-offer-submission.zip`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage("");

  if (!form.reportValidity() || !validateDates() || !validateRequiredUploads()) {
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
  submitButton.textContent = "Creating package...";

  try {
    await createSubmissionPackage();
    setMessage("Submission package created. Nothing was uploaded or stored by this page.", "success");
  } catch (error) {
    setMessage(error.message || "The package could not be created.", "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Review link and create package";
  }
});

form.addEventListener("reset", () => {
  setTimeout(() => {
    resizedBannerFile = null;
    optimizedOriginalFile = null;
    bannerPreview.style.display = "none";
    originalPreview.style.display = "none";
    bannerMessage.textContent = "";
    originalMessage.textContent = "";
    dateMessage.textContent = "";
    setMessage("");
  });
});

let currentFile = null;
let originalImageData = null;

// Drag and drop functionality
function initializeDragDrop() {
  const dropZone = document.getElementById("dropZone");

  dropZone.addEventListener("dragover", function (e) {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });

  dropZone.addEventListener("dragleave", function (e) {
    e.preventDefault();
    dropZone.classList.remove("dragover");
  });

  dropZone.addEventListener("drop", function (e) {
    e.preventDefault();
    dropZone.classList.remove("dragover");

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  });
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    handleFile(file);
  }
}

function handleFile(file) {
  // Validate file type
  if (!file.type.startsWith("image/")) {
    showMessage("Please select a valid image file.", "error");
    return;
  }

  // Validate file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    showMessage("File size must be less than 10MB.", "error");
    return;
  }

  currentFile = file;

  // Update drop zone to show file selected
  const dropZone = document.getElementById("dropZone");
  dropZone.classList.add("has-file");
  dropZone.innerHTML = `
          <div class="drop-zone-icon">✅</div>
          <div class="drop-zone-text">Image selected: ${file.name}</div>
          <div class="drop-zone-subtext">Click to select a different image</div>
        `;

  // Enable convert button
  document.getElementById("convertBtn").disabled = false;

  // Load and display original image
  loadOriginalImage(file);

  // Clear any previous messages
  clearMessages();
}

function loadOriginalImage(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    originalImageData = e.target.result;

    // Create image to get dimensions
    const img = new Image();
    img.onload = function () {
      // Display original image info
      const originalInfo = document.getElementById("originalInfo");
      originalInfo.innerHTML = `
              <p><strong>Original Image Info</strong></p>
              <p>Format: ${file.type.split("/")[1].toUpperCase()}</p>
              <p>Size: ${img.width} × ${img.height} pixels</p>
              <p>File Size: ${formatFileSize(file.size)}</p>
            `;

      // Show original preview
      const originalPreview = document.getElementById("originalPreview");
      originalPreview.src = originalImageData;
    };
    img.src = originalImageData;
  };
  reader.readAsDataURL(file);
}

function convertImage() {
  if (!currentFile || !originalImageData) {
    showMessage("Please select an image first.", "error");
    return;
  }

  // Show processing message
  showProcessing();

  // Get conversion settings
  const outputFormat = document.getElementById("outputFormat").value;
  const quality = parseInt(document.getElementById("quality").value) / 100;
  const maxWidth = parseInt(document.getElementById("maxWidth").value) || null;

  // Create image element
  const img = new Image();
  img.onload = function () {
    try {
      // Calculate new dimensions
      let newWidth = img.width;
      let newHeight = img.height;

      if (maxWidth && newWidth > maxWidth) {
        const ratio = maxWidth / newWidth;
        newWidth = maxWidth;
        newHeight = Math.round(newHeight * ratio);
      }

      // Create canvas for conversion
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = newWidth;
      canvas.height = newHeight;

      // Draw image on canvas with new dimensions
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Convert to desired format
      let mimeType = `image/${outputFormat}`;
      let convertedDataURL;

      if (outputFormat === "png") {
        convertedDataURL = canvas.toDataURL(mimeType);
      } else {
        convertedDataURL = canvas.toDataURL(mimeType, quality);
      }

      // Calculate file size
      const convertedSize = Math.round(
        ((convertedDataURL.length - 22) * 3) / 4
      );

      // Display results
      displayConversionResult(
        convertedDataURL,
        outputFormat,
        newWidth,
        newHeight,
        convertedSize
      );
    } catch (error) {
      console.error("Conversion error:", error);
      showMessage("Error converting image. Please try again.", "error");
    }
  };

  img.onerror = function () {
    showMessage("Error loading image. Please try a different file.", "error");
  };

  img.src = originalImageData;
}

function displayConversionResult(
  convertedDataURL,
  format,
  width,
  height,
  fileSize
) {
  // Hide processing message
  hideProcessing();

  // Show conversion result
  const conversionResult = document.getElementById("conversionResult");
  conversionResult.classList.remove("conversion-hidden");

  // Update converted image preview
  const convertedPreview = document.getElementById("convertedPreview");
  convertedPreview.src = convertedDataURL;

  // Update converted image info
  const convertedInfo = document.getElementById("convertedInfo");
  convertedInfo.innerHTML = `
          <p><strong>Converted Image Info</strong></p>
          <p>Format: ${format.toUpperCase()}</p>
          <p>Size: ${width} × ${height} pixels</p>
          <p>File Size: ${formatFileSize(fileSize)}</p>
        `;

  // Update download button
  const downloadBtn = document.getElementById("downloadBtn");
  downloadBtn.href = convertedDataURL;
  downloadBtn.download = `converted-image.${format}`;

  // Show success message
  showMessage("Image converted successfully!", "success");
}

function showProcessing() {
  document
    .getElementById("processingMessage")
    .classList.remove("conversion-hidden");
  document
    .getElementById("conversionResult")
    .classList.add("conversion-hidden");
  clearMessages();
}

function hideProcessing() {
  document
    .getElementById("processingMessage")
    .classList.add("conversion-hidden");
}

function updateQualityVisibility() {
  const format = document.getElementById("outputFormat").value;
  const qualityGroup = document.getElementById("qualityGroup");

  if (format === "png") {
    qualityGroup.style.opacity = "0.5";
    qualityGroup.style.pointerEvents = "none";
  } else {
    qualityGroup.style.opacity = "1";
    qualityGroup.style.pointerEvents = "auto";
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function showMessage(message, type) {
  const container = document.getElementById("messageContainer");
  const messageClass = type === "error" ? "error-message" : "success-message";

  container.innerHTML = `<div class="${messageClass}">${message}</div>`;

  // Auto-hide success messages after 5 seconds
  if (type === "success") {
    setTimeout(() => {
      container.innerHTML = "";
    }, 5000);
  }
}

function clearMessages() {
  document.getElementById("messageContainer").innerHTML = "";
}

function clearAll() {
  // Reset file input
  document.getElementById("fileInput").value = "";
  currentFile = null;
  originalImageData = null;

  // Reset drop zone
  const dropZone = document.getElementById("dropZone");
  dropZone.classList.remove("has-file");
  dropZone.innerHTML = `
          <div class="drop-zone-icon">📷</div>
          <div class="drop-zone-text">Click to select an image or drag & drop</div>
          <div class="drop-zone-subtext">Supports JPEG, PNG, WebP, GIF, BMP (Max 10MB)</div>
        `;

  // Reset form values
  document.getElementById("outputFormat").value = "jpeg";
  document.getElementById("quality").value = "90";
  document.getElementById("maxWidth").value = "1920";

  // Hide results and processing
  document
    .getElementById("conversionResult")
    .classList.add("conversion-hidden");
  document
    .getElementById("processingMessage")
    .classList.add("conversion-hidden");

  // Disable convert button
  document.getElementById("convertBtn").disabled = true;

  // Clear messages
  clearMessages();

  // Update quality visibility
  updateQualityVisibility();
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", function () {
  initializeDragDrop();
  updateQualityVisibility();
});

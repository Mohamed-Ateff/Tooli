let currentQRData = "";
let qr = null;

function initializeQR() {
  // Create a canvas element for QRious
  const canvas = document.createElement("canvas");
  canvas.id = "qr-canvas";

  qr = new QRious({
    element: canvas,
    size: 300,
    value: "",
    foreground: "#0f0f0f",
    background: "#ffffff",
  });
}

function generateQRCode() {
  const text = document.getElementById("qrText").value.trim();

  if (!text) {
    showPlaceholder();
    return;
  }

  // Don't regenerate if the same data
  if (text === currentQRData) {
    return;
  }

  currentQRData = text;

  try {
    const errorCorrection = document.getElementById("errorCorrection").value;
    const size = parseInt(document.getElementById("qrSize").value);

    // Initialize QR if not already done
    if (!qr) {
      initializeQR();
    }

    // Update QR code properties
    qr.set({
      value: text,
      size: size,
      level: errorCorrection,
    });

    displayQRCode(qr.canvas, text);
  } catch (error) {
    console.error("QR Code generation error:", error);
    showError(
      "Error generating QR code. Please check your input and try again."
    );
  }
}

function displayQRCode(canvas, originalText) {
  const qrResult = document.getElementById("qrResult");
  qrResult.innerHTML = "";
  qrResult.classList.add("has-qr");

  // Create container for QR code
  const qrContainer = document.createElement("div");
  qrContainer.className = "qr-code-container";

  // Clone the canvas to avoid issues
  const displayCanvas = document.createElement("canvas");
  displayCanvas.width = canvas.width;
  displayCanvas.height = canvas.height;
  const ctx = displayCanvas.getContext("2d");
  ctx.drawImage(canvas, 0, 0);

  qrContainer.appendChild(displayCanvas);

  // Add download options
  const downloadOptions = document.createElement("div");
  downloadOptions.className = "download-options";

  // PNG Download
  const pngBtn = document.createElement("a");
  pngBtn.className = "download-btn";
  pngBtn.innerHTML = "Download PNG";
  pngBtn.href = displayCanvas.toDataURL("image/png");
  pngBtn.download = "qrcode.png";

  // JPEG Download
  const jpegBtn = document.createElement("a");
  jpegBtn.className = "download-btn";
  jpegBtn.innerHTML = "Download JPEG";
  jpegBtn.href = displayCanvas.toDataURL("image/jpeg", 0.9);
  jpegBtn.download = "qrcode.jpg";

  // Copy to clipboard button
  const copyBtn = document.createElement("button");
  copyBtn.className = "download-btn";
  copyBtn.innerHTML = "Copy Image";
  copyBtn.onclick = () => copyToClipboard(displayCanvas);

  downloadOptions.appendChild(pngBtn);
  downloadOptions.appendChild(jpegBtn);
  downloadOptions.appendChild(copyBtn);

  // Add info about the QR code
  const infoDiv = document.createElement("div");
  infoDiv.className = "qr-info";
  infoDiv.innerHTML = `
                <p><strong>QR Code Generated Successfully!</strong></p>
                <p>Size: ${displayCanvas.width}×${
    displayCanvas.height
  } pixels</p>
                <p>Data: ${
                  originalText.length > 50
                    ? originalText.substring(0, 50) + "..."
                    : originalText
                }</p>
            `;

  qrResult.appendChild(qrContainer);
  qrResult.appendChild(downloadOptions);
  qrResult.appendChild(infoDiv);
}

function copyToClipboard(canvas) {
  try {
    canvas.toBlob(async (blob) => {
      try {
        const item = new ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([item]);

        // Show feedback
        const copyBtn = document.querySelector(
          "button.download-btn:last-child"
        );
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = "✅ Copied!";
        copyBtn.style.background = "#059669";

        setTimeout(() => {
          copyBtn.innerHTML = originalText;
          copyBtn.style.background = "#10b981";
        }, 2000);
      } catch (clipboardError) {
        // Fallback: create a temporary link
        const link = document.createElement("a");
        link.download = "qrcode.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    });
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    // Fallback download
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }
}

function showError(message) {
  const qrResult = document.getElementById("qrResult");
  qrResult.innerHTML = `
                <div class="qr-placeholder">
                    <p style="color: #dc2626;"><strong>Error:</strong></p>
                    <p style="color: #dc2626;">${message}</p>
                </div>
            `;
  qrResult.classList.remove("has-qr");
}

function showPlaceholder() {
  const qrResult = document.getElementById("qrResult");
  qrResult.innerHTML = `
                <div class="qr-placeholder">
                    <p><strong>Your QR code will appear here</strong></p>
                    <p>Enter your data above and the QR code will be generated automatically</p>
                </div>
            `;
  qrResult.classList.remove("has-qr");
  currentQRData = "";
}

function clearAll() {
  document.getElementById("qrText").value = "";
  document.getElementById("errorCorrection").value = "M";
  document.getElementById("qrSize").value = "300";
  showPlaceholder();
  document.getElementById("qrText").focus();
}

// Auto-generate QR code when page loads if there's default text
document.addEventListener("DOMContentLoaded", function () {
  // Initialize QR generator
  initializeQR();

  const qrText = document.getElementById("qrText");
  if (qrText.value.trim()) {
    setTimeout(() => generateQRCode(), 100);
  }

  // Focus on textarea
  qrText.focus();
  qrText.select();
});

// Generate QR code when Enter is pressed in textarea
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("qrText").addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      generateQRCode();
    }
  });
});

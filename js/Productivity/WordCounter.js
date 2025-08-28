/**
 * Updates the word count - simplified for word counting only
 * Called on every input change in the textarea
 */
function updateWordCount() {
  const text = document.getElementById("textInput").value;

  // Calculate main word count
  const words =
    text.trim() === ""
      ? 0
      : text
          .trim()
          .split(/\s+/)
          .filter((word) => word.length > 0).length;

  document.getElementById("mainWordCount").textContent = words.toLocaleString();
}

/**
 * Clears the text input and resets all counters
 */
function clearText() {
  document.getElementById("textInput").value = "";
  updateWordCount();
  document.getElementById("textInput").focus();
}

/**
 * Copies the current word count to clipboard
 */
function copyCount() {
  const count = document.getElementById("mainWordCount").textContent;
  navigator.clipboard
    .writeText(count)
    .then(() => {
      // Provide user feedback
      const btn = event.target;
      const originalText = btn.textContent;
      btn.textContent = "Copied!";
      setTimeout(() => {
        btn.textContent = originalText;
      }, 1000);
    })
    .catch(() => {
      // Fallback for browsers that don't support clipboard API
      console.log("Clipboard copy failed");
    });
}

// Initialize word count on page load
updateWordCount();

// Auto-focus textarea when page loads
window.addEventListener("load", () => {
  document.getElementById("textInput").focus();
});

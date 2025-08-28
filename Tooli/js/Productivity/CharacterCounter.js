/**
 * Updates the character count
 * Called on every input change in the textarea
 */
function updateCharCount() {
  const text = document.getElementById("textInput").value;
  const chars = text.length;
  document.getElementById("mainCharCount").textContent = chars.toLocaleString();
}

/**
 * Clears the text input and resets the counter
 */
function clearText() {
  document.getElementById("textInput").value = "";
  updateCharCount();
  document.getElementById("textInput").focus();
}

/**
 * Copies the current character count to clipboard
 */
function copyCount() {
  const count = document.getElementById("mainCharCount").textContent;
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

// Initialize character count on page load
updateCharCount();

// Auto-focus textarea when page loads
window.addEventListener("load", () => {
  document.getElementById("textInput").focus();
});

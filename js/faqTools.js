/**
 * Toggles FAQ item open/closed state
 * @param {HTMLElement} button - The clicked FAQ question button
 */
function toggleFAQ(button) {
  const faqItem = button.closest(".faq-item");
  const isActive = faqItem.classList.contains("active");

  // Close all other FAQ items
  document.querySelectorAll(".faq-item.active").forEach((item) => {
    if (item !== faqItem) {
      item.classList.remove("active");
    }
  });

  // Toggle current item
  if (isActive) {
    faqItem.classList.remove("active");
  } else {
    faqItem.classList.add("active");
  }
}

// Close FAQ when clicking outside
document.addEventListener("click", (e) => {
  if (!e.target.closest(".faq-item")) {
    document.querySelectorAll(".faq-item.active").forEach((item) => {
      item.classList.remove("active");
    });
  }
});

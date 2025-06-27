//Hide and show sections
function setupTabNavigation(buttonSelector, sectionSelector) {
  const buttons = document.querySelectorAll(buttonSelector);
  const sections = document.querySelectorAll(sectionSelector);

  buttons.forEach(button => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      buttons.forEach(btn => btn.classList.remove("active"));
      sections.forEach(section => section.classList.add("hide"));

      this.classList.add("active");

      const sectionId = this.getAttribute("data-section");
      const activeSection = document.getElementById(sectionId);
      if (activeSection) {
        activeSection.classList.remove("hide");
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  setupTabNavigation(".nav-btn", ".content-table");
  setupTabNavigation(".nav-btn-videos", ".content-table-videos");
  setupTabNavigation(".nav-btn-shorts", ".content-table-shorts");
  setupTabNavigation(".nav-btn-posts", ".content-table-posts");
});
// Carrusel
function scrollCarousel(direction, containerId) {
  const container = document.getElementById(containerId);
  let scrollAmount;

  switch (containerId) {
    case 'carousel-foryou':
      scrollAmount = 400;
      break;
    case 'videos-container':
      scrollAmount = 325;
      break;
    case 'popular-container':
      scrollAmount = 325;
      break;
    case 'carousel-shorts':
      scrollAmount = 270;
      break; 
  }

  if (direction === 'left') {
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  } else {
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
}

//Hide and show sections
 function setupTabNavigation(buttonSelector, sectionSelector) {
  const buttons = document.querySelectorAll(buttonSelector);
  const sections = document.querySelectorAll(sectionSelector);

  buttons.forEach(button => {
    button.addEventListener("click", function () {
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
// Carousel //
function scrollCarousel(direction, carouselId) {
    const carousel = document.querySelector(`.${carouselId}`);
    const scrollAmount = 200; // Cantidad de desplazamiento en píxeles

    if (direction === 'left') {
        carousel.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    } else if (direction === 'right') {
        carousel.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    }
}

// Extend left menu
const sidebar = document.querySelector('.sidebar');
const sidebarToggler = document.querySelector('.sidebar-toggler');

sidebarToggler?.addEventListener('click', e => {
  e.stopPropagation();
  sidebar.classList.toggle('collapsed');
});

document.addEventListener('click', e => {
  if (!sidebar.classList.contains('collapsed') && !sidebar.contains(e.target) && e.target !== sidebarToggler) {
    sidebar.classList.add('collapsed');
  }
});


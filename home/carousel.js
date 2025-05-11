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

const sidebar = document.querySelector('.sidebar');
const sidebarToggler = document.querySelector('.sidebar-toggler');

// Toggle sidebar on button click
sidebarToggler.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
});
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

// const sidebar = document.querySelector('.sidebar');
// const sidebarToggler = document.querySelector('.sidebar-toggler');

// // Toggle sidebar on button click
// sidebarToggler.addEventListener('click', () => {
//     sidebar.classList.toggle('collapsed');
// });

// --- MENÚ IZQUIERDO (por botón) ---
const sidebar = document.querySelector('.sidebar');
const sidebarToggler = document.querySelector('.sidebar-toggler');

sidebarToggler?.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
});

// --- MENÚ USUARIO (derecho, hover) ---
const userSidebar = document.querySelector('.ts-sidebar');
const userBtn = document.querySelector('.user-btn');

let userHideTimeout;

userBtn?.addEventListener('mouseenter', () => {
  userSidebar?.classList.remove('collapsed');
  clearTimeout(userHideTimeout);
});

userBtn?.addEventListener('mouseleave', () => {
  userHideTimeout = setTimeout(() => {
    userSidebar?.classList.add('collapsed');
  }, 200);
});

userSidebar?.addEventListener('mouseenter', () => {
  clearTimeout(userHideTimeout);
});

userSidebar?.addEventListener('mouseleave', () => {
  userSidebar?.classList.add('collapsed');
});



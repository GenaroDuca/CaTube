// Carousel que funciona con varios carruseles con la misma clase
var buttons = document.querySelectorAll('.carousel-btn');
for (var i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('click', function () {
    var direction = this.getAttribute('data-direction');
    // Busca el carrusel más cercano con la clase conocida
    var carousel = this.parentElement.querySelector('.recommendations-container, .carousel-trends, .carousel-subs, .carousel-channels, .recommendations-container');
    if (!carousel) return;
    var scrollAmount = carousel.offsetWidth * 0.8;
    if (direction === 'left') {
      carousel.scrollLeft -= scrollAmount;
    } else {
      carousel.scrollLeft += scrollAmount;
    }
  });
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
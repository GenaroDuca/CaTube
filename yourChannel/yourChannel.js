function scrollCarousel(direction, containerId) {
  const container = document.getElementById(containerId);
  const scrollAmount = 400; // puede ajustarse a 390 o más

  if (direction === 'left') {
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  } else {
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
}
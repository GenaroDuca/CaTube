const carouselButtons = document.querySelectorAll('.carousel-btn');
carouselButtons.forEach(button => {
    button.addEventListener('click', function () {
        const direction = this.getAttribute('data-direction');
        const carousel = this.parentElement.querySelector(
            '.recommendations-container, .carousel-trends, .carousel-subs, .carousel-channels'
        );
        if (!carousel) return;
        const scrollAmount = carousel.offsetWidth * 0.8;
        if (direction === 'left') {
            carousel.scrollLeft -= scrollAmount;
        } else {
            carousel.scrollLeft += scrollAmount;
        }
    });
});
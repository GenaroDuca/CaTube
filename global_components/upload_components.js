'use strict';

// Logic to extends menus and show modals
document.addEventListener('click', (e) => {
    
    // Show movil search bar
    if (e.target.closest('.search-btn-responsive')) {
        e.stopPropagation();
        const micSection = document.querySelector('.mic-section');
        const barSection = document.querySelector('.bar-section');
        const rightSection = document.querySelector('.right-section');
        const leftSection = document.querySelector('.left-section');
        const searchBtnResponsive = document.querySelector('.search-btn-responsive');

        micSection.classList.add('active');
        barSection.classList.add('active');
        rightSection.classList.add('hide');
        searchBtnResponsive.classList.add('hide');
        leftSection.classList.add('hide');
    }

    // Hide movil search bar
    const micSection = document.querySelector('.mic-section');
    const barSection = document.querySelector('.bar-section');
    const rightSection = document.querySelector('.right-section');
    const leftSection = document.querySelector('.left-section');
    const searchBtnResponsive = document.querySelector('.search-btn-responsive');
    const header = document.querySelector('.header');

    if (
        barSection && barSection.classList.contains('active') &&
        header && !header.contains(e.target)
    ) {
        micSection.classList.remove('active');
        barSection.classList.remove('active');
        rightSection.classList.remove('hide');
        searchBtnResponsive.classList.remove('hide');
        leftSection.classList.remove('hide');
    }
});



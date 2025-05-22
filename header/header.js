document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header');
    const searchButton = document.querySelector('.search-btn');
    const searchInput = document.querySelector('.search-section input[type="text"]');

    if (header && searchButton && searchInput) {
        searchButton.addEventListener('click', () => {
            if (header.classList.contains('search-active')) {

                if (searchInput.value === '') {
                    header.classList.remove('search-active');
                } else {

                    console.log('BuscanSdo:', searchInput.value);
                }
            } else {
                header.classList.add('search-active');
                searchInput.focus();
            }
        });

        searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                if (document.activeElement !== searchButton && searchInput.value === '') {
                    header.classList.remove('search-active');
                }
            }, 100);
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && header.classList.contains('search-active')) {
                header.classList.remove('search-active');
            }
        });
    }
});


const sidebar = document.querySelector('.rsm-sidebar');
const sidebarToggler = document.querySelector('.rsm-sidebar-toggler');

sidebarToggler.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
});

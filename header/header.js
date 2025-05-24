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

    // --- Extends Right menu ---
    const userSidebar = document.querySelector('.ts-sidebar');
    const userBtn = document.querySelector('.user-btn');

    userBtn?.addEventListener('click', e => {
        e.stopPropagation();
        userSidebar.classList.toggle('collapsed');
    });

    document.addEventListener('click', e => {
        if (!userSidebar.classList.contains('collapsed') && !userSidebar.contains(e.target) && e.target !== userBtn) {
            userSidebar.classList.add('collapsed');
        }
    });

    // Soon modal
    document.addEventListener('click', function (e) {
        const soonLink = e.target.closest('a.soon');
        if (soonLink) {
            e.preventDefault();
            document.getElementById('soon-modal').style.display = 'flex';
        }
        if (e.target.id === 'soon-modal') {
            e.target.style.display = 'none';
        }
    });
    document.getElementById('close-soon-modal').onclick = function () {
        document.getElementById('soon-modal').style.display = 'none';
    };

});

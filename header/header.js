document.addEventListener('DOMContentLoaded', () => {
    // --- Header Search ---
    const header = document.querySelector('.header');
    const searchButton = document.querySelector('.search-btn');
    const searchInput = document.querySelector('.search-section input[type="text"]');

    if (header && searchButton && searchInput) {
        searchButton.addEventListener('click', () => {
            if (header.classList.contains('search-active')) {
                if (searchInput.value === '') {
                    header.classList.remove('search-active');
                } else {
                    console.log('Searching:', searchInput.value);
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

    // --- Right Sidebar Menu ---
    const userSidebar = document.querySelector('.ts-sidebar');
    const userBtn = document.querySelector('.user-btn');

    if (userBtn && userSidebar) {
        userBtn.addEventListener('click', e => {
            e.stopPropagation();
            userSidebar.classList.toggle('collapsed');
        });
        
        // Close sidebar when clicking outside
        document.addEventListener('click', e => {
            const isModal = e.target.closest('.right-menu-modal');
            if (
                !userSidebar.classList.contains('collapsed') &&
                !userSidebar.contains(e.target) &&
                e.target !== userBtn &&
                !isModal
            ) {
                userSidebar.classList.add('collapsed');
            }
        });
    }

    // --- "Soon" Modal ---
    const soonModal = document.getElementById('soon-modal');
    const closeSoonModal = document.getElementById('close-soon-modal');

    document.addEventListener('click', function (e) {
        const soonLink = e.target.closest('a.soon');
        if (soonLink && soonModal) {
            e.preventDefault();
            soonModal.style.display = 'flex';
        }
        if (e.target === soonModal) {
            soonModal.style.display = 'none';
        }
    });

    if (closeSoonModal && soonModal) {
        closeSoonModal.onclick = function () {
            soonModal.style.display = 'none';
        };
    }

    // --- Right Menu Modals ---
    const rightMenuBtns = document.querySelectorAll('.right-menu-modal-btn');
    const rightModals = document.querySelectorAll('.right-menu-modal');

    // Show modals
    rightMenuBtns.forEach((btn, idx) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            rightModals.forEach(modal => {
                modal.style.display = 'none';
            });
            if (rightModals[idx]) {
                rightModals[idx].style.display = 'flex';
            }
        });
    });

    // Close modals by clicking outside or on close button
    rightModals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                e.stopPropagation();
                modal.style.display = 'none';
            }
        });
        // Close button
        const closeBtn = modal.querySelector('.close-right-menu-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                modal.style.display = 'none';
            });
        }
    });
});

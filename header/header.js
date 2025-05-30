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

userBtn.addEventListener('click', e => {
    e.stopPropagation();
    userSidebar.classList.toggle('collapsed');
    if (!friendsContainer.classList.contains('collapsed')) {
        friendsContainer.classList.add('collapsed');
    }
});

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

// Extend left menu
const sidebar = document.querySelector('.sidebar');
const sidebarToggler = document.querySelector('.sidebar-toggler');
sidebarToggler.addEventListener('click', e => {
    e.stopPropagation();
    sidebar.classList.toggle('collapsed');
});


// carousel
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

// Extend notification 
const notificationContainer = document.querySelector('.notifications-sidebar');
const notificationBtn = document.querySelector('.notify-btn');

notificationBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    notificationContainer.classList.toggle('collapsed');
});


// Extend friends 
const friendsBtn = document.querySelector('.friends-btn');
const friendsContainer = document.querySelector('.friends-sidebar');
friendsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    friendsContainer.classList.toggle('collapsed');
});


// close menus when clicking outside
document.addEventListener('click', (e) => {

    if (
        !notificationContainer.classList.contains('collapsed') &&
        !notificationContainer.contains(e.target) &&
        e.target !== notificationBtn || !friendsContainer.classList.contains('collapsed') &&
        !friendsContainer.contains(e.target) &&
        e.target !== friendsContainer || sidebar &&
        !sidebar.classList.contains('collapsed') &&
        !sidebar.contains(e.target) &&
        e.target !== sidebarToggler
        || !userSidebar.classList.contains('collapsed') &&
        !userSidebar.contains(e.target) &&
        e.target !== userBtn
    ) {
        notificationContainer.classList.add('collapsed');
        friendsContainer.classList.add('collapsed');
        sidebar.classList.add('collapsed');
        userSidebar.classList.add('collapsed');

    }
});

// Btn search friends
const openSearchFriendBtn = document.querySelector('.open-search-friend-btn');
const friendsHeaderOne = document.querySelector('.friends-header-one');
const friendsHeaderTwo = document.querySelector('.friends-header-two');
const searchFriendInput = document.querySelector('.search-friend-input'); // Asegúrate que tu input tenga esta clase o cámbiala por el selector correcto

openSearchFriendBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    
    friendsHeaderOne.classList.add("hide");
    friendsHeaderTwo.classList.remove("hide");
});

const backtoFriendHeaderOneBtn = document.querySelector('.back-to-friends-header-one');
backtoFriendHeaderOneBtn.addEventListener('click', (e) => {
    e.stopPropagation();

    friendsHeaderOne.classList.remove("hide");
    friendsHeaderTwo.classList.add("hide");
    if (searchFriendInput) searchFriendInput.value = '';
});
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
        if (friendsContainer && !friendsContainer.classList.contains('collapsed')) {
            friendsContainer.classList.add('collapsed');
        }
    });
}

// --- "Soon" Modal ---
const soonModal = document.getElementById('soon-modal');
const closeSoonModal = document.getElementById('close-soon-modal');
const soonModalBtn = document.querySelectorAll('.soon');

soonModalBtn.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (soonModal) soonModal.style.display = 'flex';
    });
});

// Close "Soon" modal
if (closeSoonModal && soonModal) {
    closeSoonModal.onclick = function () {
        soonModal.style.display = 'none';
    };
}

// --- Right Menu Modals ---
const rightMenuBtns = document.querySelectorAll('.right-menu-modal-btn');
const rightModals = document.querySelectorAll('.right-menu-modal');

// Show modals
rightMenuBtns.forEach((btn, modal) => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        rightModals.forEach(modal => {
            modal.style.display = 'none';
        });
        if (rightModals[modal]) {
            rightModals[modal].style.display = 'flex';
        }
    });
});

// Close modals
const closeRightModalsBtn = document.querySelectorAll('.close-right-menu-modal');
closeRightModalsBtn.forEach((btn, modal) => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (rightModals[modal]) {
            rightModals[modal].style.display = 'none';
        }
    });
});

// Extend left menu
const sidebar = document.querySelector('.sidebar');
const sidebarToggler = document.querySelector('.sidebar-toggler');

if (sidebarToggler && sidebar) {
    sidebarToggler.addEventListener('click', e => {
        e.stopPropagation();
        sidebar.classList.toggle('collapsed');
    });
}

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

// Btn search friends
const openSearchFriendBtn = document.querySelector('.open-search-friend-btn');
const friendsHeaderOne = document.querySelector('.friends-header-one');
const friendsHeaderTwo = document.querySelector('.friends-header-two');
const searchFriendInput = document.querySelector('.search-friend-input');

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

// Friends offline/online/occupied 
const friendsCards = document.querySelectorAll(".friend-card");

const inviteFriendBtn = document.querySelectorAll(".invite-friend-btn");
const chatFriendBtn = document.querySelectorAll(".chat-friend-btn");
const friendImg = document.querySelectorAll(".friend-img");

for (let i = 0; i < friendsCards.length; i++) {

    if (friendsCards[i].classList.contains("offline-friend")) {
        inviteFriendBtn[i].classList.add("gray")
        chatFriendBtn[i].classList.add("gray")
        friendImg[i].classList.add("gray")
    } else if (friendsCards[i].classList.contains("occupied-friend")) {
        inviteFriendBtn[i].classList.add("gray")
        chatFriendBtn[i].classList.add("gray")
        friendImg[i].classList.add("gray")
    }
}

// Create Video Modal
const createVideoModal = document.querySelector('.create-video-modal');
const closeCreateVideoModal = document.querySelector('.close-create-video-modal');
const createVideoModalBtn = document.querySelector('.create-video-btn');

createVideoModalBtn.addEventListener('click', () => {
    if (createVideoModal) createVideoModal.style.display = 'flex';
});

// Close create video modal 
if (closeCreateVideoModal && createVideoModal) {
    closeCreateVideoModal.onclick = function () {
        createVideoModal.style.display = 'none';
    };
}

document.addEventListener('DOMContentLoaded', () => {

    // Seleccionar todos los botones de navegación y todas las secciones de contenido
    const settingsButtons = document.querySelectorAll('.settings-option-btn');
    const settingsSections = document.querySelectorAll('.setting-section');

    // Añadir un evento de clic a cada botón
    settingsButtons.forEach((button, index) => {
        button.addEventListener('click', () => {

            // --- 1. Resetear el estado de todos los elementos ---

            // Quitar la clase 'active' de todos los botones
            settingsButtons.forEach(btn => {
                btn.classList.remove('active');
            });

            // Ocultar todas las secciones añadiendo la clase 'hide'
            settingsSections.forEach(section => {
                section.classList.add('hide');
            });


            // --- 2. Establecer el estado activo para el elemento clickeado ---

            // Añadir la clase 'active' solo al botón que fue clickeado
            button.classList.add('active');

            // Mostrar la sección correspondiente al botón clickeado (usando el índice)
            if (settingsSections[index]) {
                settingsSections[index].classList.remove('hide');
            }
        });
    });
});
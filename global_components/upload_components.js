document.addEventListener("DOMContentLoaded", function () {
    const loadComponent = (selector, url) => {
        const container = document.querySelector(selector);
        if (!container) {
            return;
        }

        fetch(url)
            .then(response => response.text())
            .then(data => {
                container.innerHTML = data;
            })
            .catch(error => console.error(`Error when upload component ${url}:`, error));
    };

    loadComponent("header", "/global_components/header.html");
    loadComponent("footer", "/global_components/footer.html");
    loadComponent("#leftContainer", "/global_components/menus.html");
});

// Logic to extends menus and show modals
document.addEventListener('click', (e) => {
    // LEFT MENU
    if (e.target.closest('.sidebar-toggler')) { // if the clicked element is .sidebar-toggler --> ***Closest*** searches up the DOM tree for the closest ancestor that matches the selector
        e.stopPropagation();
        // Sidebar
        const sidebar = document.querySelector('.sidebar');

        // Si sidebar exists
        if (sidebar) {
            sidebar.classList.toggle('collapsed');
        }
    }

    // RIGHT MENU
    if (e.target.closest('.user-btn')) {
        e.stopPropagation();
        // Sidebar
        const sidebar = document.querySelector('.ts-sidebar');
        const friendsSidebar = document.querySelector('.friends-sidebar');

        // Si sidebar exists
        if (sidebar) {
            sidebar.classList.toggle('collapsed');
            if (sidebar.classList.contains('collapsed') && friendsSidebar && !friendsSidebar.classList.contains('collapsed')) {
                friendsSidebar.classList.add('collapsed');
            }
        }
    }

    // NOTIFICATION SECTION
    if (e.target.closest('.notify-btn')) {
        e.stopPropagation();
        // Sidebar
        const sidebar = document.querySelector('.notifications-sidebar');

        // Si sidebar exists
        if (sidebar) {
            sidebar.classList.toggle('collapsed');
        }
    }

    // FRIENDS SECTION & SET FRIEND STYLE WHEN STATUS IS ONLINE/ OCCUPIED / OFFLINE & SHOW/HIDE FRIEND INPUT SEARCH
    if (e.target.closest('.friends-btn')) {
        e.stopPropagation();
        // Sidebar
        const sidebar = document.querySelector('.friends-sidebar');

        // Si sidebar exists
        if (sidebar) {
            sidebar.classList.toggle('collapsed');
        }
    }

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

    // CREATE VIDEO MODAL
    if (e.target.closest('.create-video-btn')) {
        e.stopPropagation();
        // if modal
        const modal = document.querySelector('.create-video-modal');
        const closeModal = document.querySelector('.close-create-video-modal');

        // If modal exists
        if (modal) {
            modal.style.display = 'flex';
        }

        if (modal && closeModal) {
            closeModal.addEventListener("click", () => {
                modal.style.display = 'none';
            });
        }
    }

    // SOON MODAL 
    if (e.target.closest('.soon')) {
        const soonModal = document.getElementById('soon-modal');
        const closeSoonModal = document.getElementById('close-soon-modal');

        if (soonModal) {
            soonModal.style.display = 'flex';
        }

        if (closeSoonModal) {
            closeSoonModal.addEventListener("click", () => {
                soonModal.style.display = 'none';
            });
        }
    }

    // RIGHT MENU MODALS -- SETTINS / HEP / SENDFEEDBACK
    if (e.target.closest('.right-menu-modal-btn')) {
        e.stopPropagation();
        const rightMenuBtns = Array.from(document.querySelectorAll('.right-menu-modal-btn')); // CONVERT HTML COLLECTION TO ARRAY
        const rightModals = document.querySelectorAll('.right-menu-modal');

        const btn = e.target.closest('.right-menu-modal-btn');
        const index = rightMenuBtns.indexOf(btn);

        // Oculta todos los modales antes de mostrar el correspondiente
        rightModals.forEach(modal => {
            modal.style.display = 'none';
        });

        // Show especific modal
        if (rightModals[index]) {
            rightModals[index].style.display = 'flex';
        }

        // Close modals
        const closeRightModalsBtn = document.querySelectorAll('.close-right-menu-modal');
        closeRightModalsBtn.forEach((closeBtn, i) => {
            closeBtn.addEventListener('click', (ev) => {
                ev.stopPropagation();
                if (rightModals[i]) {
                    rightModals[i].style.display = 'none';
                }
            });
        });
    }

    // SETTINGS MODAL OPTIONS
    const settingsButtons = document.querySelectorAll('.settings-option-btn');
    const settingsSections = document.querySelectorAll('.setting-section');

    settingsButtons.forEach((button, index) => {
        button.addEventListener('click', () => {

            // --- 1. Resetear el estado de todos los elementos ---

            // RESET
            settingsButtons.forEach(btn => {
                btn.classList.remove('active');
            });

            // HIDE SECTIONS
            settingsSections.forEach(section => {
                section.classList.add('hide');
            });

            // ACTIVE CLICKED BUTTON
            button.classList.add('active');

            // SHOW SECTION
            if (settingsSections[index]) {
                settingsSections[index].classList.remove('hide');
            }
        });
    });

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


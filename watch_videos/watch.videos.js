document.addEventListener('DOMContentLoaded', () => {
    const videoElement = document.getElementById('player');
    if (!videoElement) {
        console.error("Elemento de video #player no encontrado.");
        return;
    }

    const theaterButtonHTML = `
        <button type="button" class="plyr__control" data-plyr="theater" aria-label="Theater mode" title="Theater mode">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="7" width="20" height="10" rx="2" ry="2"></rect>
                <line x1="2" y1="12" x2="22" y2="12"></line>
            </svg>
            <span class="plyr__tooltip">Theater mode</span>
        </button>
    `;

    const player = new Plyr(videoElement, {
        controls: [
            'play-large',
            'play',
            'progress',
            'current-time',
            'mute',
            'volume',
            'captions',
            'settings',
            'pip',
            'airplay',
            'theater',
            'fullscreen'
        ],
        disableContextMenu: true,
        hideControls: false,
        i18n: {
            theater: 'Theater mode',
            exitTheater: 'Exit theater mode'
        },
        listeners: {
            controlshidden: () => {
            },
            controlsshown: () => {
            },
        },
    });

    const containerAll = document.querySelector('.container-all');

    function toggleTheaterMode() {
        const bodyElement = document.body;

        if (containerAll) {
            containerAll.classList.toggle('theater-mode-active');

            if (containerAll.classList.contains('theater-mode-active')) {
                bodyElement.classList.add('in-theater-mode');
            } else {
                bodyElement.classList.remove('in-theater-mode');
            }

            const plyrInstance = player;
            const plyrTheaterButton = plyrInstance.elements.buttons.theater;

            if (plyrTheaterButton) {
                const iconElement = plyrTheaterButton.querySelector('svg') || plyrTheaterButton.querySelector('i');
                const tooltipElement = plyrTheaterButton.querySelector('.plyr__tooltip');
                const i18n = plyrInstance.config.i18n;

                if (containerAll.classList.contains('theater-mode-active')) {
                    plyrTheaterButton.setAttribute('aria-label', i18n.exitTheater || 'Exit theater mode');
                    plyrTheaterButton.setAttribute('title', i18n.exitTheater || 'Exit theater mode');
                    if (tooltipElement) tooltipElement.textContent = i18n.exitTheater || 'Exit theater mode';

                    if (iconElement && iconElement.tagName.toLowerCase() === 'svg') {
                        iconElement.innerHTML = `
                            <path d="M15 3h6v6h-2V5h-4V3zm-2 12H7v4H5v-6h6v2zm-2-8L7 3H5v6h2V7l4-4V3zm6 8l4 4v2h-6v-2h2l-4-4v-2z"></path> 
                            <path d="M15 3h6v6h-2V5h-4V3zM9 21H3v-6h2v4h4v2zM3 9V3h6v2H5v4H3zm12 12v-6h6v2h-4v4h-2z"></path>`;
                    } else if (iconElement) {
                    }
                    plyrTheaterButton.classList.add('plyr__control--active');
                } else {
                    plyrTheaterButton.setAttribute('aria-label', i18n.theater || 'Theater mode');
                    plyrTheaterButton.setAttribute('title', i18n.theater || 'Theater mode');
                    if (tooltipElement) tooltipElement.textContent = i18n.theater || 'Theater mode';

                    if (iconElement && iconElement.tagName.toLowerCase() === 'svg') {
                        iconElement.innerHTML = `
                            <rect x="2" y="7" width="20" height="10" rx="1" ry="1"></rect>
                        `;
                    } else if (iconElement) {
                    }
                    plyrTheaterButton.classList.remove('plyr__control--active');
                }
            }
        }
        window.dispatchEvent(new Event('resize'));
    }

    player.on('ready', (event) => {
        const instance = event.detail.plyr;
        const controlBar = instance.elements.controls;

        if (controlBar) {
            const customButton = document.createElement('button');
            customButton.type = 'button';
            customButton.className = 'plyr__control';
            customButton.setAttribute('data-plyr', 'theater');
            customButton.setAttribute('aria-label', instance.config.i18n.theater || 'Theater mode');
            customButton.title = instance.config.i18n.theater || 'Theater mode';

            customButton.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="7" width="20" height="10" rx="2" ry="2"></rect>
                    <line x1="2" y1="12" x2="22" y2="12" stroke-width="2"></line>
                </svg>
                <span class="plyr__tooltip">${instance.config.i18n.theater || 'Theater mode'}</span>
            `;

            customButton.addEventListener('click', () => toggleTheaterMode());

            const fullscreenButton = controlBar.querySelector('[data-plyr="fullscreen"]');
            if (fullscreenButton) {
                fullscreenButton.parentNode.insertBefore(customButton, fullscreenButton);
            } else {
                const settingsButton = controlBar.querySelector('[data-plyr="settings"]');
                if (settingsButton) {
                    settingsButton.parentNode.insertBefore(customButton, settingsButton.nextSibling);
                } else {
                    controlBar.appendChild(customButton);
                }
            }

            if (!instance.elements.buttons.theater) {
                instance.elements.buttons.theater = customButton;
            }
        }
    });

    videoElement.addEventListener('contextmenu', e => e.preventDefault());

    // Usuario no logueado:
    const currentUserID = null;
    const channelOwnerID = 'angel';
    let isSubscribed = false;

    // Dueño del canal:
    //    const currentUserID = 'angel'; 
    //     const channelOwnerID = 'angel'; 
    //     let isSubscribed = false;

    // Usuario suscripto:
    // const currentUserID = 'gena';
    // const channelOwnerID = 'angel'; 
    // let isSubscribed = true;

    // Usuario no suscripto:
    // const currentUserID = 'gena';
    // const channelOwnerID = 'angel';
    // let isSubscribed = false;

    const subscribeButton = document.querySelector('.action-button-subscribe');
    const analyticsButton = document.querySelector('.action-button-analytics');
    const editVideoButton = document.querySelector('.action-button-edit');

    if (subscribeButton && analyticsButton && editVideoButton) {
        if (currentUserID && currentUserID === channelOwnerID) {
            subscribeButton.style.display = 'none';
            analyticsButton.style.display = 'inline-block'; 
            editVideoButton.style.display = 'inline-block'; 
            console.log("Mostrando botones de dueño del canal.");
        } else if (currentUserID) {
            subscribeButton.style.display = 'inline-block'; 
            analyticsButton.style.display = 'none';
            editVideoButton.style.display = 'none';

            if (isSubscribed) {
                subscribeButton.textContent = 'Unsubscribe';      
            } else {
                subscribeButton.textContent = 'Suscribe';
            }
            console.log("Mostrando botón de suscribir para visitante.");
        } else {
            subscribeButton.style.display = 'inline-block'; 
            subscribeButton.textContent = 'Log in to subscribe'; 
            analyticsButton.style.display = 'none';
            editVideoButton.style.display = 'none';
            console.log("Usuario no logueado, mostrando botón de suscribir.");
        }
    } else {
        console.warn("No se encontraron todos los botones de acción del canal.");
    }

    if (subscribeButton) {
        subscribeButton.addEventListener('click', () => {
            if (!currentUserID) {
                alert("Please log in to subscribe!");
                // Redirigir a la página de login.
                return;
            }

            if (isSubscribed) {
                console.log('API Call: Unsubscribe');
                isSubscribed = false;
                subscribeButton.textContent = 'Suscribe';
            } else {
                console.log('API Call: Subscribe');
                isSubscribed = true;
                subscribeButton.textContent = 'Unsubscribe';
            }
        });
    }
    if (analyticsButton) {
        analyticsButton.addEventListener('click', () => {
            console.log("Ir a Analytics");
              // Redirigir a la página de Analytics.
        });
    }
    if (editVideoButton) {
        editVideoButton.addEventListener('click', () => {
            console.log("Ir a Editar Video");
            // Redirigir a la página de Edit Video.
        });
    }
});
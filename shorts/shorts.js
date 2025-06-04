document.addEventListener('DOMContentLoaded', function () {
    const video = document.getElementById('shortVideo');
    if (!video) {
        console.error("Elemento video con id 'shortVideo' no encontrado.");
        return;
    }

    const playPauseBtn = document.getElementById('playPauseBtn');
    const playPauseImg = playPauseBtn ? playPauseBtn.querySelector('img') : null;

    const soundMuteBtn = document.getElementById('soundMuteBtn');
    const soundMuteImg = soundMuteBtn ? soundMuteBtn.querySelector('img') : null;

    if (!playPauseBtn || !playPauseImg || !soundMuteBtn || !soundMuteImg) {
        console.error("Faltan elementos de UI (botones o imágenes).");
        return;
    }

    const playIconSrc = playPauseBtn.dataset.playSrc;
    const pauseIconSrc = playPauseBtn.dataset.pauseSrc;
    const soundIconSrc = soundMuteBtn.dataset.soundSrc;
    const muteIconSrc = soundMuteBtn.dataset.muteSrc;

    if (!playIconSrc || !pauseIconSrc || !soundIconSrc || !muteIconSrc) {
        console.error("Faltan uno o más data attributes para los iconos en los botones.");
        return;
    }

    function updatePlayPauseIcon() {
        if (video.paused) {
            playPauseImg.src = playIconSrc;
            playPauseImg.alt = 'play';
        } else {
            playPauseImg.src = pauseIconSrc;
            playPauseImg.alt = 'pause';
        }
    }

    function updateSoundMuteIcon() {
        if (video.muted) {
            soundMuteImg.src = muteIconSrc;
            soundMuteImg.alt = 'unmute';
        } else {
            soundMuteImg.src = soundIconSrc;
            soundMuteImg.alt = 'mute';
        }
    }

    console.log("Estado inicial del video - Paused:", video.paused);
    console.log("Estado inicial del video - Muted:", video.muted);
    console.log("Estado inicial del video - Autoplay attribute:", video.hasAttribute('autoplay'));

    updatePlayPauseIcon();
    updateSoundMuteIcon();

    playPauseBtn.addEventListener('click', function () {
        if (video.paused) {
            video.play().then(() => {
                console.log("Video.play() llamado y promesa resuelta.");
            }).catch(error => {
                console.error("Error al intentar video.play():", error);
            });
        } else {
            video.pause();
            console.log("Video.pause() llamado.");
        }
    });

    soundMuteBtn.addEventListener('click', function () {
        video.muted = !video.muted;
        console.log("Video.muted cambiado a:", video.muted);
    });

    video.addEventListener('play', () => {
        console.log("Evento 'play' del video disparado.");
        updatePlayPauseIcon();
    });
    video.addEventListener('pause', () => {
        console.log("Evento 'pause' del video disparado.");
        updatePlayPauseIcon();
    });
    video.addEventListener('volumechange', () => {
        console.log("Evento 'volumechange' del video disparado. Muted:", video.muted);
        updateSoundMuteIcon();
    });

    video.addEventListener('canplay', () => {
        console.log("Evento 'canplay' del video disparado.");
        updatePlayPauseIcon();
        updateSoundMuteIcon();
    });

    video.addEventListener('loadedmetadata', () => {
        console.log("Evento 'loadedmetadata' del video disparado. Duración:", video.duration);
        updatePlayPauseIcon();
        updateSoundMuteIcon();
        console.log("Después de loadedmetadata - Paused:", video.paused, "Muted:", video.muted);
    });

    video.addEventListener('error', (e) => {
        console.error("Error en el elemento video:", e);
    });

    console.log("Shorts.js cargado y configurado.");

    const maximizeBtns = document.querySelectorAll('#maximize');
    let fullscreenOverlay = document.getElementById('fullscreenShortOverlay');
    let currentlyMaximizedShort = null;

    if (!fullscreenOverlay) {
        fullscreenOverlay = document.createElement('div');
        fullscreenOverlay.id = 'fullscreenShortOverlay';
        fullscreenOverlay.className = 'fullscreen-short-overlay';
        document.body.appendChild(fullscreenOverlay);
        fullscreenOverlay.addEventListener('click', function (event) {
            if (event.target === fullscreenOverlay) {
                if (currentlyMaximizedShort) {
                    toggleMaximizeState(currentlyMaximizedShort.querySelector('#maximize'));
                }
            }
        });
    }

    function toggleMaximizeState(buttonElement) {
        const shortBlock = buttonElement.closest('.short-block');
        if (!shortBlock) return;

        const isMaximized = shortBlock.classList.contains('maximized');

        if (isMaximized) {
            // Minimizar
            shortBlock.classList.remove('maximized');
            if (fullscreenOverlay) fullscreenOverlay.classList.remove('active');
            document.body.classList.remove('short-maximized-active');

            buttonElement.innerHTML = '<img src="../media/studio_media/maximize.png" alt="Maximize">';
            buttonElement.setAttribute('title', 'Maximize');
            currentlyMaximizedShort = null;
        } else {
            shortBlock.classList.add('maximized');
            if (fullscreenOverlay) fullscreenOverlay.classList.add('active');
            document.body.classList.add('short-maximized-active');

            buttonElement.innerHTML = '<img src="../media/short_media/gg_minimize.png" alt="Minimize">';
            buttonElement.setAttribute('title', 'Minimize');
            currentlyMaximizedShort = shortBlock;
        }
    }

    maximizeBtns.forEach(btn => {
        btn.addEventListener('click', function (event) {
            event.stopPropagation();
            toggleMaximizeState(this);
        });
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && document.body.classList.contains('short-maximized-active')) {
            if (currentlyMaximizedShort) {
                const maximizeButtonInMaximizedShort = currentlyMaximizedShort.querySelector('#maximize');
                if (maximizeButtonInMaximizedShort) {
                    toggleMaximizeState(maximizeButtonInMaximizedShort);
                }
            }
        }
    });

    const shortHeader = document.getElementById('short-actions-container');

    if (shortHeader) {

    const shortHeader = document.getElementById('short-actions-container');

        // --- Usuario no suscripto ---
        // const currentUserID_Short = 'gena'; 
        // const shortOwnerID = 'angel';     
        // let isCurrentUserSubscribedToChannel = true; 

       // --- Usuario suscripto ---
        // const currentUserID_Short = 'gena'; 
        // const shortOwnerID = 'angel';    
        // let isCurrentUserSubscribedToChannel = false; 

         // --- Usuario no logueado ---
        const currentUserID_Short = null;
        const shortOwnerID = 'angel';
        let isCurrentUserSubscribedToChannel = false;

         // --- Usuario dueño ---
        // const currentUserID_Short = 'angel'; 
        // const shortOwnerID = 'angel';  
        // let isCurrentUserSubscribedToChannel = false;    

        const subscribeButtonForShort = shortHeader.querySelector('.short-action-subscribe');
        const promoteButtonForShort = shortHeader.querySelector('.short-action-promote');

        function updateShortActionButtonsUI() {
            if (!subscribeButtonForShort || !promoteButtonForShort) {
                console.warn("DEBUG: Faltan botones de suscripción o promoción para actualizar UI.");
                return;
            }

            if (currentUserID_Short && currentUserID_Short === shortOwnerID) {
                console.log("DEBUG: UI UPDATE: Dueño. Mostrando promover.");
                subscribeButtonForShort.style.display = 'none';
                promoteButtonForShort.style.display = 'inline-block';
            } else {
                console.log("DEBUG: UI UPDATE: No es dueño o visitante.");
                subscribeButtonForShort.style.display = 'inline-block';
                promoteButtonForShort.style.display = 'none';

                if (currentUserID_Short) {
                    if (isCurrentUserSubscribedToChannel) {
                        subscribeButtonForShort.textContent = 'Unsubscribe';
                    } else {
                        subscribeButtonForShort.textContent = 'Subscribe';
                    }
                } else {
                    subscribeButtonForShort.textContent = 'Log in to Subscribe';
                }
            }
        }

        updateShortActionButtonsUI();

        if (subscribeButtonForShort) {
            console.log("DEBUG: AñADIENDO event listener a subscribeButtonForShort.");
            subscribeButtonForShort.addEventListener('click', () => {
                console.log("DEBUG: CLIC en subscribeButtonForShort detectado.");

                if (!currentUserID_Short) { 
                    console.log("DEBUG: Usuario no logueado, mostrando alerta y redirigiendo.");
                    alert("Please log in to perform this action!");
                    //Llevar al login.
                    return;
                }

                if (isCurrentUserSubscribedToChannel) {
                    console.log(`DEBUG: DESUSCRIBIENDO. User ${currentUserID_Short} del canal ${shortOwnerID}`);
                    isCurrentUserSubscribedToChannel = false;
                } else {
                    console.log(`DEBUG: SUSCRIBIENDO. User ${currentUserID_Short} al canal ${shortOwnerID}`);
                    isCurrentUserSubscribedToChannel = true;
                }
                updateShortActionButtonsUI();
                console.log("DEBUG: Estado de suscripción actualizado a:", isCurrentUserSubscribedToChannel);
            });
        } else {
            console.warn("DEBUG: subscribeButtonForShort es null, no se puede añadir event listener.");
        }

        if (promoteButtonForShort) {
            promoteButtonForShort.addEventListener('click', () => {
                console.log("Acción: Promover Short");
                alert("Promoting short!");
            });
        }

    } else {
        console.warn("DEBUG: SHORT: Contenedor de acciones del short (ID 'short-actions-container') NO encontrado en el DOM.");
    }
});
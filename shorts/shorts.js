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
    
    const volumeSlider = document.getElementById('volumeSlider');

    const maximizeBtns = document.querySelectorAll('#maximize'); 

    const shortHeader = document.getElementById('short-actions-container');

    if (!playPauseBtn || !playPauseImg) {
        console.error("Botón playPauseBtn o su imagen no encontrados.");
    }
    if (!soundMuteBtn || !soundMuteImg) {
        console.error("Botón soundMuteBtn o su imagen no encontrados.");
    }
    if (!volumeSlider) {
        console.warn("Slider de volumen #volumeSlider no encontrado.");
    }
    if (maximizeBtns.length === 0) {
        console.warn("Botón(es) de maximizar con ID 'maximize' no encontrados.");
    }
    if (!shortHeader) {
        console.warn("Contenedor de acciones del short (ID 'short-actions-container') no encontrado.");
    }

    const playIconSrc = playPauseBtn ? playPauseBtn.dataset.playSrc : '';
    const pauseIconSrc = playPauseBtn ? playPauseBtn.dataset.pauseSrc : '';
    const soundIconSrc = soundMuteBtn ? soundMuteBtn.dataset.soundSrc : '';
    const muteIconSrc = soundMuteBtn ? soundMuteBtn.dataset.muteSrc : '';

    function updatePlayPauseIcon() {
        if (!playPauseImg) return;
        if (video.paused) {
            playPauseImg.src = playIconSrc;
            playPauseImg.alt = 'play';
            if(playPauseBtn) playPauseBtn.setAttribute('aria-label', 'Play');
        } else {
            playPauseImg.src = pauseIconSrc;
            playPauseImg.alt = 'pause';
            if(playPauseBtn) playPauseBtn.setAttribute('aria-label', 'Pause');
        }
    }

    function updateSoundMuteIcon() {
        if (!soundMuteImg) return;
        if (video.muted || video.volume === 0) {
            soundMuteImg.src = muteIconSrc;
            soundMuteImg.alt = 'unmute';
            if(soundMuteBtn) soundMuteBtn.setAttribute('aria-label', 'Unmute');
        } else {
            soundMuteImg.src = soundIconSrc;
            soundMuteImg.alt = 'mute';
            if(soundMuteBtn) soundMuteBtn.setAttribute('aria-label', 'Mute');
        }
    }

    function syncVolumeSlider() {
        if (video && volumeSlider) {
            volumeSlider.value = video.volume;
        }
    }
    
    console.log("Estado inicial del video - Paused:", video.paused, "Muted:", video.muted, "Volume:", video.volume);
    updatePlayPauseIcon();
    updateSoundMuteIcon();
    if (volumeSlider) syncVolumeSlider();

    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', function () {
            if (video.paused) {
                video.play().catch(error => console.error("Error al intentar video.play():", error));
            } else {
                video.pause();
            }
        });
    }

    if (soundMuteBtn) {
        soundMuteBtn.addEventListener('click', function () {
            video.muted = !video.muted;
            if (!video.muted && video.volume === 0) { 
                video.volume = 0.5;
            }
            if (volumeSlider) {
                if (volumeSlider.style.display === 'none' || volumeSlider.style.display === '') {
                    volumeSlider.style.display = 'inline-block';
                }
            }
        });
    }

    if (volumeSlider && soundMuteBtn) { 
        document.addEventListener('click', function(event) {
            if (volumeSlider.style.display !== 'none') {
                const volumeContainer = soundMuteBtn.closest('.volume-control-container');
                let clickedInsideVolumeArea = false;
                if (volumeContainer && volumeContainer.contains(event.target)) {
                    clickedInsideVolumeArea = true;
                } else if (soundMuteBtn.contains(event.target) || volumeSlider.contains(event.target)) {
                    clickedInsideVolumeArea = true;
                }

                if (!clickedInsideVolumeArea) {
                    volumeSlider.style.display = 'none';
                }
            }
        });
    }

    if (volumeSlider) {
        volumeSlider.addEventListener('input', function() {
            if (video) {
                video.volume = parseFloat(this.value);
                if (video.volume > 0 && video.muted) {
                    video.muted = false;
                }
            }
        });
    }

    video.addEventListener('play', updatePlayPauseIcon);
    video.addEventListener('pause', updatePlayPauseIcon);
    video.addEventListener('volumechange', () => {
        updateSoundMuteIcon();
        if (volumeSlider) syncVolumeSlider();
    });
    video.addEventListener('loadedmetadata', () => {
        updatePlayPauseIcon();
        updateSoundMuteIcon();
        if (volumeSlider) syncVolumeSlider();
    });
    video.addEventListener('error', (e) => console.error("Error en el elemento video:", e));


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
                    const buttonInMaximized = currentlyMaximizedShort.querySelector('#maximize');
                    if (buttonInMaximized) {
                        toggleMaximizeState(buttonInMaximized);
                    }
                }
            }
        });
    }

    function toggleMaximizeState(buttonElement) { 
        const shortBlock = buttonElement.closest('.short-block');
        if (!shortBlock) {
            console.error("No se encontró .short-block para maximizar/minimizar.");
            return;
        }

        const isMaximized = shortBlock.classList.contains('maximized');

        if (isMaximized) {
            shortBlock.classList.remove('maximized');
            if (fullscreenOverlay) fullscreenOverlay.classList.remove('active');
            document.body.classList.remove('short-maximized-active'); 

            buttonElement.innerHTML = `<img src="${playPauseBtn ? "../media/studio_media/maximize.png" : ''}" alt="Maximize">`; 
            buttonElement.setAttribute('title', 'Maximize');
            currentlyMaximizedShort = null;
        } else {
            if (currentlyMaximizedShort && currentlyMaximizedShort !== shortBlock) {
                const oldMaximizeBtn = currentlyMaximizedShort.querySelector('#maximize');
                if (oldMaximizeBtn) toggleMaximizeState(oldMaximizeBtn);
            }

            shortBlock.classList.add('maximized');
            if (fullscreenOverlay) fullscreenOverlay.classList.add('active');
            document.body.classList.add('short-maximized-active');

            buttonElement.innerHTML = `<img src="${playPauseBtn ? "../media/short_media/gg_minimize.png" : ''}" alt="Minimize">`;
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

    const videoPlaceholder = document.querySelector('.video-placeholder');

if (videoPlaceholder && video) { 
        videoPlaceholder.addEventListener('click', function(event) {

            if (event.target === videoPlaceholder || event.target === video) {
                console.log("DEBUG: Clic en el área del video detectado.");
                if (video.paused) {
                    video.play().catch(error => console.error("Error al intentar video.play() desde clic en video:", error));
                } else {
                    video.pause();
                }
            } else {
                console.log("DEBUG: Clic en el área del video, pero en un elemento hijo:", event.target);
            }
        });
    }

    if (shortHeader) {

    const shortHeader = document.getElementById('short-actions-container');

        // --- Usuario suscripto ---
        // const currentUserID_Short = 'gena'; 
        // const shortOwnerID = 'angel';     
        // let isCurrentUserSubscribedToChannel = true; 

       // --- Usuario no suscripto ---
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
document.addEventListener('DOMContentLoaded', function () {
    const playPauseBtn = document.getElementById('playPauseBtn');
    if (!playPauseBtn) { 
        console.error("Button playPauseBtn not found");
        return; 
    }
    const playPauseImg = playPauseBtn.querySelector('img');
    if (!playPauseImg) { 
        console.error("Image in playPauseBtn not found");
        return;
    }

    let isPlaying = true;

    const playIconSrc = playPauseBtn.dataset.playSrc;
    const pauseIconSrc = playPauseBtn.dataset.pauseSrc;

    if (!playIconSrc || !pauseIconSrc) {
        console.error("Data attributes data-play-src or data-pause-src not defined on playPauseBtn.");
    }

    if (isPlaying) {
        playPauseImg.src = pauseIconSrc;
        playPauseImg.alt = 'pause';
        console.log("Initial state: Playing, showing PAUSE icon:", pauseIconSrc);
    } else {
        playPauseImg.src = playIconSrc;
        playPauseImg.alt = 'play';
        console.log("Initial state: Paused, showing PLAY icon:", playIconSrc);
    }

    playPauseBtn.addEventListener('click', function () {
        if (isPlaying) {
            playPauseImg.src = playIconSrc;
            playPauseImg.alt = 'play';
            console.log("Click: Video Paused, showing PLAY icon");
        } else {
            playPauseImg.src = pauseIconSrc;
            playPauseImg.alt = 'pause';
            console.log("Click: Video Playing, showing PAUSE icon");
        }
        isPlaying = !isPlaying;
    });
    
    const soundMuteBtn = document.getElementById('soundMuteBtn');
    if (soundMuteBtn) {
        const soundMuteImg = soundMuteBtn.querySelector('img');
        if (soundMuteImg) {
            let isMuted = false; 
            const soundIconSrc = soundMuteBtn.dataset.soundSrc;
            const muteIconSrc = soundMuteBtn.dataset.muteSrc;

            if (!soundIconSrc || !muteIconSrc) {
                console.error("Data attributes data-sound-src or data-mute-src not defined on soundMuteBtn.");
            }

            if (isMuted) {
                soundMuteImg.src = muteIconSrc;
                soundMuteImg.alt = 'unmute'; 
            } else {
                soundMuteImg.src = soundIconSrc;
                soundMuteImg.alt = 'mute'; 
            }

            soundMuteBtn.addEventListener('click', function() {
                if (isMuted) {
                    soundMuteImg.src = soundIconSrc;
                    soundMuteImg.alt = 'mute'; 
                    console.log("Sound Unmuted");
                } else {  
                    soundMuteImg.src = muteIconSrc;
                    soundMuteImg.alt = 'unmute'; 
                    console.log("Sound Muted");
                }
                isMuted = !isMuted; 
            });
        } else {
            console.error("Image in soundMuteBtn not found");
        }
    } else {
        console.error("Button soundMuteBtn not found");
    }
});
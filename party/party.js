'use strict';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Plyr
    const player = new Plyr('#player', {
        controls: [
            'play',
            'progress',
            'current-time',
            'mute',
            'volume',
            'settings',
            'fullscreen'
        ],
        disableContextMenu: true,
        hideControls: false
    });

    document.getElementById('player').addEventListener('contextmenu', e => e.preventDefault());
});
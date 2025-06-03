'use strict';

// Extend friend menu
const sidebar = document.querySelector('.friends-sidebar');
const sidebarToggler = document.querySelector('.toggler');

if (sidebarToggler) {
    sidebarToggler.addEventListener('click', e => {
        e.stopPropagation();
        sidebar.classList.toggle('collapsed');
    });
}

document.addEventListener('click', e => {
    if (
        sidebar &&
        !sidebar.classList.contains('collapsed') &&
        !sidebar.contains(e.target) &&
        e.target !== sidebarToggler
    ) {
        sidebar.classList.add('collapsed');
    }
});

// Initialize Plyr
document.addEventListener('DOMContentLoaded', () => {
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

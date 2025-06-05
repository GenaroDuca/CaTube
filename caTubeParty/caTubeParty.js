'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.friends-sidebar');
    const sidebarToggler = document.querySelector('.toggler');
    const togglerIcon = sidebarToggler?.querySelector('span');

    if (sidebarToggler && togglerIcon) {
        sidebarToggler.addEventListener('click', e => {
            e.stopPropagation();
            sidebar.classList.toggle('collapsed');
            togglerIcon.classList.toggle('rotated', sidebar.classList.contains('collapsed'));
        });
        // Estado inicial del icono
        togglerIcon.classList.toggle('rotated', sidebar.classList.contains('collapsed'));
    }

    document.addEventListener('click', e => {
        if (
            sidebar &&
            !sidebar.classList.contains('collapsed') &&
            !sidebar.contains(e.target) &&
            e.target !== sidebarToggler
        ) {
            sidebar.classList.add('collapsed');
            if (togglerIcon) togglerIcon.classList.add('rotated');
        }
    });

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
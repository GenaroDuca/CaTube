document.addEventListener('DOMContentLoaded', function () {
    const viewAllButtons = document.querySelectorAll('.btn-viewall-playlists');
    viewAllButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            const section = btn.closest('.subscriptions');
            const playlistSection = section.querySelector('.playlistSection');
            if (playlistSection) {
                playlistSection.classList.toggle('collapsed');
            }
        });
    });
});
document.addEventListener('DOMContentLoaded', function () {
    // Botón de Playlists
    const viewAllPlaylistBtn = document.querySelector('.btn-viewall-playlists');
    const playlistSection = document.querySelector('#playlists-section .playlistSection');

    if (viewAllPlaylistBtn && playlistSection) {
        viewAllPlaylistBtn.addEventListener('click', function () {
            playlistSection.classList.toggle('collapsed');
            viewAllPlaylistBtn.textContent = playlistSection.classList.contains('collapsed') ? 'View more' : 'View minus';
            // Si se expande, hacer scroll suave
            if (!playlistSection.classList.contains('collapsed')) {
                playlistSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    // Botón de View Later
    const viewAllViewLaterBtn = document.querySelector('.btn-viewall-viewlater');
    if (viewAllViewLaterBtn && playlistSection) {
        viewAllViewLaterBtn.addEventListener('click', function () {
            if (playlistSection.classList.contains('collapsed')) {
                playlistSection.classList.remove('collapsed');
                viewAllPlaylistBtn.textContent = 'View minus';
                // Scroll suave al expandir
                playlistSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
});
const sidebar = document.querySelector('.sidebar');
const sidebarToggler = document.querySelector('.sidebar-toggler');

// Toggle sidebar on button click
sidebarToggler.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
});
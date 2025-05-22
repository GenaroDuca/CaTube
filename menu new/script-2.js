const sidebar = document.querySelector('.rsm-sidebar');
const sidebarToggler = document.querySelector('.rsm-sidebar-toggler');

sidebarToggler.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
});

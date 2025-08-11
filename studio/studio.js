'use strict';

// --- Progress Bar Functions ---
function updateProgressBar(current, max, barId) {
  current = Math.max(0, Math.min(current, max));
  const percent = (current / max) * 100;
  const bar = document.getElementById(barId);
  if (bar) {
    bar.style.width = percent + '%';
    bar.textContent = current;
  }
}

// --- Monetization Requirements ---
const currentSubscribers = 20, maxSubscribers = 500;
const currentVideos = 2, maxVideos = 3;
const currentWatchHours = 450, maxWatchHours = 3000;

function checkMonetizationEligibility() {
  const enoughSubs = currentSubscribers >= maxSubscribers;
  const enoughVideos = currentVideos >= maxVideos;
  const enoughHours = currentWatchHours >= maxWatchHours;
  const applyBtn = document.getElementById('applyButton');
  if (applyBtn) {
    applyBtn.disabled = !(enoughSubs && enoughVideos && enoughHours);
  }
}

// --- Tab Navigation for Content Section ---
function setupContentTabs() {
  const buttons = document.querySelectorAll('.content-ul .content-li-btn');
  const tables = document.querySelectorAll('.scroll-table-container .content-table');
  buttons.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      tables.forEach(tab => tab.classList.add('hide'));
      buttons.forEach(b => b.classList.remove('active'));
      if (tables[idx]) {
        tables[idx].classList.remove('hide');
        buttons[idx].classList.add('active');
      }
    });
  });
  if (tables[0]) tables[0].classList.remove('hide');
  if (buttons[0]) buttons[0].classList.add('active');
}

// --- Main Navigation (Sidebar) ---
function setupSidebarNavigation() {
  const navLinks = document.querySelectorAll('.sidebar-left-studio-nav .primary-nav .nav-link');
  const sections = document.querySelectorAll('main > .container-studio');
  navLinks.forEach((link, idx) => {
    link.addEventListener('click', () => {
      navLinks.forEach(l => l.classList.remove('active'));
      sections.forEach(s => s.classList.add('hide'));
      link.classList.add('active');
      if (sections[idx]) sections[idx].classList.remove('hide');
    });
  });
}

// --- Chart Setup ---
function setupCharts() {
  if (!window.Chart) return;
  // Line Chart
  const line = document.getElementById('lineChart');
  if (line) {
    new Chart(line.getContext('2d'), {
      type: 'line',
      data: {
        labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        datasets: [
          { label: 'Vistas', data: [1200, 1900, 3000, 5000, 3200, 4200, 6100, 7000, 8000, 9000, 10000, 11000], borderColor: 'rgb(162, 209, 117)', backgroundColor: 'rgba(92, 117, 84, 0.2)', fill: true, tension: 0.3 },
          { label: 'Suscriptores', data: [100, 200, 400, 350, 300, 450, 600, 700, 800, 900, 1000, 1100], borderColor: 'rgb(211, 224, 201)', backgroundColor: 'rgba(62, 51, 82, 0.2)', fill: true, tension: 0.3 },
          { label: 'Horas vistas', data: [500, 700, 1200, 2000, 1800, 2400, 3100, 4000, 4500, 5000, 6000, 7000], borderColor: 'rgb(255, 205, 86)', backgroundColor: 'rgba(255, 205, 86, 0.2)', fill: true, tension: 0.3 }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }
  // Doughnut Chart
  const doughnut = document.getElementById('doughnutChart');
  if (doughnut) {
    new Chart(doughnut.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Búsqueda en CaTube', 'Videos sugeridos', 'Páginas externas'],
        datasets: [{
          label: 'Origen del tráfico',
          data: [45, 35, 20],
          backgroundColor: ['rgb(116, 146, 105)', 'rgb(144, 180, 132)', 'rgb(116, 146, 132)'],
          hoverOffset: 6
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }
}

// --- Edit video modal ---
const editVideoModal = document.querySelector('.edit-video-modal');
const openEditVideoBtns = document.querySelectorAll('.edit-video-btn');
const closeEditVideoModalBtn = document.querySelector('.close-edit-video-modal');

openEditVideoBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (editVideoModal) editVideoModal.style.display = 'flex';
  });
});

if (closeEditVideoModalBtn) {
  closeEditVideoModalBtn.addEventListener('click', () => {
    if (editVideoModal) editVideoModal.style.display = 'none';
  });
}

// --- Go to Studio sections buttons ---
const allSections = document.querySelectorAll('.container-studio');
const storeLink = document.querySelector('#storeButton');
const storeSection = Array.from(allSections).find(section =>
  section.querySelector('h1') && section.querySelector('h1').textContent.toLowerCase().includes('store')
);

const navLinks = document.querySelectorAll('.sidebar-left-studio-nav .primary-nav .nav-link');

if (storeLink && storeSection) {
  storeLink.addEventListener('click', function (e) {
    e.preventDefault();
    allSections.forEach(sec => sec.classList.add('hide'));
    storeSection.classList.remove('hide');
    navLinks.forEach(link => {
      if (link.textContent.toLowerCase().includes('store')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  });
}

// --- Go to community from dashboard section ---
const dashboardBtn = document.querySelector('.btn-dashboard');
const communitySection = Array.from(allSections).find(section =>
  section.querySelector('h1') && section.querySelector('h1').textContent.toLowerCase().includes('community')
);

if (dashboardBtn && communitySection) {
  dashboardBtn.addEventListener('click', function (e) {
    e.preventDefault();
    allSections.forEach(sec => sec.classList.add('hide'));
    communitySection.classList.remove('hide');
    navLinks.forEach(link => {
      if (link.textContent.toLowerCase().includes('community')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  });
}

// --- Mostrar sección según parámetro de URL ---
const params = new URLSearchParams(window.location.search);
const sectionParam = params.get('section');

if (sectionParam) {
  allSections.forEach(sec => sec.classList.add('hide'));
  const targetSection = Array.from(allSections).find(section =>
    section.querySelector('h1') &&
    section.querySelector('h1').textContent.toLowerCase().includes(sectionParam)
  );
  if (targetSection) {
    targetSection.classList.remove('hide');
    // Activar el botón correspondiente
    const navLinks = document.querySelectorAll('.sidebar-left-studio-nav .primary-nav .nav-link');
    navLinks.forEach(link => {
      // Busca el link cuyo texto coincide con el parámetro
      if (link.textContent.toLowerCase().includes(sectionParam)) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
} else {
  if (allSections[0]) allSections[0].classList.remove('hide');

  const navLinks = document.querySelectorAll('.sidebar-left-studio-nav .primary-nav .nav-link');
}

// --- Initialize Everything on Page Load ---
document.addEventListener('DOMContentLoaded', function () {
  // Sidebar navigation
  setupSidebarNavigation();
  // Content section
  setupContentTabs();
  // Earn section
  updateProgressBar(currentSubscribers, maxSubscribers, 'subscribersProgressBarFill');
  updateProgressBar(currentVideos, maxVideos, 'videosUploadedProgressBarFill');
  updateProgressBar(currentWatchHours, maxWatchHours, 'watchHoursProgressBarFill');
  checkMonetizationEligibility();
  // Analytics section
  setupCharts();
});
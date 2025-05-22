'use strict'

function updateProgressBar(currentValue, maxValue, progressBarFillId, startLabelId, endLabelId) {
    // Validate values
    if (currentValue < 0) currentValue = 0;
    if (currentValue > maxValue) currentValue = maxValue;

    const percentage = (currentValue / maxValue) * 100;

    const progressBarFill = document.getElementById(progressBarFillId);


    if (progressBarFill) {
        progressBarFill.style.width = percentage + '%';
        progressBarFill.textContent = currentValue;
    }
}

// Monetization Requirements Data

// Subscribers
const currentSubscribers = 20;
const maxSubscribers = 500;

// Videos Uploaded 
const currentVideosUploaded = 2;
const maxVideosUploaded = 3;

// Public Watch Hours
const currentWatchHours = 450;
const maxWatchHours = 3000;

// Public Shorts Views (assuming these are needed for the progress bar)
const currentShortsViews = 150000; // Example value
const maxShortsViews = 10000000;   // Example value (e.g., 10M for Shorts monetization)


function checkMonetizationEligibility() {
    const subscribersMet = currentSubscribers >= maxSubscribers;
    const videosUploadedMet = currentVideosUploaded >= maxVideosUploaded;
    const watchHoursMet = currentWatchHours >= maxWatchHours;

    const applyButton = document.getElementById('applyButton');

    if (applyButton) {
        if (subscribersMet && videosUploadedMet && watchHoursMet) {
            applyButton.disabled = false;
            console.log("All primary requirements met. Apply button enabled.");
        } else {
            applyButton.disabled = true;
            console.log("Not all primary requirements met. Apply button disabled.");
        }
    }
}


// Hide/Show Content Sections
function configurarFiltroContenido() {
    const botones = document.querySelectorAll('.content-ul .content-li-btn');
    const tablas = document.querySelectorAll('.content-table');

    botones.forEach((boton, indice) => {
        boton.addEventListener('click', () => {
            // Ocultar todos los tbody
            tablas.forEach(tbody => {
                tbody.classList.add('hide');
            });

            // Remover clase 'active' de todos los botones
            botones.forEach(btn => {
                btn.classList.remove('active');
            });

            // Mostrar tbody correspondiente al botón clickeado
            if (tablas[indice]) {
                tablas[indice].classList.remove('hide');
            }

            // Activar botón clickeado
            boton.classList.add('active');
        });
    });

    // Inicializar estado al cargar la página
    document.addEventListener('DOMContentLoaded', () => {
        tablas.forEach((tbody, index) => {
            if (index === 0) {
                tbody.classList.remove('hide'); // Mostrar solo el primero
            } else {
                tbody.classList.add('hide');
            }
        });

        if (botones.length > 0) {
            botones.forEach(btn => btn.classList.remove('active'));
            botones[0].classList.add('active');
        }
    });
}

// Select all checkboxes
function selectAllCheckboxes() {
    //TO DO
}

// Hide/Show Sections
function setupNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav .primary-nav .nav-link');
    const contentSections = document.querySelectorAll('main > .container');
    const storeButton = document.getElementById('storeButton');

    navLinks.forEach((link, index) => {
        link.addEventListener('click', () => {
            // Deactivate all nav links
            navLinks.forEach(nav => nav.classList.remove('active'));
            link.classList.add('active');

            // Hide all content sections
            contentSections.forEach(section => section.classList.add('hide'));

            if (contentSections[index]) {
                contentSections[index].classList.remove('hide');
            }
        });
    })

    if (storeButton) {
        storeButton.addEventListener('click', () => {

            const storeNavLinkIndex = 4;

            const storeNavLink = navLinks[storeNavLinkIndex];
            const storeContentSection = contentSections[storeNavLinkIndex];

            // Deactivate all nav links
            if (storeNavLink && storeContentSection) {
                navLinks.forEach(nav => nav.classList.remove('active'));
                storeNavLink.classList.add('active');

                // Hide all content sections
                contentSections.forEach(section => section.classList.add('hide'));
                storeContentSection.classList.remove('hide');
            }
        });
    }

    const params = new URLSearchParams(window.location.search);
const sectionParam = params.get("section");

if (sectionParam === "customization") {
    const customizationNavLinkIndex = 6;
    const customizationNavLink = navLinks[customizationNavLinkIndex];
    const customizationContentSection = contentSections[customizationNavLinkIndex];

    if (customizationNavLink && customizationContentSection) {
        navLinks.forEach(nav => nav.classList.remove('active'));
        contentSections.forEach(section => section.classList.add('hide'));

        customizationNavLink.classList.add('active');
        customizationContentSection.classList.remove('hide');
    }
}

if (sectionParam === "content") {
    const customizationNavLinkIndex = 1;
    const customizationNavLink = navLinks[customizationNavLinkIndex];
    const customizationContentSection = contentSections[customizationNavLinkIndex];

    if (customizationNavLink && customizationContentSection) {
        navLinks.forEach(nav => nav.classList.remove('active'));
        contentSections.forEach(section => section.classList.add('hide'));

        customizationNavLink.classList.add('active');
        customizationContentSection.classList.remove('hide');
    }
}

}

document.addEventListener('DOMContentLoaded', function () {
    // Setup navigation
    setupNavigation();
    configurarFiltroContenido()

    // Update progress bars
    updateProgressBar(currentSubscribers, maxSubscribers, 'subscribersProgressBarFill', 'subscribersProgressStartLabel', 'subscribersProgressEndLabel');
    updateProgressBar(currentVideosUploaded, maxVideosUploaded, 'videosUploadedProgressBarFill', 'videosUploadedProgressStartLabel', 'videosUploadedProgressEndLabel');
    updateProgressBar(currentWatchHours, maxWatchHours, 'watchHoursProgressBarFill', 'watchHoursProgressStartLabel', 'watchHoursProgressEndLabel');
    updateProgressBar(currentShortsViews, maxShortsViews, 'shortsViewsProgressBarFill', 'shortsViewsProgressStartLabel', 'shortsViewsProgressEndLabel');

    // Check monetization eligibility
    checkMonetizationEligibility();
});

// Analytics Sections
document.addEventListener('DOMContentLoaded', function () {
  const ctx = document.getElementById('lineChart').getContext('2d');
  const lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: [
        {
          label: 'Vistas',
          data: [1200, 1900, 3000, 5000, 3200, 4200, 6100, 7000, 8000, 9000, 10000, 11000, 12000],
          borderColor: 'rgb(162, 209, 117)',
          backgroundColor: 'rgba(92, 117, 84, 0.2)',
          fill: true,
          tension: 0.3
        },
        {
          label: 'Suscriptores',
          data: [100, 200, 400, 350, 300, 450, 600, 700, 800, 900, 1000, 1100],
          borderColor: 'rgb(211, 224, 201)',
          backgroundColor: 'rgba(62, 51, 82, 0.2)',
          fill: true,
          tension: 0.3
        },
        {
          label: 'Tiempo de visualización (horas)',
          data: [500, 700, 1200, 2000, 1800, 2400, 3100, 4000, 4500, 5000, 6000, 7000],
          borderColor: 'rgb(255, 205, 86)',
          backgroundColor: 'rgba(255, 205, 86, 0.2)',
          fill: true,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Estadísticas mensuales de contenido'
        }
      }
    }
  });

  const ctx2 = document.getElementById('doughnutChart').getContext('2d');
  const doughnutData = {
    labels: ['Búsqueda en CaTube', 'Videos sugeridos', 'Páginas externas'],
    datasets: [{
      label: 'Origen del tráfico',
      data: [45, 35, 20],
      backgroundColor: [
        'rgb(116, 146, 105)',
        'rgb(144, 180, 132)',
        'rgb(116, 146, 132)'
      ],
      hoverOffset: 6
    }]
  };
  const doughnutChart = new Chart(ctx2, {
    type: 'doughnut',
    data: doughnutData,
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Tráfico'
        }
      }
    }
  });
});


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

function setupChannelCustomization() {
  const nameInput = document.getElementById('channel-name-input');
  const handleInput = document.getElementById('channel-handle-input');
  const descriptionInput = document.getElementById('channel-description-input');
  const publishBtn = document.getElementById('publish-changes-btn');

  if (!publishBtn) {
    return;
  }

  async function loadCurrentChannelData() {
    const channelId = localStorage.getItem('channelId');
    const accessToken = localStorage.getItem('accessToken');

    if (!channelId) {
      console.error('No se encontró channelId en localStorage.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/channels/${channelId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('No se pudo obtener la información del canal.');
      }

      const channelData = await response.json();

      nameInput.value = channelData.channel_name;
      handleInput.value = channelData.url;
      descriptionInput.value = channelData.description;

    } catch (error) {
      console.error('Error cargando los datos del canal:', error);
    }
  }

  loadCurrentChannelData();

  publishBtn.addEventListener('click', async () => {
    const channelId = localStorage.getItem('channelId');

    if (!channelId) {
      alert('Error: No se pudo identificar el canal. Por favor, inicia sesión de nuevo.');
      return;
    }

    const updateData = {};

    if (nameInput.value) {
      updateData.channel_name = nameInput.value;
    }
    if (handleInput.value) {
      updateData.url = handleInput.value.replace('@', '');
    }
    if (descriptionInput.value) {
      updateData.description = descriptionInput.value;
    }

    if (Object.keys(updateData).length === 0) {
      alert('No hay cambios para publicar.');
      return;
    }

    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/channels/${channelId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();

      if (response.ok) {
        alert('¡Canal actualizado con éxito!');
        if (result.channel_name) nameInput.value = result.channel_name;
        if (result.url) handleInput.value = result.url;
        if (result.description) descriptionInput.value = result.description;
      } else {
        const errorMessage = result.message || 'Ocurrió un error desconocido.';
        alert('Error al actualizar: ' + JSON.stringify(errorMessage));
      }

    } catch (error) {
      console.error('Error de conexión:', error);
      alert('No se pudo conectar con el servidor.');
    }
  });
}

// --- Create Store modal ---
const createStoreModal = document.querySelector('.create-store-modal');
const opencreateStoreBtns = document.querySelectorAll('.create-store');
const closeCreateStoreModalBtn = document.querySelector('.close-create-store-modal');

opencreateStoreBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (createStoreModal) createStoreModal.style.display = 'flex';
  });
});

if (closeCreateStoreModalBtn) {
  closeCreateStoreModalBtn.addEventListener('click', () => {
    if (createStoreModal) createStoreModal.style.display = 'none';
  });
}

const createStoreBtn = document.querySelector('.create-store-btn');
if (createStoreBtn) {
  createStoreBtn.addEventListener('click', async () => {
    const storeNameInput = document.getElementById('store-name-input').value.trim();
    const storeDescriptionInput = document.getElementById('store-description-input').value.trim();

    if (!storeNameInput) {
      alert('Please enter a store name.');
      return;
    }

    const storeData = {
      store_name: storeNameInput,
      description: storeDescriptionInput,
    };

    console.log(storeData);

    try {
      const accessToken = localStorage.getItem('accessToken'); // Obtenemos el token
      const response = await fetch('http://localhost:3000/store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`, // Lo añadimos a la cabecera
        },
        body: JSON.stringify(storeData),
      });

      const responseBody = await response.text(); // o .json() si sabés que responde en JSON

      if (response.ok) {
        alert(`Store "${storeNameInput}" created successfully!`);
        if (createStoreModal) createStoreModal.style.display = 'none'; // Ocultamos el modal
        await setupStoreSection(); // Volvemos a cargar la sección de la tienda para que se actualice la vista
      } else {
        console.error('Server response:', response.status, responseBody);
        alert(`Error ${response.status}: ${responseBody}`);
      }

    } catch (error) {
      console.error('Connection error:', error);
      alert('Could not connect to the server.');
    }
  });
}

// --- Store Section Logic ---
async function setupStoreSection() {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) return;

  // Selectores simplificados que ahora coinciden con el HTML corregido
  const noStoreContainer = document.querySelector('.donot-store-container');
  const hasStoreContainer = document.querySelector('.has-store-container');
  const noProductsMessage = document.querySelector('.no-products-message');
  const productsGrid = document.querySelector('.products-grid');

  // Comprobación de que los contenedores principales existen
  if (!noStoreContainer || !hasStoreContainer) {
    console.error('Los contenedores de la tienda no fueron encontrados. Revisa el HTML.');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/store/my-store', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (response.status === 404 || response.status === 204) { // 204 No Content
      // No tiene tienda
      noStoreContainer.classList.remove('hide');
      hasStoreContainer.classList.add('hide');
    } else if (response.ok) {
      const store = await response.json();
      // Sí tiene tienda
      noStoreContainer.classList.add('hide');
      hasStoreContainer.classList.remove('hide');

      // aca iría la lógica para cargar y mostrar los productos de la tienda.
      // Por ahora, simulamos que no hay productos.
      const products = store.products || [];

      if (products.length === 0) {
        if(noProductsMessage) noProductsMessage.classList.remove('hide');
        if(productsGrid) productsGrid.classList.add('hide');
      } else {
        if(noProductsMessage) noProductsMessage.classList.add('hide');
        if(productsGrid) productsGrid.classList.remove('hide');
        // Lógica para renderizar los productos en `productsGrid`
      }

    } else {
      throw new Error('Failed to fetch store status');
    }
  } catch (error) {
    console.error('Error setting up store section:', error);
    // Por seguridad, mostramos la opción de crear tienda si hay un error
    noStoreContainer.classList.remove('hide');
    hasStoreContainer.classList.add('hide');
  }
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

  setupChannelCustomization();

  setupStoreSection();
});

'use strict';

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

// --- Main Navigation & Section Management ---
function navigateToSection(sectionName, navLinks, sections) {
  const targetSection = Array.from(sections).find(section =>
    section.querySelector('h1')?.textContent.toLowerCase().includes(sectionName)
  );

  if (targetSection) {
    sections.forEach(sec => sec.classList.add('hide'));
    targetSection.classList.remove('hide');

    navLinks.forEach(link => {
      const linkText = link.querySelector('.nav-label')?.textContent.toLowerCase() || link.textContent.toLowerCase();
      link.classList.toggle('active', linkText.includes(sectionName));
    });
    return true;
  }
  return false;
}

// --- Modal Management ---
function setupModal(modalSelector, openSelector, closeSelector) {
  const modal = document.querySelector(modalSelector);
  const openBtns = document.querySelectorAll(openSelector);
  const closeBtn = document.querySelector(closeSelector);

  if (!modal) return;

  openBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modal.style.display = 'flex';
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }
  return modal;
}

function setupChannelCustomization() {
  const nameInput = document.getElementById('channel-name-input');
  const handleInput = document.getElementById('channel-handle-input');
  const descriptionInput = document.getElementById('channel-description-input');
  const publishBtn = document.getElementById('publish-changes-btn');

  if (!publishBtn) {
    return;
  }

  async function loadAndDisplayChannelData() {
    try {
      const channelData = await apiService.getChannelData();
      if (channelData) {
        nameInput.value = channelData.channel_name;
        handleInput.value = channelData.url;
        descriptionInput.value = channelData.description;
      }
    } catch (error) {
      console.error('Error displaying channel data:', error);
    }
  }

  loadAndDisplayChannelData();

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
      const result = await apiService.updateChannel(channelId, updateData);
      if (result) {
        alert('¡Canal actualizado con éxito!');
        // Actualizar los campos con la respuesta del servidor por si hubo alguna transformación
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

function setupCreateStore(modal) {
  const createStoreBtn = document.querySelector('.create-store-btn');
  if (!createStoreBtn) {
    return;
  }

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

    try {
      const newStore = await apiService.createStore(storeData);
      if (newStore) {
        alert(`Store "${storeNameInput}" created successfully!`);
        if (modal) modal.style.display = 'none';
        await setupStoreSection();
      } else {
        // apiService ya maneja el alert de error
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
  const noStoreContainer = document.querySelector('.donot-store-container');
  const hasStoreContainer = document.querySelector('.has-store-container');

  if (!noStoreContainer || !hasStoreContainer) {
    console.error('Los contenedores de la tienda no fueron encontrados. Revisa el HTML.');
    return;
  }

  try {
    const store = await apiService.getMyStore();
    if (store) {
      const noProductsMessage = hasStoreContainer.querySelector('.no-products-message');
      const productsContainer = hasStoreContainer.querySelector('.products-container');

      noStoreContainer.classList.add('hide');
      hasStoreContainer.classList.remove('hide');

      // Llamamos a la nueva función para obtener los productos
      const products = await apiService.getMyProducts();

      if (products && products.length > 0) {
        if (noProductsMessage) noProductsMessage.classList.add('hide');
        renderProducts(products, productsContainer);
      } else {
        if (noProductsMessage) noProductsMessage.classList.remove('hide');
        if (productsContainer) productsContainer.innerHTML = ''; // Limpiar por si acaso
      }

    } else {
      noStoreContainer.classList.remove('hide');
      hasStoreContainer.classList.add('hide');
    }
  } catch (error) {
    console.error('Error setting up store section:', error);
    // Por seguridad, mostramos la opción de crear tienda si hay un error
    noStoreContainer.classList.remove('hide');
    hasStoreContainer.classList.add('hide');
  }
}

function renderProducts(products, container) {
  if (!container) return;
  container.innerHTML = ''; // Limpiamos el contenedor

  products.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.innerHTML = `
      <img src="../media/studio_media/store/remera_ejemplo.jpg" alt="${product.product_name}">
      <h2>${product.product_name}</h2>
      <h3>$${parseFloat(product.price).toFixed(2)}</h3>
      <p>${product.description || 'No description available.'}</p>
      <div class="product-card-actions">
        <button type="button" class="edit-product-btn" data-product-id="${product.product_id}"><i class="fa-solid fa-pen"></i></button>
        <button type="button" class="delete-product-btn" data-product-id="${product.product_id}"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;
    container.appendChild(productCard);
  });

  addDeleteEventListeners();
  addEditEventListeners();
}

function addDeleteEventListeners() {
  document.querySelectorAll('.delete-product-btn').forEach(button => {
    button.addEventListener('click', async (event) => {
      const productId = event.currentTarget.dataset.productId;
      if (confirm(`Are you sure you want to delete product ${productId}?`)) {
        const result = await apiService.deleteProduct(productId);
        // La respuesta de un DELETE exitoso puede no tener cuerpo, así que verificamos el resultado.
        // El apiService ya maneja los errores, así que si llega aquí, probablemente fue exitoso.
        // Para ser más robustos, el backend podría devolver un { success: true }.
        alert('Product deleted successfully.');
        await setupStoreSection(); // Recargamos la lista de productos
      }
    });
  });
}

function addEditEventListeners() {
  const modal = document.querySelector('.edit-product-modal');
  if (!modal) return;

  document.querySelectorAll('.edit-product-btn').forEach(button => {
    button.addEventListener('click', async (event) => {
      const productId = event.currentTarget.dataset.productId;
      const product = await apiService.getProduct(productId);

      if (product) {
        // Llenar el formulario del modal con los datos del producto
        document.getElementById('edit-product-id').value = product.product_id;
        document.getElementById('edit-product-name-input').value = product.product_name;
        document.getElementById('edit-product-description-input').value = product.description;
        document.getElementById('edit-product-price-input').value = product.price;
        document.getElementById('edit-product-stock-input').value = product.stock;
        modal.style.display = 'flex';
      }
    });
  });

  const form = document.getElementById('edit-product-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const productId = document.getElementById('edit-product-id').value;
    const productData = {
      product_name: document.getElementById('edit-product-name-input').value,
      description: document.getElementById('edit-product-description-input').value,
      price: parseFloat(document.getElementById('edit-product-price-input').value),
      stock: parseInt(document.getElementById('edit-product-stock-input').value, 10),
    };

    const updatedProduct = await apiService.updateProduct(productId, productData);

    if (updatedProduct) {
      alert('Product updated successfully!');
      modal.style.display = 'none';
      form.reset();
      await setupStoreSection(); // Recargar productos
    }
  });

  setupModal('.edit-product-modal', null, '.close-edit-product-modal');
}

function setupAddProduct() {
  const modal = setupModal('.add-product-modal', '.add-product-btn', '.close-add-product-modal');
  const form = document.getElementById('add-product-form');

  if (!form || !modal) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    try {
      const newProduct = await apiService.createProduct(formData);
      if (newProduct) {
        alert('Product added successfully!');
        modal.style.display = 'none';
        form.reset();
        await setupStoreSection(); // Recargar la sección para mostrar el nuevo estado
      }
      // El apiService ya maneja los alerts de error
    } catch (error) {
      console.error('Error submitting product form:', error);
      alert('Could not connect to the server.');
    }
  });
}

setupAddProduct();

// --- Initialize Everything on Page Load ---
document.addEventListener('DOMContentLoaded', () => {
  // --- Select main elements once ---
  const navLinks = document.querySelectorAll('.sidebar-left-studio-nav .primary-nav .nav-link');
  const sections = document.querySelectorAll('main > .container-studio');

  // --- Setup UI components ---
  setupContentTabs();
  setupCharts();
  setupChannelCustomization();

  // --- Setup Modals ---
  setupModal('.edit-video-modal', '.edit-video-btn', '.close-edit-video-modal');
  const createStoreModal = setupModal('.create-store-modal', '.create-store', '.close-create-store-modal');
  setupModal('.add-product-modal', '.add-new-product', '.close-add-product-modal');
  setupCreateStore(createStoreModal);

  // --- Setup Earn Section ---
  Object.values(monetizationConfig).forEach(({ current, max, barId }) => {
    updateProgressBar(current, max, barId);
  });
  checkMonetizationEligibility();

  // --- Setup Navigation ---
  navLinks.forEach((link, idx) => {
    link.addEventListener('click', () => {
      const sectionName = link.querySelector('.nav-label')?.textContent.toLowerCase() || '';
      navigateToSection(sectionName || `section-${idx}`, navLinks, sections);
    });
  });

  document.querySelector('#storeButton')?.addEventListener('click', (e) => { e.preventDefault(); navigateToSection('store', navLinks, sections); });
  document.querySelector('.btn-dashboard')?.addEventListener('click', (e) => { e.preventDefault(); navigateToSection('community', navLinks, sections); });

  // --- Initial State ---
  const params = new URLSearchParams(window.location.search);
  const sectionParam = params.get('section');
  const navigated = sectionParam ? navigateToSection(sectionParam, navLinks, sections) : false;

  if (!navigated) {
    navigateToSection('dashboard', navLinks, sections);
  }

  // --- Load Initial Data ---
  setupStoreSection(); // Verifica si el usuario tiene una tienda
});
import React, { useState, useEffect, useCallback } from 'react';
import { IoIosCloseCircle } from "react-icons/io";
import { useNotifications } from '../../../common/Toasts/useNotifications.jsx';

// ----------------------------------------------------------------------
// FUNCIONES DE FETCH
// ----------------------------------------------------------------------

const BASE_URL = 'http://localhost:3000';

/**
 * Obtiene la lista de productos del usuario para verificar duplicados.
 * Maneja errores de red y de autenticación (401).
 */
async function getExistingProductsSolo() {
  const accessToken = localStorage.getItem('accessToken');
  const url = `${BASE_URL}/product/my-products`;

  const headers = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(url, { method: 'GET', headers });

    // Si la respuesta es 401, lanzamos un error para manejarlo
    if (response.status === 401) {
      throw new Error("Authentication failed. Cannot check for duplicate names.");
    }

    if (response.ok && response.headers.get("content-type")?.includes("application/json")) {
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    }
    return [];
  } catch (error) {
    // Propagamos el error para que useEffect lo capture
    console.error('Error fetching existing products for edit:', error);
    throw error;
  }
}

/**
 * Realiza el fetch para actualizar un producto existente.
 */
async function updateProductSolo(productId, formDataToSend) {
  const accessToken = localStorage.getItem('accessToken');
  const url = `${BASE_URL}/product/${productId}`;

  const headers = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: headers,
      body: formDataToSend,
    });

    if (response.ok) {
      return await response.json();
    }

    let errorBody = null;
    if (response.headers.get("content-type")?.includes("application/json")) {
      errorBody = await response.json().catch(() => ({}));
    }
    const errorMessage = errorBody?.message || response.statusText;
    throw new Error(errorMessage || "Failed to update product on the server.");

  } catch (error) {
    console.error("Network or parsing error during product update:", error);
    throw new Error(error.message || "A network error occurred.");
  }
}

// ----------------------------------------------------------------------

// Componente: EditProductModal
const EditProductModal = ({ onClose, onProductUpdated, productData }) => {
  const [product] = useState(productData);

  const [formData, setFormData] = useState({
    product_name: productData?.product_name || '',
    description: productData?.description || '',
    price: productData?.price || '',
    stock: productData?.stock || '',
    image: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [existingProducts, setExistingProducts] = useState([]);
  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // FeedbackToast
  const { showSuccess, showError } = useNotifications();
  // --- EFECTOS ---
  useEffect(() => {

    const fetchExisting = async () => {
      try {
        // Si productData está disponible, cargamos el resto.
        if (productData) {
          const products = await getExistingProductsSolo();
          setExistingProducts(products);
          setError(null); // Limpiar error si la carga es exitosa
        }
      } catch (err) {
        // 💡 CLAVE: Manejar el error de autenticación sin bloquear el formulario.
        console.error("Warning: Cannot fetch existing products for duplicate check:", err.message);

        // Mostrar un error no fatal en la UI para avisar al usuario.
        if (err.message.includes("Authentication failed")) {
          setError("Warning: Cannot check for duplicate names. Please log in again.");
        } else {
          setError("Warning: Cannot check for duplicate names due to a network error.");
        }
        setExistingProducts([]);
      }
    };

    fetchExisting();

  }, [productData]); // Dependencia de productData para asegurar que se ejecuta cuando llega.

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!product || !product.product_id) return;

    setLoading(true);
    setError(null);
    setShowDeleteConfirm(false);

    try {
      const success = await deleteProductSolo(product.product_id);

      if (success) {
        if (onProductUpdated) onProductUpdated();
        else window.location.reload();
        onClose();
      }
    } catch (err) {
      setError(err.message || "Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLogic = useCallback(async () => {
    if (!product || !product.product_id) return;

    setLoading(true);
    setError(null);
    setShowDuplicateConfirm(false);

    // 1. Validaciones
    if (parseFloat(formData.price) < 0) {
      showError("Price cannot be negative");
      setLoading(false);
      return;
    }
    if (parseInt(formData.stock, 10) < 0) {
      showError("Stock cannot be negative");
      setLoading(false);
      return;
    }

    // 2. Construir FormData
    const formDataToSend = new FormData();
    formDataToSend.append("product_name", formData.product_name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("price", parseFloat(formData.price));
    formDataToSend.append("stock", parseInt(formData.stock, 10));

    if (formData.image) {
      formDataToSend.append("image", formData.image);
    }

    // 3. Llamada a la API
    try {
      const result = await updateProductSolo(product.product_id, formDataToSend);

      if (result) {
        if (onProductUpdated) onProductUpdated();
        else window.location.reload();
        onClose();
        showSuccess ("Product edited successfully!")
      }
    } catch (err) {
      setError(err.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  }, [formData, product, onClose, onProductUpdated]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Solo verifica duplicados si se pudieron cargar los productos existentes
    const isDuplicate = existingProducts.some(
      (p) => p.product_id !== product.product_id && p.product_name.toLowerCase() === formData.product_name.toLowerCase()
    );

    if (isDuplicate && !showDuplicateConfirm) {
      setShowDuplicateConfirm(true);
      return;
    }

    await handleUpdateLogic();
  };

  const handleConfirmDuplicate = () => {
    setShowDuplicateConfirm(false);
    handleUpdateLogic();
  };


  // --- RENDER ---
  // 💡 IMPORTANTE: Si productData es null/undefined, significa que el ModalHost no lo pasó.
  if (!productData) {
    return (
      <div className="edit-product-modal">
        <div className="edit-product-content">
          <header>
            <h1>Error</h1>
            <button type="button" onClick={onClose} className="close-add-product-modal">
              <IoIosCloseCircle size={25} color="#1a1a1b" />
            </button>
          </header>

          <main><p>No product data found for editing. This is often caused by an issue in the Modal system or parent component.</p></main>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-product-modal">
      <div className="edit-product-content">
        <header>
          <h1>Edit Product</h1>
          <button type="button" onClick={onClose} className="close-edit-product-modal">
            <IoIosCloseCircle size={25} color="#1a1a1b" />
          </button>
        </header>
        <main>
          {/* Muestra el error, incluyendo el aviso de 401 */}
          {error && <div className="error-message">{error}</div>}

          {/* Pantallas de Confirmación */}
          {(showDuplicateConfirm || showDeleteConfirm) && (
            <div className="confirmation-overlay">
              {showDuplicateConfirm && (
                <div className="duplicate-confirm">
                  <p>A product with this name already exists. Are you sure you want to update to a duplicate name?</p>
                  <div className="confirm-buttons">
                    <button type="button" onClick={handleConfirmDuplicate} className="create-product-btn" disabled={loading}>
                      {loading ? "Processing..." : "Yes, update"}
                    </button>
                    <button type="button" onClick={() => setShowDuplicateConfirm(false)} className="delete-confirm-btn" disabled={loading}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Formulario principal */}
          {!(showDuplicateConfirm || showDeleteConfirm) && (
            <form onSubmit={handleSubmit}>
              {/* Los placeholders y valores ahora usan 'product' o 'formData' */}
              <h2>Product Name</h2>
              <input
                type="text"
                name="product_name"
                placeholder={product?.product_name || "Enter product name"}
                required
                value={formData.product_name}
                onChange={handleChange}
                disabled={loading}
              />

              <h2>Description</h2>
              <textarea
                name="description"
                placeholder={product?.description || "Enter product description"}
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
              />

              <div className="price-stock-container">
                <div className="form-group">
                  <h2>Price</h2>
                  <input
                    type="number"
                    name="price"
                    placeholder={product?.price?.toString() || "9.99"}
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <h2>Stock</h2>
                  <input
                    type="number"
                    name="stock"
                    placeholder={product?.stock?.toString() || "100"}
                    required
                    value={formData.stock}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <h2 className="image-title">Image</h2>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                disabled={loading}
              />

              <div className="add-product-buttons">
                <button type="submit" className="update-product-btn" disabled={loading}>
                  {loading ? "Updating..." : "Update Product"}
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
};

export default EditProductModal;
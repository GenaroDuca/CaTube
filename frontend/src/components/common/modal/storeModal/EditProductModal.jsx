import React, { useState, useEffect, useCallback } from 'react';
import { IoIosCloseCircle } from "react-icons/io";
import { useToast } from '../../../../hooks/useToast.jsx';
import { VITE_API_URL } from "../../../../../config"

// ----------------------------------------------------------------------
// FUNCIONES DE FETCH (CORREGIDAS: localStorage.getItem)
// ----------------------------------------------------------------------

/**
 * Obtiene la lista de productos del usuario para verificar duplicados.
 * Maneja errores de red y de autenticación (401).
 */
async function getExistingProductsSolo() {
  // CORRECCIÓN: Usar localStorage.getItem
  const accessToken = localStorage.getItem('accessToken');
  const url = `${VITE_API_URL}/product/my-products`;

  const headers = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(url, { method: 'GET', headers });

    if (response.status === 401) {
      throw new Error("Authentication failed. Cannot check for duplicate names.");
    }

    if (response.ok && response.headers.get("content-type")?.includes("application/json")) {
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching existing products for edit:', error);
    throw error;
  }
}

/**
 * Realiza el fetch para actualizar un producto existente.
 */
async function updateProductSolo(productId, formDataToSend) {
  // CORRECCIÓN: Usar localStorage.getItem
  const accessToken = localStorage.getItem('accessToken');
  const url = `${VITE_API_URL}/product/${productId}`;

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

/**
 * Realiza el fetch para eliminar un producto existente.
 */
async function deleteProductSolo(productId) {
  // CORRECCIÓN: Usar localStorage.getItem
  const accessToken = localStorage.getItem('accessToken');
  const url = `${VITE_API_URL}/product/${productId}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      // Si el body está vacío, 'Content-Type' no es necesario, solo el Auth.
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (response.ok) {
      return true;
    }

    let errorBody = null;
    if (response.headers.get("content-type")?.includes("application/json")) {
      errorBody = await response.json().catch(() => ({}));
    }
    const errorMessage = errorBody?.message || response.statusText;
    throw new Error(errorMessage || "Failed to delete product on the server.");

  } catch (error) {
    console.error("Network or parsing error during product deletion:", error);
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
    price: productData?.price?.toString() || '',
    stock: productData?.stock?.toString() || '',
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [existingProducts, setExistingProducts] = useState([]);
  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false);

  const [descriptionError, setDescriptionError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { showSuccess, showError } = useToast();

  // ----------------------------------------------------------------------
  // CONSTANTE DE LÍMITE DE CARACTERES
  // ----------------------------------------------------------------------
  const MAX_DESCRIPTION_LENGTH = 255;
  const MAX_TITLE_LENGTH = 60;

  // ----------------------------------------------------------------------
  // MANEJADORES DE ESTADO DEL FORMULARIO
  // ----------------------------------------------------------------------

  const handleChange = useCallback((e) => {
    const { name, value, files } = e.target;

    if (name === 'description') return;

    setFormData(prevData => ({
      ...prevData,
      [name]: name === 'image' && files ? files[0] : value
    }));
  }, []);

  const handleDescriptionChange = useCallback((e) => {
    const newDesc = e.target.value;
    const currentLength = newDesc.length;

    if (currentLength > MAX_DESCRIPTION_LENGTH) {
      setDescriptionError(`Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`);
    } else {
      setDescriptionError('');
      setFormData(prevData => ({
        ...prevData,
        description: newDesc,
      }));
    }
  }, []);


  // ----------------------------------------------------------------------
  // LÓGICA DE ACTUALIZACIÓN
  // ----------------------------------------------------------------------

  const handleUpdateLogic = useCallback(async () => {
    if (!product || !product.product_id) return;

    setLoading(true);
    setError(null);
    setShowDuplicateConfirm(false);

    // 1. Validaciones
    const priceValue = parseFloat(formData.price);
    const stockValue = parseInt(formData.stock, 10);

    if (priceValue < 0) {
      showError("Price cannot be negative");
      setLoading(false);
      return;
    }
    if (stockValue < 0) {
      showError("Stock cannot be negative");
      setLoading(false);
      return;
    }

    if (descriptionError) {
      showError("Please correct the description length error.");
      setLoading(false);
      return;
    }

    // 2. Construir FormData
    const formDataToSend = new FormData();
    formDataToSend.append("product_name", formData.product_name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("price", priceValue);
    formDataToSend.append("stock", stockValue);

    if (formData.image) {
      formDataToSend.append("image", formData.image);
    }

    // 3. Llamada a la API
    try {
      const result = await updateProductSolo(product.product_id, formDataToSend);

      if (result) {
        showSuccess("Product edited successfully!");
        if (onProductUpdated) onProductUpdated();
        else window.location.reload();
        onClose();
      }
    } catch (err) {
      showError(err.message || "Failed to update product");
      setError(err.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  }, [formData, product, onClose, onProductUpdated, showSuccess, showError, descriptionError]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (descriptionError) {
      showError("Please correct the description length error.");
      return;
    }

    if (error && error.includes("Cannot check for duplicate names")) {
      await handleUpdateLogic();
      return;
    }

    const isDuplicate = existingProducts.some(
      (p) => p.product_id !== product.product_id && p.product_name.toLowerCase() === formData.product_name.toLowerCase()
    );

    if (isDuplicate && !showDuplicateConfirm) {
      setShowDuplicateConfirm(true);
      return;
    }

    await handleUpdateLogic();
  };


  const handleConfirmDelete = useCallback(async () => {
    if (!product || !product.product_id) return;

    setLoading(true);
    setError(null);
    setShowDeleteConfirm(false);

    try {
      const success = await deleteProductSolo(product.product_id);

      if (success) {
        showSuccess("Product deleted successfully!");
        if (onProductUpdated) onProductUpdated();
        else window.location.reload();
        onClose();
      }
    } catch (err) {
      showError(err.message || "Failed to delete product");
      setError(err.message || "Failed to delete product");
    } finally {
      setLoading(false);
    }
  }, [product, onProductUpdated, onClose, showError, showSuccess]);


  // ----------------------------------------------------------------------
  // EFECTOS (Solo para carga de datos inicial)
  // ----------------------------------------------------------------------

  useEffect(() => {
    // Función para cargar los productos existentes
    const fetchExisting = async () => {
      try {
        if (productData) {
          const products = await getExistingProductsSolo();
          setExistingProducts(products);
          setError(null);
        }
      } catch (err) {
        console.error("Warning: Cannot fetch existing products for duplicate check:", err.message);

        if (err.message.includes("Authentication failed")) {
          setError("Warning: Cannot check for duplicate names. Please log in again.");
        } else {
          setError("Warning: Cannot check for duplicate names due to a network error.");
        }
      }
    };

    if (productData) {
      fetchExisting();
    }

  }, [productData]);


  // ----------------------------------------------------------------------
  // RENDERIZADO
  // ----------------------------------------------------------------------

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
          {error && <div className="error-message">{error}</div>}

          {(showDuplicateConfirm || showDeleteConfirm) && (
            <div className="confirmation-overlay">
              {/* Confirmación de Duplicado */}
              {showDuplicateConfirm && (
                <div className="duplicate-confirm">
                  <p>A product with this name already exists. Are you sure you want to update to a duplicate name?</p>
                  <div className="confirm-buttons">
                    <button type="button" onClick={handleUpdateLogic} className="create-product-btn" disabled={loading}>
                      {loading ? "Processing..." : "Yes, update"}
                    </button>
                    <button type="button" onClick={() => setShowDuplicateConfirm(false)} className="delete-confirm-btn" disabled={loading}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Confirmación de Eliminación */}
              {showDeleteConfirm && (
                <div className="delete-confirm">
                  <p>Are you sure you want to delete the product: **{productData.product_name}**?</p>
                  <div className="confirm-buttons">
                    <button type="button" onClick={handleConfirmDelete} className="delete-confirm-btn" disabled={loading}>
                      {loading ? "Deleting..." : "Yes, Delete"}
                    </button>
                    <button type="button" onClick={() => setShowDeleteConfirm(false)} className="create-product-btn" disabled={loading}>
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
              <div>
                <h2>Product Name</h2>
                <input
                  type="text"
                  name="product_name"
                  placeholder={product?.product_name || "Enter product name"}
                  required
                  value={formData.product_name}
                  onChange={handleChange}
                  disabled={loading}
                  maxLength={MAX_TITLE_LENGTH}
                />
                <div className="title-counter" style={{ width: '100%', textAlign: 'right', marginTop: '-20px' }}>
                  {formData.product_name.length} / {MAX_TITLE_LENGTH}
                </div>

                <h2>Description</h2>
                <textarea
                  name="description"
                  placeholder={product?.description || "Enter product description"}
                  value={formData.description}
                  onChange={handleDescriptionChange}
                  disabled={loading}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                />

                {/* SPAN DE CONTADOR DE CARACTERES */}
                <div className="description-counter" style={{ width: '100%', textAlign: 'right', marginTop: '-20px' }}>
                  {formData.description.length} / {MAX_DESCRIPTION_LENGTH}
                </div>
                {/* FIN SPAN DE CONTADOR DE CARACTERES */}

                {/* Muestra el error, si existe */}
                {descriptionError && <p className="error-text" style={{ color: '#e96765' }}>{descriptionError}</p>}

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
              </div>

              <div className="add-product-buttons">
                <button type="submit" className="update-product-btn" disabled={loading || !!descriptionError}>
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
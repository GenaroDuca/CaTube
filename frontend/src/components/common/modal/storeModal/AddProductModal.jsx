import React, { useState, useEffect, useCallback } from "react";
import { useToast } from '../../../../hooks/useToast.jsx';
import { IoIosCloseCircle } from "react-icons/io";

// ----------------------------------------------------------------------
// FUNCIONES DE FETCH (MOVIDAS DENTRO DEL ARCHIVO)
// ----------------------------------------------------------------------

const BASE_URL = 'http://localhost:3000';

/**
 * Obtiene la lista de productos del usuario para verificar duplicados.
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
        if (response.ok && response.headers.get("content-type")?.includes("application/json")) {
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        }
        return [];
    } catch (error) {
        console.error('Error fetching existing products:', error);
        return [];
    }
}

/**
 * Realiza el fetch para crear un nuevo producto.
 * @param {FormData} formDataToSend - Datos del producto, incluyendo el archivo de imagen.
 * @returns {Promise<object|null>} El producto creado o null si falla.
 */
async function createProductSolo(formDataToSend) {
    const accessToken = localStorage.getItem('accessToken');
    const url = `${BASE_URL}/product`;

    for (const [key, value] of formDataToSend.entries()) {
        console.log(key, value);
    }

    const headers = {};
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: formDataToSend,
        });

        if (response.status === 201) {
            return await response.json();
        }

        // Manejo de errores específicos del API (p.ej., validación del servidor)
        let errorBody = null;
        if (response.headers.get("content-type")?.includes("application/json")) {
            errorBody = await response.json().catch(() => ({}));
        }

        const errorMessage = errorBody?.message || response.statusText;
        console.error("Product creation failed:", errorMessage);
        throw new Error(errorMessage || "Failed to create product on the server.");

    } catch (error) {
        console.error("Network or parsing error during product creation:", error);
        throw new Error(error.message || "A network error occurred.");
    }
}

// ----------------------------------------------------------------------

const AddProductModal = ({ onClose, onProductAdded }) => { // Agregué onProductAdded
    const [formData, setFormData] = useState({
        product_name: "",
        description: "",
        price: "",
        stock: "",
        image: null,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [existingProducts, setExistingProducts] = useState([]);
    const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false);

    // FeedbackToast
    const { showSuccess, showError } = useToast();

    // Función para cargar productos existentes (usando la función interna)
    useEffect(() => {
        const fetchExisting = async () => {
            const products = await getExistingProductsSolo();
            setExistingProducts(products);
        };
        fetchExisting();
    }, []); // Se ejecuta solo una vez al montar

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    // Función para manejar la lógica de envío, incluyendo el paso de confirmación duplicada
    const handleSubmissionLogic = useCallback(async () => {
        setLoading(true);
        setError(null);
        setShowDuplicateConfirm(false); // Reseteamos la confirmación

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
            const result = await createProductSolo(formDataToSend);

            if (result) {
                showSuccess(`Product "${result.product_name}" added successfully!`);

                // NOTA IMPORTANTE: Usar el callback para refrescar la lista en el componente padre
                if (onProductAdded) {
                    onProductAdded();
                } else {
                    window.location.reload(); // Fallback si no hay callback
                }

                onClose();
            } else {
                // Esto solo debería pasar si createProductSolo falla pero no lanza error, lo cual es raro
                showError("Failed to add product (Unknown reason)");
            }
        } catch (err) {
            // Error capturado desde createProductSolo
            showError(err.message || "Failed to add product");
            setError(err.message || "An error occurred during product creation.");
        } finally {
            setLoading(false);
        }
    }, [formData, onProductAdded, onClose, showError, showSuccess]); // Incluimos todas las dependencias

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check for duplicate product name (case-insensitive)
        const isDuplicate = existingProducts.some(
            (product) => product.product_name.toLowerCase() === formData.product_name.toLowerCase()
        );

        if (isDuplicate && !showDuplicateConfirm) {
            setShowDuplicateConfirm(true);
            return;
        }

        // Si no es duplicado O ya se confirmó el duplicado, procedemos.
        await handleSubmissionLogic();
    };

    // La lógica de confirmación duplicada necesita una pequeña corrección
    // para que la llamada sea limpia y no dependa de un evento falso.
    const handleConfirmDuplicate = () => {
        // Seteamos la bandera a false y luego llamamos a la lógica principal
        setShowDuplicateConfirm(false);
        handleSubmissionLogic();
    };


    return (
        <div className="add-product-modal">
            <div className="add-product-content">
                <header>
                    <h1>Add a new Product</h1>
                    <button type="button" onClick={onClose} className="close-add-product-modal">
                        <IoIosCloseCircle size={25} color="#1a1a1b" />
                    </button>
                </header>
                <main>
                    {error && <div className="error-message">{error}</div>}
                    {showDuplicateConfirm && (
                        <div className="duplicate-confirm">
                            <p>A product with this name already exists. Are you sure you want to add a duplicate product?</p>
                            <div className="confirm-buttons">
                                <button type="button" onClick={handleConfirmDuplicate} className="create-product-btn" disabled={loading}>
                                    {loading ? "Adding..." : "Yes"}
                                </button>
                                <button type="button" onClick={() => setShowDuplicateConfirm(false)} className="delete-confirm-btn" disabled={loading}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* El formulario solo es visible si no estamos en el paso de confirmación duplicada */}
                    {!showDuplicateConfirm && (
                        <form onSubmit={handleSubmit}>
                            <div>
                                {/* ... (Toda la estructura del formulario permanece igual) ... */}

                                <h2>Product Name</h2>
                                <input
                                    type="text"
                                    name="product_name"
                                    placeholder="Enter product name"
                                    required
                                    value={formData.product_name}
                                    onChange={handleChange}
                                    disabled={loading}
                                />

                                <h2>Description</h2>
                                <textarea
                                    name="description"
                                    placeholder="Enter product description"
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
                                            placeholder="9.99"
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
                                            placeholder="100"
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
                                <button type="submit" className="create-product-btn" disabled={loading}>
                                    {loading ? "Adding..." : "Add Product"}
                                </button>
                            </div>
                        </form>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AddProductModal;

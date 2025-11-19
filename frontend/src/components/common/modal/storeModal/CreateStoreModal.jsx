import React, { useState } from 'react';
import { IoIosCloseCircle } from "react-icons/io";
import { useToast } from '../../../../hooks/useToast';
import { API_URL } from "../../../../../config"

// ----------------------------------------------------------------------
// FUNCIONES DE FETCH (INTEGRADAS EN EL ARCHIVO)
// ----------------------------------------------------------------------

/**
 * Realiza el fetch para crear una nueva tienda.
 * @param {object} storeData - Datos de la tienda (store_name, description).
 * @returns {Promise<object|null>} El objeto de la tienda creada o null si falla.
 */
async function createStoreSolo(storeData) {
    const accessToken = localStorage.getItem('accessToken');
    const url = `${API_URL}/store`;

    const headers = {
        'Content-Type': 'application/json',
    };
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(storeData),
        });

        if (response.status === 201) {
            // Creado exitosamente
            return await response.json();
        }

        // Manejo de errores (p.ej., 409 Conflict si ya existe, 400 Bad Request)
        let errorBody = null;
        if (response.headers.get("content-type")?.includes("application/json")) {
            errorBody = await response.json().catch(() => ({}));
        }

        const errorMessage = errorBody?.message || response.statusText;
        console.error("Store creation failed:", errorMessage);

        // Lanzamos una excepción para que el handleSubmit la capture
        throw new Error(errorMessage || "Failed to create store on the server.");

    } catch (error) {
        console.error("Network or parsing error during store creation:", error);
        throw new Error(error.message || "A network error occurred.");
    }
}

// ----------------------------------------------------------------------

/**
 * Modal para la creación de una nueva tienda.
 * @param {object} props - Propiedades del componente.
 * @param {function} props.onClose - Función para cerrar el modal.
 * @param {function} props.onCreate - Función callback a ejecutar tras la creación exitosa.
 */
const CreateStoreModal = ({ onClose, onCreate }) => {
    // Estado para los campos del formulario
    const [storeName, setStoreName] = useState('');
    const [storeDescription, setStoreDescription] = useState('');

    // Estado para la UI: carga y errores
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // FeedbackToast y Modal Context
    const { showSuccess, showError } = useToast();
    /**
     * Maneja el envío del formulario para crear la tienda.
     * @param {Event} e - Evento de envío del formulario.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        const trimmedName = storeName.trim();

        // 1. Validación de cliente
        if (!trimmedName) {
            setErrorMessage('The store name is required.');
            return;
        }

        setErrorMessage('');
        setLoading(true);

        // 2. Preparar los datos
        const storeData = {
            store_name: trimmedName,
            description: storeDescription.trim(),
        };

        // 3. Llamada a la API usando la función local
        try {
            const response = await createStoreSolo(storeData);

            // Éxito (createStoreSolo retorna el objeto si status 201)
            showSuccess('Store created successfully!');

            // 4. Notificar al padre y cerrar
            window.location.reload();
            onClose();

        } catch (error) {
            // Fallo capturado por createStoreSolo (incluye errores de servidor 4xx/5xx y errores de red)
            setErrorMessage(error.message || 'An unexpected error occurred while creating the store.');

        } finally {
            setLoading(false);
        }
    };

    // Determina si el botón debe estar deshabilitado
    const isSubmitDisabled = loading || !storeName.trim();

    return (
        <div className="create-store-modal">
            <div className="create-store-content">
                <header>
                    <h1>Create Your Store</h1>
                    <button
                        type="button"
                        onClick={onClose}
                        className="close-create-store-modal"
                        disabled={loading}
                        aria-label="Close modal"
                    >
                        <IoIosCloseCircle size={25} color="#1a1a1b" />
                    </button>
                </header>

                <main>

                    <form onSubmit={handleSubmit}>
                        <div>
                            {/* Mensaje de Error */}
                            {errorMessage && <p className="error-message" style={{ color: 'red' }}>{errorMessage}</p>}

                            {/* Campo de Nombre */}
                            <label htmlFor="store-name-input"><h2>Store Name</h2></label>
                            <input
                                id="store-name-input"
                                type="text"
                                placeholder="Enter your store name (Required)"
                                value={storeName}
                                onChange={(e) => setStoreName(e.target.value)}
                                disabled={loading}
                                required
                            />

                            {/* Campo de Descripción */}
                            <label htmlFor="store-description-input"><h2>Store Description</h2></label>
                            <textarea
                                id="store-description-input"
                                placeholder="Enter your store description (Optional)"
                                value={storeDescription}
                                onChange={(e) => setStoreDescription(e.target.value)}
                                disabled={loading}
                            />

                            {/* Botón de Envío */}
                        </div>
                        <button
                            type="submit"
                            className="create-store-btn"
                            disabled={isSubmitDisabled}
                        >
                            {loading ? 'Creating...' : 'Create Store'}
                        </button>
                    </form>
                </main>
            </div>
        </div >
    );
};

export default CreateStoreModal;
import React, { useState } from 'react';
import { IoIosCloseCircle } from "react-icons/io";
import { useToast } from '../../../../hooks/useToast';
import { VITE_API_URL } from "../../../../../config"

// ----------------------------------------------------------------------
// FUNCIONES DE FETCH (MOVIDAS DENTRO DEL ARCHIVO)
// ----------------------------------------------------------------------

/**
 * Realiza el fetch para crear una nueva tienda.
 * @param {object} storeData - Datos de la tienda (store_name, description).
 * @returns {Promise<object|null>} El objeto de la tienda creada o null si falla.
 */
async function createStoreSolo(storeData) {
    const accessToken = localStorage.getItem('accessToken');
    const url = `${VITE_API_URL}/store`;

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
            return await response.json();
        }

        let errorBody = null;
        if (response.headers.get("content-type")?.includes("application/json")) {
            errorBody = await response.json().catch(() => ({}));
        }

        const errorMessage = errorBody?.message || response.statusText;
        console.error("Store creation failed:", errorMessage);
        throw new Error(errorMessage || "Failed to create store on the server.");

    } catch (error) {
        console.error("Network or parsing error during store creation:", error);
        throw new Error(error.message || "A network error occurred.");
    }
}

// ----------------------------------------------------------------------
// CONSTANTE DE LÍMITE DE CARACTERES
// ----------------------------------------------------------------------
const MAX_DESCRIPTION_LENGTH = 255;

/**
 * Modal para la creación de una nueva tienda.
 */
const CreateStoreModal = ({ onClose, onCreate }) => {
    const [storeName, setStoreName] = useState('');
    const [storeDescription, setStoreDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const { showSuccess, showError } = useToast();

    /**
     * Maneja el cambio en el campo de descripción, aplicando el límite.
     */
    const handleDescriptionChange = (e) => {
        if (e.target.value.length <= MAX_DESCRIPTION_LENGTH) {
            setStoreDescription(e.target.value);
        }
    };

    /**
     * Maneja el envío del formulario para crear la tienda.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        const trimmedName = storeName.trim();

        if (!trimmedName) {
            setErrorMessage('The store name is required.');
            return;
        }

        setErrorMessage('');
        setLoading(true);

        const storeData = {
            store_name: trimmedName,
            description: storeDescription.trim(),
        };

        try {
            const response = await createStoreSolo(storeData);
            showSuccess(`Store "${response.store_name}" created successfully!`);

            if (onCreate) {
                onCreate(response);
            }
            window.location.reload();
            onClose();

        } catch (error) {
            const msg = error.message || 'An unexpected error occurred while creating the store.';
            showError(msg);
            setErrorMessage(msg);

        } finally {
            setLoading(false);
        }
    };

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
                            {errorMessage && <p className="error-message" style={{ color: 'red' }}>{errorMessage}</p>}

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

                            <label htmlFor="store-description-input"><h2>Store Description</h2></label>
                            <textarea
                                id="store-description-input"
                                placeholder="Enter your store description (Optional)"
                                value={storeDescription}
                                onChange={handleDescriptionChange} // Usamos la nueva función
                                disabled={loading}
                                maxLength={MAX_DESCRIPTION_LENGTH} // Atributo HTML para accesibilidad
                            />

                            {/* SPAN DE CONTADOR DE CARACTERES */}
                            <span className="char-counter" style={{ display: 'block', textAlign: 'right', fontSize: '0.8rem',  marginTop: '-20px', color: storeDescription.length === MAX_DESCRIPTION_LENGTH ? '#e96765' : 'var(--text-color)' }}>
                                {storeDescription.length}/{MAX_DESCRIPTION_LENGTH}
                            </span>
                            {/* FIN SPAN DE CONTADOR DE CARACTERES */}


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
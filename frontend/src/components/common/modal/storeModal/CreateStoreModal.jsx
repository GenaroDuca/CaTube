import React, { useState } from 'react';
import { IoIosCloseCircle } from "react-icons/io";
import apiService from "../../../studioPageComponents/store/apiServiceStore";

/**
 * Modal para la creación de una nueva tienda.
 * @param {object} props - Propiedades del componente.
 * @param {function} props.onClose - Función para cerrar el modal.
 * @param {function} props.onCreate - Función callback a ejecutar tras la creación exitosa (e.g., para recargar la lista de tiendas).
 */
const CreateStoreModal = ({ onClose, onCreate }) => {
    // Estado para los campos del formulario
    const [storeName, setStoreName] = useState('');
    const [storeDescription, setStoreDescription] = useState('');
    
    // Estado para la UI: carga y errores
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    /**
     * Maneja el envío del formulario para crear la tienda.
     * @param {Event} e - Evento de envío del formulario.
     */
    const handleSubmit = async (e) => {
        // Prevenir el comportamiento por defecto de submit, que recargaría la página
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

        // 3. Llamada a la API y manejo de respuesta
        try {
            const response = await apiService.createStore(storeData);
            
            if (response) {
                // Éxito (201 Created)
                console.log('Store created successfully:', response);
                
                // 4. Notificar al padre y cerrar
                if (onCreate) {
                    // Llama al callback (ej: fetchProducts) para actualizar la vista
                    onCreate(); 
                }
                onClose();
            } else {
                // Fallo (Error 4xx o 5xx manejado por apiService, que devuelve null)
                // Se establece un mensaje de error genérico para el usuario
                setErrorMessage('Failed to create store. It may already exist or there was a server error.');
            }
        } catch (error) {
            // Error de red (catch del try/finally en apiService)
             setErrorMessage('Connection error. Could not reach the server.');
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
                        disabled={loading} // Deshabilita el cierre durante la carga
                        aria-label="Close modal"
                    >
                        <IoIosCloseCircle size={25} color="#1a1a1b" />
                    </button>
                </header>
                
                {/* Usamos <form> y handleSubmit para una mejor accesibilidad y manejo del evento */}
                <form onSubmit={handleSubmit}>
                    <main>
                        {/* Mensaje de Error */}
                        {errorMessage && <p className="error-message" style={{ color: 'red' }}>{errorMessage}</p>}

                        {/* Campo de Nombre */}
                        <label htmlFor="store-name-input">Store Name</label>
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
                        <label htmlFor="store-description-input">Store Description</label>
                        <textarea
                            id="store-description-input"
                            placeholder="Enter your store description (Optional)"
                            value={storeDescription}
                            onChange={(e) => setStoreDescription(e.target.value)}
                            disabled={loading}
                        />

                        {/* Botón de Envío */}
                        <button 
                            type="submit" // Cambiado a type="submit" para usar el evento form onSubmit
                            className="create-store-btn" 
                            disabled={isSubmitDisabled}
                        >
                            {loading ? 'Creating...' : 'Create Store'}
                        </button>
                    </main>
                </form>
            </div>
        </div>
    );
};

export default CreateStoreModal;
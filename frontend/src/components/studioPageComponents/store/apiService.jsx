// --- API Service: Centraliza todas las llamadas al backend ---
import { VITE_API_URL } from '../../../config';

const apiService = {

    async _fetch(url, options = {}) {
        const accessToken = localStorage.getItem('accessToken');
        // No establecer Content-Type por defecto, FormData lo hace automáticamente.
        const headers = { ...options.headers };

        // Solo añadir Content-Type si el body no es FormData
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        try {
            const response = await fetch(`${VITE_API_URL}${url}`, { ...options, headers });

            if (response.status === 404) {
                return null; // Devuelve null si el recurso no se encuentra
            }

            // Para FormData, la respuesta puede no ser JSON en caso de error de servidor
            const contentType = response.headers.get("content-type");
            let responseBody;
            if (contentType && contentType.indexOf("application/json") !== -1) {
                responseBody = await response.json();
            } else {
                responseBody = { message: await response.text() };
            }

            if (!response.ok) {
                const errorMessage = Array.isArray(responseBody.message) ? responseBody.message.join(', ') : JSON.stringify(responseBody.message);
                alert(`Error ${response.status}: ${errorMessage}`);
                console.error('Server response:', response.status, responseBody);
                return null;
            }
            return responseBody;
        } catch (error) {
            console.error('Connection error:', error);
            alert('Could not connect to the server.');
            return null;
        }
    },

    getChannelData(channelId) {
        if (!channelId) {
            console.error('No se encontró channelId.');
            return Promise.resolve(null);
        }
        return this._fetch(`/channels/${channelId}`);
    },

    updateChannel(channelId, data) {
        return this._fetch(`/channels/${channelId}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },

    createStore(data) {
        return this._fetch('/store', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    getMyStore() {
        return this._fetch('/store/my-store');
    },

    createProduct(formData) {
        return this._fetch('/product', {
            method: 'POST',
            body: formData, // FormData se pasa directamente
        });
    },

    getMyProducts() {
        return this._fetch('/product/my-products');
    },

    deleteProduct(productId) {
        return this._fetch(`/product/${productId}`, {
            method: 'DELETE',
        });
    },

    getProduct(productId) {
        return this._fetch(`/product/${productId}`);
    },

    updateProduct(productId, productData) {
        // Si es FormData, enviamos directamente, si no, JSON
        return this._fetch(`/product/${productId}`, {
            method: 'PATCH',
            body: productData instanceof FormData ? productData : JSON.stringify(productData),
        });
    }
};

export default apiService;

const apiService = {
    BASE_URL: 'http://localhost:3000',

    async _fetch(url, options = {}) {
        const accessToken = localStorage.getItem('accessToken');
        const headers = { ...options.headers };

        // Solo añadir Content-Type: application/json si el body NO es FormData
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        try {
            const response = await fetch(`${this.BASE_URL}${url}`, { ...options, headers });

            // Comprobación de tipo de contenido
            const contentType = response.headers.get("content-type");
            const isJson = contentType?.includes("application/json");
            let responseBody = null;

            // Intentamos leer el cuerpo solo si existe y no es 204 No Content
            if (response.status !== 204) {
                try {
                    responseBody = isJson ? await response.json() : await response.text();
                } catch (e) {
                    responseBody = null;
                }
            }

            // Manejo de estados de respuesta no exitosos
            if (!response.ok) {

                // Manejo específico de 404 para getMyStore/getProduct
                if (response.status === 404) {
                    return null; 
                }

                // Construir el mensaje de error para la consola
                let errorMessage = `Status ${response.status}: ${response.statusText}`;
                if (isJson && responseBody && responseBody.message) {
                    errorMessage = Array.isArray(responseBody.message)
                        ? responseBody.message.join(', ')
                        : (typeof responseBody.message === 'string' ? responseBody.message : JSON.stringify(responseBody.message));
                } else if (typeof responseBody === 'string') {
                    errorMessage = responseBody;
                }

                console.error(`Error ${response.status} en ${url}: ${errorMessage}`);
                // Retornar null para que el componente pueda manejar la falta de datos
                return null;
            }

            // Si la respuesta es exitosa (2xx), retorna el cuerpo (o null para 204)
            return responseBody;

        } catch (error) {
            console.error('Connection error:', error);
            alert('Could not connect to the server.');
            return null;
        }
    },

    // --- Store Endpoints ---

    createStore(data) {
        return this._fetch('/store', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    getMyStore() {
        // Retorna el objeto de la tienda o null si da 404
        return this._fetch('/store/my-store');
    },

    // --- Product Endpoints ---

    createProduct(formData) {
        return this._fetch('/product', {
            method: 'POST',
            body: formData,
        });
    },

    getMyProducts() {
        // Retorna el array de productos o null si da 404/error
        return this._fetch('/product/my-products');
    },

    deleteProduct(productId) {
        // Retorna null (por 204 No Content) o null si hay error.
        return this._fetch(`/product/${productId}`, {
            method: 'DELETE',
        });
    },

    getProduct(productId) {
        return this._fetch(`/product/${productId}`);
    },

    updateProduct(productId, productData) {
        // Acepta JSON o FormData
        return this._fetch(`/product/${productId}`, {
            method: 'PATCH',
            body: productData instanceof FormData ? productData : JSON.stringify(productData),
        });
    }
};

export default apiService;
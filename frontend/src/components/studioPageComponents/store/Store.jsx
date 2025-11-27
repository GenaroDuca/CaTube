import Title from "../../trendingPageComponents/Title";
import Container from "../../common/Container";
import NewButton from "../../homePageComponents/Button";
import { useModal } from "../../common/modal/ModalContext";
import { useState, useEffect, useCallback, useMemo } from "react";
import ProductCard from './ProductCard';
import { useToast } from '../../../hooks/useToast';
import { VITE_API_URL } from '../../../../config';
import { IoIosAdd } from "react-icons/io";

// ----------------------------------------------------------------------
// FUNCIONES DE SERVICIO (FUERA DEL COMPONENTE REACT)
// ----------------------------------------------------------------------

/** Función autocontenida para obtener la tienda del usuario. */
async function getMyStore() {
    const accessToken = localStorage.getItem('accessToken');
    const url = `${VITE_API_URL}/store/my-store`;

    const headers = {};
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
        const response = await fetch(url, { method: 'GET', headers });

        if (response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType?.includes("application/json")) {
                return await response.json(); // Devuelve el objeto Store
            }
            return null;
        }

        // Si el estado es 404 (No Store Found), es un resultado válido (tienda no existe)
        if (response.status === 404) {
            return null;
        }

        let errorBody = null;
        if (response.headers.get("content-type")?.includes("application/json")) {
            errorBody = await response.json().catch(() => ({}));
        }
        const errorMessage = errorBody?.message || response.statusText;
        throw new Error(errorMessage);

    } catch (error) {
        console.error('Error en getMyStore:', error);
        throw new Error(error.message || "Connection error.");
    }
}

/** Función autocontenida para obtener la lista de productos del usuario. */
async function getMyProducts() {
    const accessToken = localStorage.getItem('accessToken');
    const url = `${VITE_API_URL}/product/my-products`;

    const headers = {};
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
        const response = await fetch(url, { method: 'GET', headers });

        if (response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType?.includes("application/json")) {
                const data = await response.json();
                return Array.isArray(data) ? data : [];
            }
            return [];
        }

        let errorBody = null;
        if (response.headers.get("content-type")?.includes("application/json")) {
            errorBody = await response.json().catch(() => ({}));
        }
        const errorMessage = errorBody?.message || response.statusText;
        throw new Error(`Failed to fetch products (Status ${response.status}): ${errorMessage}`);

    } catch (error) {
        console.error('Error en getMyProducts:', error);
        throw new Error(error.message || "Connection error during product fetch.");
    }
}

/** Eliminar un producto por ID. */
async function deleteProduct(productId) {
    const accessToken = localStorage.getItem('accessToken');
    const url = `${VITE_API_URL}/product/${productId}`; // Asumo que tu ruta DELETE es /product/:id

    const headers = {};
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
        const response = await fetch(url, { method: 'DELETE', headers });

        if (!response.ok) {
            let errorBody = null;
            if (response.headers.get("content-type")?.includes("application/json")) {
                errorBody = await response.json().catch(() => ({}));
            }
            const errorMessage = errorBody?.message || response.statusText;
            throw new Error(errorMessage);
        }

        return true;

    } catch (error) {
        console.error('Error al eliminar producto:', error);
        throw new Error(error.message || "Connection error during product deletion.");
    }
}

/** Función autocontenida para eliminar la tienda del usuario. */
async function deleteStore(storeId) {
    const accessToken = localStorage.getItem('accessToken');
    const url = `${VITE_API_URL}/store/${storeId}`;

    const headers = {};
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
        const response = await fetch(url, { method: 'DELETE', headers });

        if (!response.ok) {
            let errorBody = null;
            if (response.headers.get("content-type")?.includes("application/json")) {
                errorBody = await response.json().catch(() => ({}));
            }
            const errorMessage = errorBody?.message || response.statusText;
            throw new Error(errorMessage);
        }

        return true;

    } catch (error) {
        console.error('Error al eliminar la tienda:', error);
        throw new Error(error.message || "Connection error during store deletion.");
    }
}


// ----------------------------------------------------------------------

function Store() {
    const { openModal, closeModal } = useModal();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [storeExists, setStoreExists] = useState(true);
    const [error, setError] = useState(null);
    const isOwner = true
    // FeedbackToast y Modal Context
    const { showSuccess, showError } = useToast();

    // Almacena los datos de la tienda
    const [storeData, setStoreData] = useState(null);

    // Estado derivado para forzar la re-ejecución del useEffect (funciona con la key del padre)
    const authStatus = useMemo(() => {
        return localStorage.getItem('accessToken') ? 'logged_in' : 'logged_out';
    }, []);

    // --- MANEJADORES ---

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        setStoreExists(true);
        setStoreData(null);

        try {
            const store = await getMyStore();

            if (!store || !store.store_id) {
                setStoreData(null);
                setStoreExists(false);
                setProducts([]);
                setError(store ? null : "You don't have a store yet. Please create one.");
                return;
            }

            // Almacenar los datos de la tienda
            setStoreData(store);
            setStoreExists(true);
            setError(null);

            const data = await getMyProducts();

            if (data && Array.isArray(data)) {
                setProducts(data);
                if (data.length === 0) {
                    setError("You haven't added any products yet.");
                }
            } else {
                setProducts([]);
                setError("Failed to load products from your store (Invalid data format).");
            }

        } catch (err) {
            console.error("Error fetching store or products:", err);

            const isAuthError = err.message.includes("401") || err.message.toLowerCase().includes("unauthorized");

            setStoreData(null);
            setStoreExists(false);
            setProducts([]);

            if (isAuthError) {
                setError("Your session has expired or you are not logged in. Please log in.");
                localStorage.removeItem('accessToken');
            } else {
                setError(err.message || "An unexpected error occurred while loading data. Please check your network connection.");
            }

        } finally {
            setLoading(false);
        }
    }, []);

    // Efecto para la carga inicial de datos y manejo de la sesión
    useEffect(() => {
        if (authStatus === 'logged_in') {
            fetchProducts();
        } else {
            setStoreExists(false);
            setProducts([]);
            setLoading(false);
            setStoreData(null); // Limpieza de datos al desloguearse
            setError("You must be logged in to view your store. Please log in.");
        }
    }, [fetchProducts, authStatus]);

    /** MODIFICACIÓN: Implementación del modal de confirmación y llamada a la API para eliminar PRODUCTO. */
    const handleDeleteProduct = useCallback((product) => {
        const apiDeleteHandler = async () => {
            try {
                await deleteProduct(product.product_id);
                showSuccess(`Product "${product.product_name}" deleted successfully.`);
                closeModal();
                fetchProducts(); // Refrescar la lista de productos
            } catch (error) {
                console.error("Error al confirmar eliminación de producto:", error.message);
                showError(`Error deleting product: ${error.message}`);
                closeModal();
                fetchProducts();
            }
        };

        openModal("confirm", {
            title: "Delete Product",
            message: `Are you sure you want to delete the product "${product.product_name}"? This action is irreversible.`,
            confirmText: "Delete Product",
            onConfirm: apiDeleteHandler,
        });
    }, [openModal, closeModal, fetchProducts, showError, showSuccess]);

    async function deleteMyStore() {
        const accessToken = localStorage.getItem('accessToken');
        const url = `${VITE_API_URL}/store/delete-my-store`; // Endpoint solicitado

        const headers = { 'Content-Type': 'application/json' };
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers
            });

            if (!response.ok) {
                let errorBody = null;
                if (response.headers.get("content-type")?.includes("application/json")) {
                    errorBody = await response.json().catch(() => ({}));
                }
                const errorMessage = errorBody?.message || response.statusText;
                throw new Error(errorMessage);
            }

            return true;

        } catch (error) {
            console.error('Error al eliminar la tienda:', error);
            throw new Error(error.message || "Connection error during store deletion.");
        }
    }

    const handleDeleteStore = useCallback(() => {
        if (!storeData || !storeData.store_id) return;

        const apiDeleteHandler = async () => {
            try {
                await deleteMyStore(); 
                
                showSuccess(`Store "${storeData.store_name}" deleted successfully.`);
                closeModal();
                fetchProducts();
            } catch (error) {
                console.error("Error al confirmar eliminación de tienda:", error.message);
                showError(`Error deleting store: ${error.message}`);
                closeModal();
                fetchProducts();
            }
        };

        openModal("confirm", {
            title: "Delete Store",
            message: `Are you sure you want to delete your store "${storeData.store_name}"? This action is irreversible and will delete all your products.`,
            confirmText: "Delete Store",
            confirmButtonClass: "delete-store-confirm-btn",
            onConfirm: apiDeleteHandler,
        });
    }, [openModal, closeModal, fetchProducts, storeData, showError, showSuccess]);


    const handleEditProductClick = useCallback((product) => {
        openModal("editproduct", {
            onProductUpdated: fetchProducts,
            productData: product
        });
    }, [openModal, fetchProducts]);

    const handleCreateStoreClick = useCallback(() => {
        openModal("createstore", { onStoreCreated: fetchProducts });
    }, [openModal, fetchProducts]);

    //Título dinámico
    const dynamicTitle = useMemo(() => {
        if (storeData && storeData.store_name) {
            return `Store: ${storeData.store_name}`;
        }
        return "Your Store";
    }, [storeData]);

    // --- RENDERIZADO CONDICIONAL ---

    const LoadingUI = useMemo(() => (
        <>
            <Title title="Loading Store..."></Title>
            <Container className="content">
                <div style={{ textAlign: 'center' }}>Loading...</div>

            </Container>
        </>
    ), []);

    const StoreNotFoundUI = useMemo(() => (
        <>
            <Title title="Your store"></Title>
            <hr />
            <Container className="content store-content">
                <h2>{authStatus === 'logged_out' ? "Please Log In" : "Store not found"}</h2>
                <p>{error || "You don't have a store yet. Please create one."}</p>

                {/* Solo mostramos el botón si el usuario está logueado pero no tiene tienda */}
                {authStatus === 'logged_in' && (
                    <NewButton type="button" btnclass={"create-store-btn"} onClick={handleCreateStoreClick}>
                        Create Store
                    </NewButton>
                )}
            </Container>
        </>
    ), [error, handleCreateStoreClick, authStatus]);

    if (loading) {
        return LoadingUI;
    }

    if (!storeExists) {
        return StoreNotFoundUI;
    }

    // --- Renderizado Principal: Tienda existe ---
    return (
        <>
            <Title title={dynamicTitle}></Title>
            <Container className="content store-content">
                <Container className="store-actions-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>

                    {/* Botón AÑADIR PRODUCTO */}
                    <Container className="add-container" style={{ display: 'flex', alignItems: 'center' }}>
                        <Container className="btn-container">
                            <p style={{ marginRight: '10px' }}>Add new product</p>
                            <button
                                className="add-product-btn"
                                type="button"
                                onClick={() => openModal("addproduct", { onProductAdded: fetchProducts })}
                            >
                                <IoIosAdd size={30} color="#1a1a1b" />
                            </button>
                        </Container>
                    </Container>


                </Container>
                {/* FIN CONTENEDOR DE ACCIONES */}

                <h2>Your products</h2>

                <Container className={products.length === 0 ? "products-container-empty" : "products-container"}>
                    {products.length === 0 ? (
                        <p>{error || "You haven't added any products yet. Click the '+' button to add your first product!"}</p>
                    ) : (
                        products.map((product) => (
                            <ProductCard
                                key={product.product_id}
                                product={product}
                                isOwner={isOwner}
                                onEditClick={isOwner ? handleEditProductClick : undefined}
                                onDeleteClick={isOwner ? handleDeleteProduct : undefined}
                            />
                        ))
                    )}
                </Container>
                {/* BOTÓN ELIMINAR TIENDA */}
                <button
                    type="button"
                    className={"delete-store-btn"}
                    onClick={handleDeleteStore}
                    style={{
                        backgroundColor: "#e96765",
                    }}
                >
                    Delete Store
                </button>
            </Container>

        </>
    );
}

export default Store;
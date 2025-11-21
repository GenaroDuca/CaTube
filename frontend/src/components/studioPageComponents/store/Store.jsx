import Title from "../../trendingPageComponents/Title";
import Container from "../../common/Container";
import NewButton from "../../homePageComponents/Button";
import { useModal } from "../../common/modal/ModalContext";
import { useState, useEffect, useCallback, useMemo } from "react";
import ProductCard from './ProductCard';
import { useToast } from '../../../hooks/useToast';
import { VITE_API_URL } from '../../../../config';
import { FaCirclePlus } from "react-icons/fa6";

// ----------------------------------------------------------------------
// CONFIGURACIÓN BASE
// ----------------------------------------------------------------------

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
                setStoreData(null); // Asegurar que sea null
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

    /** MODIFICACIÓN: Implementación del modal de confirmación y llamada a la API. */
    const handleDeleteProduct = useCallback((product) => {
        // Función que se ejecutará al confirmar la eliminación
        const apiDeleteHandler = async () => {
            try {
                // Deshabilitar el botón de confirmación puede manejarse internamente en ConfirmModal
                await deleteProduct(product.product_id);
                showSuccess(`Product "${product.product_name}" deleted successfully.`);
                closeModal();
                fetchProducts();
            } catch (error) {
                // Manejo de errores
                console.error("Error al confirmar eliminación:", error.message);
                showError(`Error deleting product: ${error.message}`); closeModal();
                fetchProducts();
            }
        };

        // Abrimos el modal con el tipo 'confirm' (usando el modal universal)
        openModal("confirm", {
            title: "Delete Product",
            message: `Are you sure you want to delete the product "${product.product_name}"? This action is irreversible.`,
            confirmText: "Delete Product",
            onConfirm: apiDeleteHandler, // Pasamos el handler que llama a la API
            // No necesitas pasar 'productName' ni 'productId' aquí, ya que apiDeleteHandler los tiene
        });
    }, [openModal, closeModal, fetchProducts]);

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
            <hr />
            <Container className="content">
                <div>Loading...</div>
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
            <hr></hr>
            <Container className="content store-content">
                <Container className="add-container">
                    <Container className="btn-container">
                        <p>Add new product</p>
                        <button
                            className="add-product-btn"
                            type="button"
                            onClick={() => openModal("addproduct", { onProductAdded: fetchProducts })}
                        >
                            <FaCirclePlus size={25} color="#1a1a1b" />
                        </button>
                    </Container>
                </Container>
                <h2>Your products</h2>
                <hr></hr>

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
            </Container>
        </>
    );
}

export default Store;

import Title from "../../trendingPageComponents/Title";
import Container from "../../common/Container";
import NewButton from "../../homePageComponents/Button";
import { useModal } from "../../common/modal/ModalContext";
import { useState, useEffect, useCallback, useMemo } from "react";
import ProductCard from './ProductCard';

// ----------------------------------------------------------------------
// FUNCIONES DE SERVICIO (FUERA DEL COMPONENTE REACT)
// *La función deleteProductSolo HA SIDO ELIMINADA de aquí y movida al Modal.
// ----------------------------------------------------------------------

const BASE_URL = 'http://localhost:3000';

/** Función autocontenida para obtener la tienda del usuario. */
async function getMyStore() {
    const accessToken = localStorage.getItem('accessToken');
    const url = `${BASE_URL}/store/my-store`;

    const headers = {};
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
        const response = await fetch(url, { method: 'GET', headers });

        if (response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType?.includes("application/json")) {
                return await response.json();
            }
            return null;
        }

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
    const url = `${BASE_URL}/product/my-products`;

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

// ----------------------------------------------------------------------

function Store() {
    // --- HOOKS ---
    const { openModal } = useModal();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [storeExists, setStoreExists] = useState(true);
    const [error, setError] = useState(null);

    // --- MANEJADORES ---

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        setStoreExists(true);

        try {
            const store = await getMyStore();

            if (!store || !store.store_id) {
                setStoreExists(false);
                setProducts([]);
                setError("You don't have a store yet. Please create one.");
                return;
            }

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
            setStoreExists(false);
            setProducts([]);
            setError(err.message || "An unexpected error occurred while loading data. Please check your network connection.");

        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * 💡 LÓGICA DE ELIMINACIÓN: Simplemente pasa las props al Modal.
     */
    const handleDeleteProduct = useCallback((product) => {
        openModal("deleteproductconfirm", {
            onProductDeleted: fetchProducts,
            productName: product.product_name,
            productId: product.product_id,
        });

    }, [openModal, fetchProducts]);

    const handleEditProductClick = useCallback((product) => {
        openModal("editproduct", {
            onProductUpdated: fetchProducts,
            productData: product
        });

    }, [openModal, fetchProducts]);

    const handleCreateStoreClick = useCallback(() => {
        openModal("createstore", { onStoreCreated: fetchProducts });
    }, [openModal, fetchProducts]);

    // Efecto para la carga inicial de datos
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // --- RENDERIZADO CONDICIONAL ---

    const LoadingUI = useMemo(() => (
        <>
            <Title title="Your store"></Title>
            <hr />
            <Container className="content">
                <div>Loading... ⏳</div>
            </Container>
        </>
    ), []);

    const StoreNotFoundUI = useMemo(() => (
        <>
            <Title title="Your store"></Title>
            <hr />
            <Container className="content store-content">
                <h2>{error && error.includes("yet") ? "Store not found" : "Error loading store"}</h2>
                <p>{error}</p>
                <NewButton type="button" onClick={handleCreateStoreClick}>
                    Create Store 🏪
                </NewButton>
            </Container>
        </>
    ), [error, handleCreateStoreClick]);

    if (loading) {
        return LoadingUI;
    }

    if (!storeExists) {
        return StoreNotFoundUI;
    }

    // --- Renderizado Principal: Tienda existe ---
    return (
        <>
            <Title title="Your store"></Title>
            <hr></hr>
            <Container className="content store-content">
                <Container className="add-container">
                    <Container className="btn-container">
                        <p>Add new product</p>
                        <NewButton
                            type="button"
                            onClick={() => openModal("addproduct", { onProductAdded: fetchProducts })}
                        >
                            <i className="fas fa-plus" ></i>
                        </NewButton>
                    </Container>
                </Container>
                <h2>Your products</h2>
                <hr></hr>

                <Container className={products.length === 0 ? "products-container-empty" : "products-container"}>                    {products.length === 0 ? (
                    <p>{error || "You haven't added any products yet. Click the '+' button to add your first product!"}</p>
                ) : (
                    products.map((product) => (
                        <ProductCard
                            key={product.product_id} product={product}
                            onEditClick={handleEditProductClick}
                            onDeleteClick={handleDeleteProduct}
                        />
                    ))
                )}
                </Container>
            </Container>
        </>
    );
}

export default Store;
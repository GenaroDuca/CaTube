import Title from "../../trendingPageComponents/Title";
import Container from "../../common/Container";
import NewButton from "../../homePageComponents/Button";
import { useModal } from "../../common/modal/ModalContext";
import { useState, useEffect, useCallback } from "react";
import apiServiceStore from "./apiServiceStore";
import { MdModeEditOutline } from "react-icons/md";
import { MdDelete } from "react-icons/md";

function Store() {
    const { openModal } = useModal();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [storeExists, setStoreExists] = useState(true);
    const [error, setError] = useState(null);

    // Función para cargar la tienda y sus productos de forma secuencial.
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        setStoreExists(true); // Asumimos existencia al inicio

        try {
            // 1. Verificar la existencia de la tienda
            const store = await apiServiceStore.getMyStore();

            // Si no hay tienda (store es null o no tiene ID), mostramos el formulario de creación.
            if (!store || !store.store_id) {
                setStoreExists(false);
                setProducts([]);
                setError("You don't have a store yet. Please create one.");
                return; // Detener la ejecución si no hay tienda
            }

            // 2. Si la tienda existe, intentamos cargar los productos
            setStoreExists(true); // Aseguramos el estado si la carga inicial de productos falló antes
            const data = await apiServiceStore.getMyProducts();

            if (data && Array.isArray(data)) {
                setProducts(data);
            } else {
                setProducts([]);
                setError("No products found in your store.");
            }

        } catch (err) {
            // Manejo de errores de red o excepciones inesperadas
            console.error("Error fetching store or products:", err);

            // Un error inesperado (ej. red) puede no significar necesariamente que la tienda no existe, 
            // pero si la API falló, no podemos confirmarlo. Mantenemos el estado de error.
            setError(err.message || "An unexpected error occurred while loading data.");
            setStoreExists(true); // Asumimos que la tienda existe pero falló la conexión
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Efecto para la carga inicial de datos
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // --- Handlers de acciones (sin cambios, ya están bien organizados) ---

    const handleDeleteProduct = async (productId) => {
        if (window.confirm(`Are you sure you want to delete product ${productId}?`)) {
            const result = await apiServiceStore.deleteProduct(productId);
            if (result !== null) {
                alert('Product deleted successfully.');
                await fetchProducts(); // Recargar la lista de productos
            } else {
                alert('Failed to delete product.');
            }
        }
    };

    const handleEditProductClick = (product) => {
        openModal("editproduct", {
            productData: product,
            onProductUpdated: fetchProducts
        });
    };

    const handleCreateStoreClick = () => {
        openModal("createstore", { onStoreCreated: fetchProducts });
    };

    // --- Renderizado Condicional: Loading ---
    if (loading) {
        return (
            <>
                <Title title="Your store"></Title>
                <hr></hr>
                <Container className="content">
                    <div>Loading...</div>
                </Container>
            </>
        );
    }

    // --- Renderizado Condicional: Tienda no existe (Creación manual) ---
    if (!storeExists) {
        return (
            <>
                <Title title="Your store"></Title>
                <hr></hr>
                <Container className="content store-content">
                    <h2>Store not found</h2>
                    <p>{error}</p>
                    <NewButton type="button" onClick={handleCreateStoreClick}>
                        Create Store 🏪
                    </NewButton>
                </Container>
            </>
        );
    }

    // --- Renderizado Principal: Tienda existe ---
    return (
        <>
            <Title title="Your store"></Title>
            <hr></hr>
            <Container className="content">
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
                {/* Mostramos errores solo si la tienda existe pero hubo un problema al cargar productos */}
                {error && products.length === 0 && <div>Error: {error}</div>}
                <Container className="products-container">
                    {products.length === 0 ? (
                        <p>You haven't added any products yet. Click the '+' button to add your first product!</p>
                    ) : (
                        products.map((product) => (
                            <Container className="product-card" key={product.product_id}>
                                <img
                                    src={product.image_url ? `http://localhost:3000${product.image_url}` : "/default-image.png"}
                                    alt={product.product_name}
                                />
                                <h2>{product.product_name}</h2>
                                <h3>${parseFloat(product.price).toFixed(2)}</h3>
                                <p>{product.description || 'No description available.'}</p>
                                <div className="product-card-actions">
                                    <button type="button" className="edit-product-btn" onClick={() => handleEditProductClick(product)}>
                                        <MdModeEditOutline size={25} color="#1a1a1b" />
                                    </button>
                                    <button type="button" className="delete-product-btn" onClick={() => handleDeleteProduct(product.product_id)}>
                                        <MdDelete size={25} color="#1a1a1b" />
                                    </button>
                                </div>
                            </Container>
                        ))
                    )}
                </Container>
            </Container>
        </>
    );
}

export default Store;
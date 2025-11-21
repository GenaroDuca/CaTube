import Subtitle from "../homePageComponents/Subtitle";
import Container from "../common/Container";
import { useState, useCallback } from "react";
import { useToast } from "../../hooks/useToast";
import { getAuthToken } from "../../utils/auth";
import ProductCard from "../studioPageComponents/store/ProductCard";
import { useNavigate } from "react-router-dom"
import "./StoreChannel.css";
import { useModal } from "../common/modal/ModalContext";

const VITE_API_URL = "http://localhost:3000";

function StoreChannel({ isOwner, channelId }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [storeError, setStoreError] = useState(null);

    const { openModal, closeModal } = useModal();
    const { showSuccess, showError } = useToast();
    const navigate = useNavigate();
    // ----------------------------------------------------------------------
    // fetchProducts
    // ----------------------------------------------------------------------
    const fetchProducts = useCallback(async () => {
        // ... (código de fetchProducts se mantiene igual)
        if (!channelId) return;

        setLoading(true);
        setStoreError(null);

        try {
            const token = getAuthToken();

            const url = isOwner
                ? `${VITE_API_URL}/product/my-products`
                : `${VITE_API_URL}/product/channel/${channelId}`;

            const response = await fetch(url, {
                headers: isOwner && token ? { Authorization: `Bearer ${token}` } : {}
            });

            if (!response.ok) {
                if (response.status === 404) {
                    setStoreError(
                        isOwner
                            ? "This channel doesn't have a store yet."
                            : "This channel hasn't published any products yet."
                    );
                    setProducts([]);
                    return;
                }
                throw new Error("Error");
            }

            const data = await response.json();
            const finalData = Array.isArray(data) ? data : [];

            setProducts(finalData);

            if (finalData.length === 0) {
                setStoreError(
                    isOwner
                        ? "This channel doesn't have a store yet."
                        : "This channel hasn't published any products yet."
                );
            }

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [channelId, isOwner, showError]);

    // ----------------------------------------------------------------------
    // Carga Inicial usando useEffect (SOLUCIÓN AL BUCLE)
    // ----------------------------------------------------------------------
    if (products.length === 0 && !loading && storeError === null) {
        fetchProducts();
    }

    // ----------------------------------------------------------------------
    // NUEVO HANDLER DE NAVEGACIÓN
    // ----------------------------------------------------------------------
    const handleGoToStudioStore = useCallback(() => {
        navigate("/studio?section=store");

    }, [showSuccess, navigate]);


    // ----------------------------------------------------------------------
    // HANDLERS (se mantienen igual)
    // ----------------------------------------------------------------------
    // ... (handleEditProductClick y handleDeleteProduct)

    const handleEditProductClick = useCallback(
        (product) => {
            console.log("Edit product:", product);
            openModal("editproduct", {
                productData: product,
                onProductUpdated: fetchProducts
            });
        },
        [openModal, fetchProducts]
    );

    const handleDeleteProduct = useCallback(
        (product) => {
            const apiDeleteHandler = async () => {
                try {
                    // await deleteProduct(product.product_id); // Asumiendo deleteProduct existe
                    showSuccess(`Product "${product.product_name}" deleted successfully.`);
                    closeModal();
                    fetchProducts();
                } catch (error) {
                    console.error("Error al eliminar:", error.message);
                    showError(`Error deleting product: ${error.message}`);
                    closeModal();
                    fetchProducts();
                }
            };

            openModal("confirm", {
                title: "Delete Product",
                message: `Are you sure you want to delete "${product.product_name}"?`,
                confirmText: "Delete Product",
                onConfirm: apiDeleteHandler
            });
        },
        [openModal, closeModal, fetchProducts, showSuccess, showError]
    );

    const handleBuyProductClick = (product) => {
        showSuccess(`Redirecting to product: ${product.product_name}`);
    };

    // ----------------------------------------------------------------------
    // RENDER
    // ----------------------------------------------------------------------

    return (
        <Container className="content-store-channel">
            <Subtitle text={isOwner ? "Your Products" : "Channel Products"} />

            {loading && <p>Loading products...</p>}

            {!loading && storeError && products.length === 0 && (
                <div className="store-empty-state">
                    <p>{storeError}</p>
                    {isOwner && ( 
                        <button
                            type="button"
                            className="btn-primary go-to-studio-store-btn"
                            onClick={handleGoToStudioStore}
                        >
                            Manage Store
                        </button>
                    )}
                </div>
            )}

            {!loading && products.length > 0 && (
                <div className="products-grid">
                    {products.map((product) => (
                        <ProductCard
                            key={product.product_id}
                            product={product}
                            isOwner={isOwner}
                            onEditClick={isOwner ? handleEditProductClick : undefined}
                            onDeleteClick={isOwner ? handleDeleteProduct : undefined}
                            onBuyClick={!isOwner ? handleBuyProductClick : undefined}
                        />
                    ))}
                </div>
            )}
            {!loading && (
                <div className="store-empty-state">
                    {isOwner && (
                        <button
                            type="button"
                            className="btn-primary go-to-studio-store-btn"
                            onClick={handleGoToStudioStore}
                        >
                            Manage Store
                        </button>
                    )}
                </div>
            )}

        </Container>
    );
}

export default StoreChannel;
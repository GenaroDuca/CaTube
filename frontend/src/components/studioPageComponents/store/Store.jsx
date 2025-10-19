import Title from "../../trendingPageComponents/Title";
import Container from "../../common/Container";
import NewButton from "../../homePageComponents/Button";
import { useModal } from "../../common/modal/ModalContext";
import { useState, useEffect } from "react";
import apiService from "./apiService";

function Store() {
    const { openModal } = useModal();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const ensureStoreExists = async () => {
        const store = await apiService.getMyStore();
        if (!store) {
            // Create default store
            const defaultStoreData = {
                store_name: "My Store",
                description: "Welcome to my store"
            };
            await apiService.createStore(defaultStoreData);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        const data = await apiService.getMyProducts();
        if (data) {
            setProducts(data);
        } else {
            setError("Failed to load products");
        }
        setLoading(false);
    };

    useEffect(() => {
        const initializeStore = async () => {
            await ensureStoreExists();
            fetchProducts();
        };
        initializeStore();
    }, []);

    return (
        <>
            <Title title="Your store"></Title>
            <hr></hr>
            <Container className="content">
                <Container className="add-container">
                    <Container className="btn-container">
                        <p>Add new product</p>
                        <NewButton type="button" onClick={() => openModal("addproduct")}><i className="fas fa-plus" ></i></NewButton>
                    </Container>
                </Container>
                <h2>Your products</h2>
                <hr></hr>
                {loading && <div>Loading...</div>}
                {error && <div>Error: {error}</div>}
                <Container className="products-container">
                    {products.map((product) => (
                        <Container className="product-card" key={product.product_id}>
                            <img src={product.image_url ? `http://localhost:3000${product.image_url}` : "/default-image.png"} alt={product.product_name} />
                            <h2>{product.product_name}</h2>
                            <h3>${product.price}</h3>
                            <p>{product.description}</p>
                            <button type="button" onClick={() => {
                                localStorage.setItem('editingProduct', JSON.stringify(product));
                                openModal("editproduct");
                            }}>
                                <i className="fa-solid fa-pen"></i>
                            </button>
                        </Container>
                    ))}
                </Container>
            </Container>
        </>
    );
}

export default Store;

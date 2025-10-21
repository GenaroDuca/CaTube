import React, { useState, useEffect } from "react";
import apiService from "../../../studioPageComponents/store/apiService";
import { useNotifications } from '../../../common/Toasts/useNotifications.jsx';
import { IoIosCloseCircle } from "react-icons/io";

const AddProductModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    product_name: "",
    description: "",
    price: "",
    stock: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [existingProducts, setExistingProducts] = useState([]);
  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false);

  useEffect(() => {
    const fetchExistingProducts = async () => {
      const products = await apiService.getMyProducts();
      if (products) {
        setExistingProducts(products);
      }
    };
    fetchExistingProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  //FeedbackToast
  const { showSuccess, showError } = useNotifications();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate price is not negative
    if (parseFloat(formData.price) < 0) {
      showError("Price cannot be negative");
      setLoading(false);
      return;
    }

    // Validate stock is not negative
    if (parseInt(formData.stock, 10) < 0) {
      showError("Stock cannot be negative");
      setLoading(false);
      return;
    }

    // Check for duplicate product name (case-insensitive)
    const isDuplicate = existingProducts.some(
      (product) => product.product_name.toLowerCase() === formData.product_name.toLowerCase()
    );

    if (isDuplicate && !showDuplicateConfirm) {
      setShowDuplicateConfirm(true);
      setLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("product_name", formData.product_name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("price", parseFloat(formData.price));
    formDataToSend.append("stock", parseInt(formData.stock, 10));
    if (formData.image) {
      formDataToSend.append("image", formData.image);
    }

    const result = await apiService.createProduct(formDataToSend);
    if (result) {
      // Refresh products in Store component
      window.location.reload(); // Simple way to refresh, or use a callback if passed
      onClose();
    } else {
      showError("Failed to add product");
    }
    setLoading(false);
  };

  return (
    <div className="add-product-modal">
      <div className="add-product-content">
        <header>
          <h1>Add a new Product</h1>
          <button type="button" onClick={onClose} className="close-add-product-modal">
            <IoIosCloseCircle size={25} color="#1a1a1b" />
          </button>
        </header>
        <main>
          {error && <div className="error-message">{error}</div>}
          {showDuplicateConfirm && (
            <div className="duplicate-confirm">
              <p>A product with this name already exists. Are you sure you want to add a duplicate product?</p>
              <div className="confirm-buttons">
                <button type="button" onClick={() => { setShowDuplicateConfirm(false); handleSubmit(new Event('submit')); }} className="create-product-btn">
                  Yes
                </button>
                <button type="button" onClick={() => setShowDuplicateConfirm(false)} className="delete-confirm-btn">
                  Cancel
                </button>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <h2>Product Name</h2>
            <input
              type="text"
              name="product_name"
              placeholder="Enter product name"
              required
              value={formData.product_name}
              onChange={handleChange}
            />

            <h2>Description</h2>
            <textarea
              name="description"
              placeholder="Enter product description"
              value={formData.description}
              onChange={handleChange}
            />

            <div className="price-stock-container">
              <div className="form-group">
                <h2>Price</h2>
                <input
                  type="number"
                  name="price"
                  placeholder="9.99"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <h2>Stock</h2>
                <input
                  type="number"
                  name="stock"
                  placeholder="100"
                  required
                  value={formData.stock}
                  onChange={handleChange}
                />
              </div>
            </div>

            <h2 className="image-title">Image</h2>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
            />

            <div className="add-product-buttons">
              <button type="submit" className="create-product-btn" disabled={loading}>
                {loading ? "Adding..." : "Add Product"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default AddProductModal;

import React, { useState, useEffect } from 'react';
import apiService from '../../../studioPageComponents/store/apiServiceStore';
import { IoIosCloseCircle } from "react-icons/io";

const EditProductModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    price: '',
    stock: '',
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [existingProducts, setExistingProducts] = useState([]);
  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const editingProduct = localStorage.getItem('editingProduct');
    if (editingProduct) {
      const parsedProduct = JSON.parse(editingProduct);
      setProduct(parsedProduct);
      setFormData({
        product_name: parsedProduct.product_name || '',
        description: parsedProduct.description || '',
        price: parsedProduct.price || '',
        stock: parsedProduct.stock || '',
        image: null,
      });
    }

    const fetchExistingProducts = async () => {
      const products = await apiService.getMyProducts();
      if (products) {
        setExistingProducts(products);
      }
    };
    fetchExistingProducts();

    // Cleanup localStorage when component unmounts
    return () => {
      localStorage.removeItem('editingProduct');
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    setError(null);
    setShowDeleteConfirm(false);

    const result = await apiService.deleteProduct(product.product_id);
    if (result !== null) { // deleteProduct returns null on success
      // Refresh products in Store component
      window.location.reload();
      onClose();
    } else {
      setError("Failed to delete product");
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate price is not negative
    if (parseFloat(formData.price) < 0) {
      setError("Price cannot be negative");
      setLoading(false);
      return;
    }

    // Validate stock is not negative
    if (parseInt(formData.stock, 10) < 0) {
      setError("Stock cannot be negative");
      setLoading(false);
      return;
    }

    // Check for duplicate product name (case-insensitive), excluding current product
    const isDuplicate = existingProducts.some(
      (p) => p.product_id !== product.product_id && p.product_name.toLowerCase() === formData.product_name.toLowerCase()
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

    const result = await apiService.updateProduct(product.product_id, formDataToSend);
    if (result) {
      // Refresh products in Store component
      window.location.reload();
      onClose();
    } else {
      setError("Failed to update product");
    }
    setLoading(false);
  };

  return (
    <div className="edit-product-modal">
      <div className="edit-product-content">
        <header>
          <h1>Edit Product</h1>
          <button type="button" onClick={onClose} className="close-edit-product-modal">
            <IoIosCloseCircle size={25} color="#1a1a1b" />
          </button>
        </header>
        <main>
          {error && <div className="error-message">{error}</div>}
          {showDuplicateConfirm && (
            <div className="duplicate-confirm">
              <p>A product with this name already exists. Are you sure you want to update to a duplicate name?</p>
              <div className="confirm-buttons">
                <button type="button" onClick={() => { setShowDuplicateConfirm(false); handleSubmit(new Event('submit')); }} className="create-product-btn">
                  Yes, update
                </button>
                <button type="button" onClick={() => setShowDuplicateConfirm(false)} className="delete-confirm-btn">
                  Cancel
                </button>
              </div>
            </div>
          )}
          {showDeleteConfirm && (
            <div className="duplicate-confirm">
              <p>Are you sure you want to delete this product? This action cannot be undone.</p>
              <div className="confirm-buttons">
                <button type="button" onClick={confirmDelete} className="delete-confirm-btn">
                  Yes, Delete Product
                </button>
                <button type="button" onClick={() => setShowDeleteConfirm(false)} className="create-product-btn">
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
              placeholder={product?.product_name || "Enter product name"}
              required
              value={formData.product_name}
              onChange={handleChange}
            />

            <h2>Description</h2>
            <textarea
              name="description"
              placeholder={product?.description || "Enter product description"}
              value={formData.description}
              onChange={handleChange}
            />

            <div className="price-stock-container">
              <div className="form-group">
                <h2>Price</h2>
                <input
                  type="number"
                  name="price"
                  placeholder={product?.price?.toString() || "9.99"}
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
                  placeholder={product?.stock?.toString() || "100"}
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
              <button type="submit" className="update-product-btn" disabled={loading}>
                {loading ? "Updating..." : "Update Product"}
              </button>
              <button type="button" className="delete-product-btn" onClick={handleDelete} disabled={loading}>
                Delete Product
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default EditProductModal;
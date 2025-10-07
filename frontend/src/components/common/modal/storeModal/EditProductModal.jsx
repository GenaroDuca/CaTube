import React, { useState, useEffect } from 'react';

const EditProductModal = ({ onClose, product, onUpdate }) => {
  const [formData, setFormData] = useState({
    id: '',
    productName: '',
    description: '',
    price: '',
    stock: '',
    image: null,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id || '',
        productName: product.productName || '',
        description: product.description || '',
        price: product.price || '',
        stock: product.stock || '',
        image: null,
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onUpdate) onUpdate(formData);
    onClose();
  };

  return (
    <div className="edit-product-modal">
      <div className="edit-product-content">
        <header>
          <h1>Edit Product</h1>
          <button type="button" onClick={onClose} className="close-edit-product-modal">
            <span className="material-symbols-outlined">do_not_disturb_on</span>
          </button>
        </header>
        <main>
          <form onSubmit={handleSubmit}>
            <input type="hidden" name="id" value={formData.id} />

            <h2>Product Name</h2>
            <input
              type="text"
              name="productName"
              placeholder="Enter product name"
              required
              value={formData.productName}
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
              <button type="submit" className="update-product-btn">Update Product</button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default EditProductModal;
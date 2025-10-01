import React, { useState } from 'react';

const AddProductModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    price: '',
    stock: '',
    image: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(formData);
    onClose();
  };

  return (
    <div className="add-product-modal">
      <div className="add-product-content">
        <header>
          <h1>Add a new Product</h1>
          <button type="button" onClick={onClose} className="close-add-product-modal">
            <span className="material-symbols-outlined">do_not_disturb_on</span>
          </button>
        </header>
        <main>
          <form onSubmit={handleSubmit}>
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
              <button type="submit" className="create-product-btn">Add Product</button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default AddProductModal;
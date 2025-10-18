import React, { useState } from 'react';
import { IoIosCloseCircle } from "react-icons/io";

const CreateStoreModal = ({ onClose, onCreate }) => {
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');

  const handleCreate = () => {
    if (onCreate) {
      onCreate({ storeName, storeDescription });
    }
    onClose();
  };

  return (
    <div className="create-store-modal">
      <div className="create-store-content">
        <header>
          <h1>Create your store</h1>
          <button type="button" onClick={onClose} className="close-create-store-modal">
            <IoIosCloseCircle size={25} color="#1a1a1b" />          </button>
        </header>
        <main>
          <h2>Store name</h2>
          <input
            type="text"
            placeholder="Enter your store name"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
          />

          <h2>Store description</h2>
          <textarea
            placeholder="Enter your store description"
            value={storeDescription}
            onChange={(e) => setStoreDescription(e.target.value)}
          />

          <button type="button" className="create-store-btn" onClick={handleCreate}>
            Create Store
          </button>
        </main>
      </div>
    </div>
  );
};

export default CreateStoreModal;
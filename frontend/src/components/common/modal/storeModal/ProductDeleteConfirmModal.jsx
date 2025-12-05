import React from 'react';
import { IoIosCloseCircle } from "react-icons/io";
import { useToast } from '../../../../hooks/useToast.jsx';
import { VITE_API_URL } from "../../../../../config"

// ----------------------------------------------------------------------
// FUNCIÓN DE SERVICIO DE ELIMINACIÓN (AHORA DENTRO O IMPORTADA POR EL MODAL)
// ----------------------------------------------------------------------
async function deleteProduct(productId) {

    if (!productId) {
        alert('Error: Product ID is missing.');
        return false;
    }

    const accessToken = localStorage.getItem('accessToken');

    try {
        const response = await fetch(`${VITE_API_URL}/product/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.ok || response.status === 204) {
            showSuccess("Product deleted successfully!")
            return true;
        } else {
            const contentType = response.headers.get("content-type");
            let errorMessage = response.statusText;

            if (contentType && contentType.includes("application/json")) {
                const errorData = await response.json().catch(() => ({}));
                errorMessage = errorData.message || response.statusText;
            }

            showError(`Failed to delete product (Status ${response.status}): ${errorMessage}`);
            return false;
        }
    } catch (error) {
        showError('Error deleting product. Please check your network connection.');
        console.error('Delete product error:', error);
        return false;
    }
}
// ----------------------------------------------------------------------

// FeedbackToast
const { showSuccess, showError } = useToast();

const ProductDeleteConfirmModal = ({ onClose, onProductDeleted, productName, productId }) => {

    const handleConfirm = async () => {
        const success = await deleteProduct(productId);

        if (success) {
            if (onProductDeleted) {
                onProductDeleted();
            }
        }

        onClose(); // Cerrar el modal, independientemente del resultado
    };

    const displayProductName = productName || 'este producto';

    return (
        <div className="delete-account-modal">
            <div className="delete-account-modal-content">
                <header>
                    <h1>Delete product</h1>
                    <button type="button" onClick={onClose} className="close-create-store-modal">
                        <IoIosCloseCircle size={25} color="#1a1a1b" />
                    </button>
                </header>
                <main>
                    <h3>Are you sure you want to delete the product: {displayProductName}?</h3>

                    <button className="delete-account-btn" onClick={handleConfirm}>
                        Permanently Delete
                    </button>
                    <h4>This action is irreversible</h4>
                </main>
            </div>
        </div>
    );
};

export default ProductDeleteConfirmModal;
import React from 'react';
import Container from '../../common/Container';
import { MdModeEditOutline } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { API_URL } from '../../../../config';

/**
 * Componente para renderizar una tarjeta de producto.
 * @param {object} props
 * @param {object} props.product - El objeto completo del producto.
 * @param {function} props.onEditClick - Handler para la edición (llama a handleEditProductClick del padre).
 * @param {function} props.onDeleteClick - Handler para la eliminación (llama a handleDeleteProduct del padre).
 */
const ProductCard = ({ product, onEditClick, onDeleteClick }) => {

    // Función para formatear el precio
    const formattedPrice = parseFloat(product.price).toFixed(2);
    
    // Construye la URL de la imagen
    const imageUrl = product.image_url
        ? `${API_URL}${product.image_url}`
        : "/default-image.png";

    return (
        <Container className="product-card">
            <img
                src={imageUrl}
                alt={product.product_name}
            />
            <h2>{product.product_name}</h2>
            <h3>${formattedPrice}</h3>
            <p>{product.description || 'No description available.'}</p>

            <div className="product-card-actions">

                <button
                    type="button"
                    className="edit-product-btn"
                    onClick={() => onEditClick(product)}
                >
                    <MdModeEditOutline size={25} color="#1a1a1b" />
                </button>

                <button
                    type="button"
                    className="delete-product-btn"
                    onClick={() => onDeleteClick(product)}>

                    <MdDelete size={25} color="#1a1a1b" />
                </button>
            </div>
        </Container >
    );
};

export default ProductCard;
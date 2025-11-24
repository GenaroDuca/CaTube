import React from 'react';
import Container from '../../common/Container';
import { MdModeEditOutline } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { VITE_API_URL } from '../../../../config';
import { FaShoppingCart } from "react-icons/fa"; 

/**
 * Componente para renderizar una tarjeta de producto.
 * @param {object} props
 * @param {object} props.product - El objeto completo del producto.
 * @param {boolean} props.isOwner - Bandera que indica si el usuario actual es el propietario del producto/canal.
 * @param {function} props.onEditClick - Handler para la edición (solo si isOwner es true).
 * @param {function} props.onDeleteClick - Handler para la eliminación (solo si isOwner es true).
 * @param {function} props.onBuyClick - Handler para la compra (solo si isOwner es false).
 */
const ProductCard = ({ 
    product, 
    isOwner,
    onEditClick, 
    onDeleteClick,
    onBuyClick 
}) => {

    // Función para formatear el precio
    const formattedPrice = parseFloat(product.price).toFixed(2);
    
    // Construye la URL de la imagen
    const imageUrl = product.image_url
        ? `${product.image_url}`
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

                {/* Lógica Condicional: Si es el propietario, muestra Editar/Eliminar. Si no, muestra Comprar. */}
                {isOwner ? (
                    // ⚙️ VISTA DE PROPIETARIO (ADMINISTRACIÓN)
                    <>
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
                            onClick={() => onDeleteClick(product)}
                        >
                            <MdDelete size={25} color="#1a1a1b" />
                        </button>
                    </>
                ) : (
                    // 💳 VISTA DE VISITANTE (COMPRA)
                    <button
                        type="button"
                        className="buy-product-btn"
                        onClick={() => onBuyClick(product)}
                    >
                        <FaShoppingCart size={20} style={{ marginRight: '8px' }} />
                        Buy
                    </button>
                )}
            </div>
        </Container >
    );
};

export default ProductCard;
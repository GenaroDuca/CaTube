import React from 'react';

// Styles
import './NotificationMenu.css';
import { MdDelete } from "react-icons/md";

// Función para formatear la fecha (se mantiene igual)
const formatNotificationTime = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now - date) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;

    // Si es más de 7 días, mostrar la fecha completa (ej. 15 Jan 2023)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Se añade la prop 'onDelete' a la desestructuración
export function NotificationCard({ notification, onMarkAsRead, onDelete }) {
    // Se añade 'onDelete' a las props
    const { id, type, userName, senderAvatar, read, timestamp, linkAction } = notification;

    const getMessage = (type, userName) => {
        const templates = {
            'friend-request': `${userName} has sent you a friend request`,
            'chat-message': `${userName} sent you a message`,
            // ... (Otros tipos de notificación)
        };
        return templates[type] || `${userName} did something`;
    };

    const handleNotificationClick = () => {
        // Marcamos como leído solo si la acción principal se ejecuta.
        onMarkAsRead(id);

        switch (linkAction) {
            case 'openFriendMenu':
                //logica para abrir menu de amigos (falta)
                break;
            case 'openChat':
                //logica para abrir abrir chat (falta)
                break;
            default:
                console.log('Default action for notification:', notification);
                break;
        }
    };

    // NUEVA FUNCIÓN para manejar la eliminación
    const handleDeleteClick = () => {
        if (onDelete) {
            console.log(`Deleting notification with ID: ${id}`);
            onDelete(id); // Llama a la función que se pasa desde el componente padre
        }
    };

    return (
        <div className={`notifications-container ${read ? 'read' : ''}`}>
            <div
                className={`notification-item`}
            >
                <img
                    src={senderAvatar}
                    alt={`${userName} avatar`}
                    className="notification-avatar"
                />
                <div className="notification-content">
                    <p className="notification-text" onClick={handleNotificationClick}>
                        {getMessage(type, userName)}
                    </p>
                    <span className="notification-time">
                        {formatNotificationTime(timestamp)}
                    </span>
                </div>

            </div>
            {/* Botón de acción principal: "Ir" */}
            <button className="btn-link" onClick={handleNotificationClick}>
                Ir
            </button>

            {/* BOTÓN DE BORRAR IMPLEMENTADO */}
            <button
                onClick={handleDeleteClick} // Llama a la nueva función
                title="Delete Notification"
                className="delete-notification-button"
            >
                <MdDelete size={24} color="#1a1a1b" />
            </button>
        </div>
    );
}
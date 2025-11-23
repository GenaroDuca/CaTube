import { useState, createContext, useContext, useMemo, useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../auth/AuthContext';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const [nextId, setNextId] = useState(1);
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuth();

    // Carga notificaciones reales del backend
    const loadBackendNotifications = async () => {
        if (!isAuthenticated) return;

        setLoading(true);
        try {
            const backendNotifications = await notificationService.getNotifications();

            const transformedNotifications = backendNotifications.map(notification => ({
                id: notification.notification_id, // El ID del backend es ahora 'id' en el frontend
                type: notification.type, // Usamos el tipo directo (ej: 'friend_request')

                // Objeto 'sender' simplificado para el frontend, usando la estructura del DTO
                sender: {
                    id: notification.sender?.user_id || null, // Usar user_id del sender
                    username: notification.sender?.username || 'El sistema',
                    // Asegúrate de que esta propiedad exista en el objeto 'sender' del DTO si no usas 'avatarUrl'
                    avatarUrl: notification.sender?.avatarUrl || '/default-avatar.png',
                },

                content: notification.content, // <--- EL MENSAJE PRE-GENERADO DEL BACKEND
                linkTarget: notification.linkTarget, // La ruta a la que debe navegar

                // Usamos 'isRead' como prop en el backend, pero lo mapeamos a 'read' para el componente
                read: notification.isRead,
                createdAt: notification.createdAt, // <--- PROPIEDAD DE TIEMPO CORRECTA
                isFromBackend: true
            }));

            setNotifications(transformedNotifications);
        } catch (error) {
            console.error('Error loading notifications from backend:', error);
        } finally {
            setLoading(false);
        }
    };

    // Carga inicial y cuando cambia el estado de autenticación
    useEffect(() => {
        if (isAuthenticated) {
            loadBackendNotifications();
        } else {
            setNotifications([]);
        }
    }, [isAuthenticated]);

    // Notificaciones locales (Asegurarse de que el formato coincida con el backend)
    const addNotification = (notificationData) => {
        const { type, sender, content, linkTarget } = notificationData;

        const newNotification = {
            id: `local-${nextId}`,
            type,
            sender,
            content,
            linkTarget,
            read: false,
            createdAt: new Date().toISOString(), // <--- USAMOS 'createdAt'
            isFromBackend: false
        };
        setNotifications(prev => [newNotification, ...prev]);
        setNextId(prev => prev + 1);
    };

    // Maneja backend y local (usa 'id')
    const deleteNotification = async (id) => {
        if (!id.startsWith('local-')) {
            try {
                await notificationService.deleteNotification(id);
            } catch (error) {
                console.error('Error deleting notification from backend:', error);
            }
        }

        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    // Maneja backend y local (usa 'id' y mapea 'read')
    const markAsRead = async (id) => {
        if (!id.startsWith('local-')) {
            try {
                await notificationService.markAsRead(id);
            } catch (error) {
                console.error('Error marking notification as read in backend:', error);
            }
        }

        setNotifications(prev =>
            prev.map(n =>
                n.id === id ? { ...n, read: true } : n
            )
        );
    };

    // Marca todas como leídas
    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    // Recarga notificaciones (Asegurarse de que el formato coincida)
    const refreshNotifications = loadBackendNotifications; // Usamos la misma función

    const value = useMemo(() => ({
        notifications,
        loading,
        addNotification,
        markAsRead,
        deleteNotification,
        markAllAsRead,
        refreshNotifications,
    }), [notifications, loading]);

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

// Hook 
export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}
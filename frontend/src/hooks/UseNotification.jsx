import { useState, createContext, useContext, useMemo, useEffect } from 'react';
import { notificationService } from '../services/notificationService';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const [nextId, setNextId] = useState(1);
    const [loading, setLoading] = useState(false);

    // Carga notificaciones reales del backend
    useEffect(() => {
        const loadBackendNotifications = async () => {
            setLoading(true);
            try {
                const backendNotifications = await notificationService.getNotifications();
                
                // Transforma notificaciones del backend al formato del frontend
                const transformedNotifications = backendNotifications.map(notification => ({
                    id: notification.notification_id, 
                    type: notification.type === 'friend_request' ? 'friend-request' : 
                          notification.type === 'new_message' ? 'chat-message' : 'default',
                    userName: notification.sender?.username || 'Usuario',
                    senderId: notification.sender?.user_id,
                    senderAvatar: notification.sender?.avatar || '/default-avatar.png',
                    linkAction: notification.type === 'friend_request' ? 'openFriendMenu' : 
                               notification.type === 'new_message' ? 'openChat' : 'default',
                    read: notification.isRead,
                    timestamp: notification.createdAt,
                    isFromBackend: true // Marca como notificación real
                }));

                setNotifications(transformedNotifications);
            } catch (error) {
                console.error('Error loading notifications from backend:', error);
            } finally {
                setLoading(false);
            }
        };

        loadBackendNotifications();
    }, []);

    // Notificaciones locales
    const addNotification = (notificationData) => {
        const { type, userName, senderId, senderAvatar, linkAction } = notificationData;

        const newNotification = {
            id: `local-${nextId}`, 
            type,
            userName,
            senderId,
            senderAvatar,
            linkAction,
            read: false,
            timestamp: new Date().toISOString(),
            isFromBackend: false 
        };
        setNotifications(prev => [newNotification, ...prev]);
        setNextId(prev => prev + 1);
    };

    // Maneja backend y local
    const deleteNotification = async (id) => {
        // Si es una notificación del backend, eliminarla también del backend
        if (!id.startsWith('local-')) {
            try {
                await notificationService.deleteNotification(id);
            } catch (error) {
                console.error('Error deleting notification from backend:', error);
            }
        }
        
        // Elimina del estado local
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    // Maneja backend y local
    const markAsRead = async (id) => {
        // Si es una notificación del backend, marcarla como leída en el backend
        if (!id.startsWith('local-')) {
            try {
                await notificationService.markAsRead(id);
            } catch (error) {
                console.error('Error marking notification as read in backend:', error);
            }
        }
        
        // Actualiza estado local
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
            // Actualiza todas las notificaciones locales como leídas
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    // Recarga notificaciones
    const refreshNotifications = async () => {
        setLoading(true);
        try {
            const backendNotifications = await notificationService.getNotifications();
            const transformedNotifications = backendNotifications.map(notification => ({
                id: notification.notification_id,
                type: notification.type === 'friend_request' ? 'friend-request' : 
                      notification.type === 'new_message' ? 'chat-message' : 'default',
                userName: notification.sender?.username || 'Usuario',
                senderId: notification.sender?.user_id,
                senderAvatar: notification.sender?.avatar || '/default-avatar.png',
                linkAction: notification.type === 'friend_request' ? 'openFriendMenu' : 
                           notification.type === 'new_message' ? 'openChat' : 'default',
                read: notification.isRead,
                timestamp: notification.createdAt,
                isFromBackend: true
            }));

            setNotifications(transformedNotifications);
        } catch (error) {
            console.error('Error refreshing notifications:', error);
        } finally {
            setLoading(false);
        }
    };

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
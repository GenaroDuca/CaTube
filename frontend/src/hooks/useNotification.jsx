import { useState, createContext, useContext, useMemo } from 'react';

// 1. Create a Context
const NotificationContext = createContext();

// 2. Create a Provider Component
export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const [nextId, setNextId] = useState(1)

    const addNotification = (notificationData) => {
        const { type, userName, senderId, senderAvatar, linkAction } = notificationData;

        const newNotification = {
            id: nextId,
            type,
            userName,
            senderId,
            senderAvatar,
            linkAction,
            read: false,
            timestamp: new Date().toISOString(),
        };
        setNotifications(prev => [newNotification, ...prev]);
        setNextId(prev => prev + 1);
    };

    const deleteNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const markAsRead = (id) => {
        setNotifications(prev =>
            prev.map(n =>
                n.id === id ? { ...n, read: true } : n
            )
        );
    };

    const value = useMemo(() => ({
        notifications,
        addNotification,
        markAsRead,
        deleteNotification,
    }), [notifications]);

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

// 3. Create a Custom Hook to consume the Context
export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}

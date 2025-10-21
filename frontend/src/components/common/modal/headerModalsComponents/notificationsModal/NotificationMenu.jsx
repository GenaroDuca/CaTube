// Hooks
import { useState } from 'react';
import { useOverlay } from '../../../../../hooks/useOverlay';

// Styles
import { FaBell } from "react-icons/fa6";
import './NotificationMenu.css';

// Images
import Gazzard from '../../../../../assets/images/profile/jere.jpg';
import Sheni from '../../../../../assets/images/profile/gena.jpg';
import Colithox from '../../../../../assets/images/profile/angel.jpg';
import Yukki from '../../../../../assets/images/profile/yukki.jpg';

export function NotificationMenu() {
    const {
        isOpen: isNotificationMenuOpen,
        toggle: toggleNotificationMenu,
        close: closeNotificationMenu,
        overlayRef: NotificationMenuRef
    } = useOverlay();

    const [notifications, setNotifications] = useState([
        { id: 1, type: 'upload', userName: 'Gazzard', read: false },
        { id: 2, type: 'comment', userName: 'Sheni', read: false },
        { id: 3, type: 'mention', userName: 'Colithox', read: false },
        { id: 4, type: 'upload', userName: 'Yukki', read: false },
        // ...más notificaciones
    ]);

    const avatarMap = {
        Gazzard,
        Sheni,
        Colithox,
        Yukki
    };

    const getMessage = (type, userName) => {
        const templates = {
            upload: `Nuevo video de ${userName}`,
            comment: `${userName} comentó en tu canal`,
            mention: `${userName} te mencionó en un comentario`
        };
        return templates[type] || `${userName} hizo algo`;
    };

    const markAsRead = (id) => {
        setNotifications(prev =>
            prev.map(n =>
                n.id === id ? { ...n, read: true } : n
            )
        );
    };

    return (
        <div className="notification-menu" ref={NotificationMenuRef}>
            <button className="notification-button" onClick={toggleNotificationMenu}>
                <FaBell size={25} />
                {notifications.filter(n => !n.read).length > 0 && (
                    <span className="notification-badge">
                        {notifications.filter(n => !n.read).length}
                    </span>
                )}
            </button>

            <aside className={`notifications-sidebar ${isNotificationMenuOpen ? '' : 'collapsed'}`}>
                <header>
                    <h2>Notifications</h2>
                </header>
                <main>
                    {notifications.length === 0 ? (
                        <p className="notification-empty">You have no notifications.</p>
                    ) : (
                        notifications.map(note => (
                            <div
                                key={note.id}
                                className={`notification-item ${note.read ? 'read' : ''}`}
                                onClick={() => markAsRead(note.id)}
                            >
                                <img
                                    src={avatarMap[note.userName]}
                                    alt={`${note.userName} avatar`}
                                />
                                <div>
                                    <p className="notification-text">
                                        {getMessage(note.type, note.userName)}
                                    </p>
                                    <span className="notification-time">2 hours ago</span>
                                </div>
                            </div>
                        ))
                    )}
                </main>
            </aside>
        </div>
    );
}
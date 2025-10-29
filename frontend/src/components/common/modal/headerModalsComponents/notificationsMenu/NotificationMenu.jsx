// Hooks
import { useOverlay } from '../../../../../hooks/useOverlay';
import { useNotification } from '../../../../../hooks/useNotification'; // ⬅️ Este hook fue modificado

// Components
import { NotificationCard } from './NotificationCard';

// Styles
import { FaBell } from "react-icons/fa6";
import './NotificationMenu.css';

export function NotificationMenu() {
    const {
        isOpen: isNotificationMenuOpen,
        toggle: toggleNotificationMenu,
        overlayRef: NotificationMenuRef
    } = useOverlay();

    const { notifications, markAsRead, deleteNotification } = useNotification(); 

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="notification-menu" ref={NotificationMenuRef}>
            <button className="notification-button" onClick={toggleNotificationMenu}>
                <FaBell size={25} />
                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount}
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
                            <NotificationCard
                                key={note.id}
                                notification={note}
                                onMarkAsRead={markAsRead}
                                onDelete={deleteNotification} // ⬅️ Se pasa la función estable importada del hook
                            />
                        ))
                    )}
                </main>
            </aside>
        </div>
    );
}
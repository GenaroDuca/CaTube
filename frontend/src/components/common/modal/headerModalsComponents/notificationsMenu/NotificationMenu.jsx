// Hooks
import { useOverlay } from '../../../../../hooks/useOverlay';
import { useNotification } from '../../../../../hooks/useNotification'

// Components
import { NotificationCard } from './NotificationCard';
import Loader from '../../../../../components/common/Loader';

// Styles
import { FaBell } from "react-icons/fa6";
import './NotificationMenu.css';
import { IoRefreshCircle } from "react-icons/io5";

export function NotificationMenu() {
    const {
        isOpen: isNotificationMenuOpen,
        toggle: toggleNotificationMenu,
        overlayRef: NotificationMenuRef
    } = useOverlay();

    const { notifications, markAsRead, deleteNotification, markAllAsRead, loading, refreshNotifications } = useNotification();

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
                    {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="mark-all-read-btn">
                            Read all
                        </button>
                    )}
                    <button onClick={refreshNotifications} className="refresh-btn">
                        <IoRefreshCircle size={25} />

                    </button>
                </header>
                <main>
                    {loading ? (
                        <Loader />
                    ) : notifications.length === 0 ? (
                        <p className="notification-empty">You have no notifications.</p>
                    ) : (
                        notifications.map(note => (
                            <NotificationCard
                                key={note.id}
                                notification={note}
                                onMarkAsRead={markAsRead}
                                onDelete={deleteNotification}
                                onCloseNotificationMenu={toggleNotificationMenu}
                            />
                        ))
                    )}
                </main>
            </aside>
        </div>
    );
}
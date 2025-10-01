import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import '../../../styles/NotificationMenu.css';

export function NotificationMenu() {
    //Start closed
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, message: '📺 Gazzard subió un nuevo video' },
        { id: 2, message: '💬 Sheni comentó en tu canal' },
        { id: 3, message: '💬 Colithox te mencionó en un comentario' }
    ]);
    const menuRef = useRef(null); //useRef detect clicks off menu

    //Toggle dropdown
    const toggleMenu = () => setIsOpen(prev => !prev);

    //Close on outside click or Escape
    useEffect(() => {
        //Close with click off menu
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        //Close with esc
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
                document.activeElement.blur(); //Remove focus from button
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        //Very important clear the eventListener
        return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    //Mark notification as read
    const markAsRead = (id) => {
        //Delete notification readed by id
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <div className="notification-menu" ref={menuRef}>
            <button className="notification-button" onClick={toggleMenu}>
                <FontAwesomeIcon icon={faBell} />
                {/* If there are notifications show the counter in a Badge */}
                {notifications.length > 0 && (<span className="notification-badge">{notifications.length}</span>)}
            </button>

        {isOpen && (
            <div className="notification-dropdown">
                {/* Show a message if there are no notifications */}
                {notifications.length === 0 ? (
                    <p className="notification-empty">You have no notifications.</p>
                ) : (
                        //If there are notifications, show a list
                        <ul>
                            {notifications.map((note) => (
                                <li
                                key={note.id}
                                className="notification-item"
                                onClick={() => markAsRead(note.id)} 
                                >
                                {note.message} {/* Content's notification */}
                                </li>
                            ))}
                        </ul>
                    )}
            </div>
        )}
        </div>
    );
}
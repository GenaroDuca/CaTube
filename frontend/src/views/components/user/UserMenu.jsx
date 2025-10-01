import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOut, faTv, faUserFriends, faMoon, faGear, faQuestionCircle, faComments} from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom'
import { useModal } from '../modals/ModalContext';
import '../../../styles/UserMenu.css';

export function UserMenu() {
    const { openModal } = useModal();
    const navigate = useNavigate();
    //Start closed
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    //Detect cliks off menu
    const menuRef = useRef(null);

    //Toggle dropdown
    const toggleMenu = () => setIsOpen(prev => !prev)

    //Check login status on mount
    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        const username = localStorage.getItem('username');
        setIsLoggedIn(!!accessToken);
        setUsername(username || '');
    }, []);

    //Close on outside click or Escape
    useEffect(() => {
        //Close with click off menu
        const handleClickOutside = (e) => {
            //If click off menu, it closes
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

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('channelId');
        localStorage.removeItem('username');
        setIsLoggedIn(false);
        setUsername('');
        navigate('/');
    };

    return (
        <div className="user-menu" ref={menuRef}>
                <button className="user-button" onClick={toggleMenu}>
                    <FontAwesomeIcon icon={faUser} className={isLoggedIn ? 'logged-in-icon' : ''} />
                </button>
    
            {isOpen && (
                <div className="user-dropdown">
                    <ul>
                        <li className='menuUserButtonLi'>
                            {isLoggedIn ? (
                                <button className='menuUserButton' onClick={handleLogout}><FontAwesomeIcon className='buttonIcon' icon={faSignOut} />Log Out</button>
                            ) : (
                                <Link to="/register"><button className='menuUserButton'><FontAwesomeIcon className='buttonIcon' icon={faSignOut} />Log In</button></Link>
                            )}
                            <Link to="/yourchannel"><button className='menuUserButton'><FontAwesomeIcon className='buttonIcon' icon={faTv} />Your channel</button></Link>
                            <button className='menuUserButton'><FontAwesomeIcon className='buttonIcon' icon={faUserFriends} />Friends</button>
                            <Link to="/studio" ><button className='menuUserButton'>
                                <svg className="StudioIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 99.3 58">
                                    <path
                                        className="st0"
                                        d="M94.4,21.2c0,0,0-.1,0-.2l2.7-19.8c.1-.9-.9-1.6-1.7-1l-15.8,11.6c-8.3-3.3-18.7-5.2-30-5.2s-21.1,1.8-29.3,5L4.8.2c-.8-.6-1.8,0-1.7,1l2.6,19.1c-3.7,3.6-5.7,7.6-5.7,12,0,14.2,22.2,25.7,49.6,25.7s49.6-11.5,49.6-25.7-1.7-7.7-4.8-11.1ZM34.7,48.4h-9.5c-6.4,0-11.6-5.2-11.6-11.6h9.5c6.4,0,11.6,5.2,11.6,11.6h0ZM85.6,36.8c0,6.4-5.2,11.6-11.6,11.6h-9.5c0-6.4,5.2-11.6,11.6-11.6h9.5Z"
                                        fill="currentColor"
                                    />
                                </svg>
                                <span>Catube Studio</span></button>
                            </Link>
                            <button className='menuUserButton'><FontAwesomeIcon className='buttonIcon' icon={faMoon} />Appearance</button>
                            <button className='menuUserButton' onClick={() => openModal('settings')}><FontAwesomeIcon className='buttonIcon' icon={faGear} />Settings</button>
                            <button className='menuUserButton' onClick={() => openModal('help')}><FontAwesomeIcon className='buttonIcon' icon={faQuestionCircle} />Help</button>
                            <button className='menuUserButton' onClick={() => openModal('feedback')}><FontAwesomeIcon className='buttonIcon' icon={faComments} />Send feedback</button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    )
}
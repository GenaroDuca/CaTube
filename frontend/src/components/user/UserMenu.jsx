import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import { useModal } from '../common/modal/ModalContext';

import { BsPersonFill } from "react-icons/bs";
import { TbLogout } from "react-icons/tb";
import { BiSolidUserRectangle } from "react-icons/bi";
import { FaUserFriends } from "react-icons/fa";
import { IoMoon } from "react-icons/io5";
import { RiSettings2Fill } from "react-icons/ri";
import { IoIosHelpCircle } from "react-icons/io";
import { BsFillSendExclamationFill } from "react-icons/bs";
import { FaThList } from "react-icons/fa";
import { HiOutlineLogin } from "react-icons/hi";

import { useSidebarToggle } from '../../hooks/useSidebarToggle.jsx';

export function UserMenu() {
    const {
        toggleFriendMenu,
        isUserMenuOpen,     // Estado del menú
        toggleUserMenu,     // Toggle del menú
        closeUserMenu       // Función para cerrar
    } = useSidebarToggle();

    const { openModal } = useModal();
    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    // Detect cliks off menu
    const menuRef = useRef(null);

    // Check login status on mount
    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        const username = localStorage.getItem('username');
        setIsLoggedIn(!!accessToken);
        setUsername(username || '');
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('channelId');
        localStorage.removeItem('username');
        setIsLoggedIn(false);
        setUsername('');
        closeUserMenu(); // Cierra el menú al desloguearse
        navigate('/');
    };

    return (
        <div className="user-menu-container" /*ref={menuRef}*/>
            {/* El botón ahora usa toggleUserMenu */}
            <button className="user-button" onClick={toggleUserMenu}>
                <BsPersonFill size={30} className={isLoggedIn ? 'logged-in-icon' : ''} />
            </button>

            {/* 4. Renderizamos el menú SIEMPRE para permitir la transición CSS.
                La clase 'collapsed' lo ocultará (trasladará) si isUserMenuOpen es false. */}
            <aside className={`ts-sidebar ${isUserMenuOpen ? '' : 'collapsed'}`}>
                <nav className="ts-sidebar-nav">
                    <ul className="ts-nav-list">
                        {/* Log Out / Log In */}
                        <li className="ts-nav-item">
                            {isLoggedIn ? (
                                <button type="button" className="ts-nav-link" onClick={handleLogout}>
                                    <TbLogout size={30}/>
                                    <span className="ts-nav-label">Log Out</span>
                                </button>
                            ) : (
                                // Usamos Link para navegar y también cerramos el menú
                                <Link to="/register" className="ts-nav-link" onClick={closeUserMenu}>
                                    <HiOutlineLogin  size={30} />
                                    <span className="ts-nav-label">Log In</span>
                                </Link>
                            )}
                        </li>

                        {/* Your channel */}
                        <li className="ts-nav-item">
                            <Link to="/yourchannel" className="ts-nav-link" onClick={closeUserMenu}>
                                <BiSolidUserRectangle  size={25} />
                                <span className="ts-nav-label">Your channel</span>
                            </Link>
                        </li>

                        {/* Friends */}
                        <li className="ts-nav-item">
                            {/* toggleFriendMenu debería estar en el contexto. Después de esto, cerrar el menú de usuario. */}
                            <button type="button" className="ts-nav-link friends-btn" onClick={() => { toggleFriendMenu()}}>
                                <FaUserFriends size={25} />
                                <span className="ts-nav-label">Friends</span>
                            </button>
                        </li>

                        {/* Catube Studio */}
                        <li className="ts-nav-item">
                            <Link to="/studio" className="ts-nav-link" onClick={closeUserMenu}>
                                <FaThList size={22} />
                                <span className="ts-nav-label">Catube Studio</span>
                            </Link>
                        </li>

                        <li className="ts-nav-item"><hr /></li>

                        {/* Appearance */}
                        <li className="ts-nav-item">
                            <button type="button" className="ts-nav-link soon" onClick={closeUserMenu}>
                                <IoMoon size={25} />
                                <span className="ts-nav-label">Appearance</span>
                            </button>
                        </li>

                        <li className="ts-nav-item"><hr /></li>

                        {/* Settings */}
                        <li className="ts-nav-item">
                            <button type="button" className="ts-nav-link right-menu-modal-btn" onClick={() => { openModal('settings'); closeUserMenu(); }}>
                                <RiSettings2Fill  size={25} />
                                <span className="ts-nav-label">Settings</span>
                            </button>
                        </li>

                        {/* Help */}
                        <li className="ts-nav-item">
                            <button type="button" className="ts-nav-link right-menu-modal-btn" onClick={() => { openModal('help'); closeUserMenu(); }}>
                            <IoIosHelpCircle size={25} />
                                <span className="ts-nav-label">Help</span>
                            </button>
                        </li>
                        {/* Send feedback */}
                        <li className="ts-nav-item">
                            <button type="button" className="ts-nav-link right-menu-modal-btn" onClick={() => { openModal('feedback'); closeUserMenu(); }}>
                            <BsFillSendExclamationFill size={25} />
                                <span className="ts-nav-label">Send feedback</span>
                            </button>
                        </li>
                    </ul>
                </nav>
            </aside>
        </div>
    )
}

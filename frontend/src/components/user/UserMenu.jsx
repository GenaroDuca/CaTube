import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import { useModal } from '../common/modal/ModalContext';

import { useTheme } from '../../hooks/useTheme'; 

import { BsPersonFill } from "react-icons/bs";
import { TbLogout } from "react-icons/tb";
import { BiSolidUserRectangle } from "react-icons/bi";
import { IoMoon } from "react-icons/io5";
import { RiSettings2Fill } from "react-icons/ri";
import { IoIosHelpCircle } from "react-icons/io";
import { BsFillSendExclamationFill } from "react-icons/bs";
import { FaThList } from "react-icons/fa";
import { HiOutlineLogin } from "react-icons/hi";

import { useSidebarToggle } from '../../hooks/useSidebarToggle.jsx';

export function UserMenu() {
    const {
        isUserMenuOpen, 
        toggleUserMenu, 
        closeUserMenu 
    } = useSidebarToggle();

    const { openModal } = useModal();
    const navigate = useNavigate();

    // ⭐️ Consumir el hook useTheme
    const { isDarkMode, toggleTheme } = useTheme(); 

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    
    const menuRef = useRef(null);

    // Check login status on mount
    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        const username = localStorage.getItem('username');
        setIsLoggedIn(!!accessToken);
        setUsername(username || '');
    }, []);

    // LÓGICA DE CLICK-OUTSIDE (Mantenida)
    useEffect(() => {
        if (!isUserMenuOpen) return;

        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                closeUserMenu();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isUserMenuOpen, closeUserMenu]);
    
    // --- FUNCIÓN DE LOGOUT (Mantenida) ---
    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('channelId');
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        setIsLoggedIn(false);
        setUsername('');
        closeUserMenu();
        navigate('/register');
        window.location.reload();
    };

    // --- FUNCIÓN PARA ALTERNAR EL TEMA Y CERRAR EL MENÚ ---
    const handleThemeToggle = () => {
        toggleTheme(); // Aquí se activa el modo claro/oscuro
        closeUserMenu(); 
    };

    return (
        <div className="user-menu-container" ref={menuRef}> 
            <button className="user-button" onClick={toggleUserMenu}>
                <BsPersonFill size={30} className={isLoggedIn ? 'logged-in-icon' : ''} />
            </button>

            <aside className={`ts-sidebar ${isUserMenuOpen ? '' : 'collapsed'}`}>
                <nav className="ts-sidebar-nav">
                    <div className='user-menu-username'>
                        <p>Hi, <span>{username}</span></p>
                    </div>
                    <ul className="ts-nav-list">
                        
                        {/* Log Out / Log In */}
                        <li className="ts-nav-item">
                            {isLoggedIn ? (
                                <button type="button" className="ts-nav-link" onClick={handleLogout}>
                                    <TbLogout size={30} />
                                    <span className="ts-nav-label">Log Out</span>
                                </button>
                            ) : (
                                <Link to="/register" className="ts-nav-link" onClick={closeUserMenu}>
                                    <HiOutlineLogin size={30} />
                                    <span className="ts-nav-label">Log In</span>
                                </Link>
                            )}
                        </li>

                        {/* Your channel */}
                        <li className="ts-nav-item">
                            <Link to="/yourchannel" className="ts-nav-link" onClick={closeUserMenu}>
                                <BiSolidUserRectangle size={25} />
                                <span className="ts-nav-label">Your channel</span>
                            </Link>
                        </li>

                        {/* Catube Studio */}
                        <li className="ts-nav-item">
                            <Link to="/studio" className="ts-nav-link" onClick={closeUserMenu}>
                                <FaThList size={22} />
                                <span className="ts-nav-label">Catube Studio</span>
                            </Link>
                        </li>

                        <li className="ts-nav-item"><hr /></li>

                        {/* ⭐️ Appearance (MODIFICADO para alternar el tema) */}
                        <li className="ts-nav-item">
                            <button 
                                type="button" 
                                className="ts-nav-link" 
                                onClick={handleThemeToggle} // Llama a la función de alternancia
                            >
                                <IoMoon size={25} />
                                <span className="ts-nav-label">
                                    Appearance: {isDarkMode ? 'Dark' : 'Light'}
                                </span>
                            </button>
                        </li>

                        <li className="ts-nav-item"><hr /></li>

                        {/* Settings, Help, Feedback */}
                        <li className="ts-nav-item">
                            <button type="button" className="ts-nav-link right-menu-modal-btn" onClick={() => { closeUserMenu(); openModal('settings'); }}>
                                <RiSettings2Fill size={25} />
                                <span className="ts-nav-label">Settings</span>
                            </button>
                        </li>

                        <li className="ts-nav-item">
                            <button type="button" className="ts-nav-link right-menu-modal-btn" onClick={() => { closeUserMenu(); openModal('help'); }}>
                                <IoIosHelpCircle size={25} />
                                <span className="ts-nav-label">Help</span>
                            </button>
                        </li>
                        
                        <li className="ts-nav-item">
                            <button type="button" className="ts-nav-link right-menu-modal-btn" onClick={() => { closeUserMenu(); openModal('feedback'); }}>
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
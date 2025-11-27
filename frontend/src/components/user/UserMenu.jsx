import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import { useModal } from '../common/modal/ModalContext';

import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../auth/AuthContext';

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

    const { user, isAuthenticated, logout } = useAuth();

    const menuRef = useRef(null);

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
        logout();
        closeUserMenu();
        navigate('/register');
    };

    // --- FUNCIÓN PARA ALTERNAR EL TEMA Y CERRAR EL MENÚ ---
    const handleThemeToggle = () => {
        toggleTheme(); // Aquí se activa el modo claro/oscuro
        closeUserMenu();
    };

    return (
        <div className="user-menu-container" ref={menuRef}>
            <button className="user-button" onClick={toggleUserMenu}>
                <BsPersonFill size={30} className={isAuthenticated ? 'logged-in-icon' : ''} />
            </button>

            <aside className={`ts-sidebar ${isUserMenuOpen ? '' : 'collapsed'}`}>
                <nav className="ts-sidebar-nav">
                    <div className='user-menu-username'>
                        <p>Hi, <span>{isAuthenticated ? user?.username : 'Guest'}</span></p>
                    </div>
                    <ul className="ts-nav-list">

                        {/* Log Out / Log In */}
                        <li className="ts-nav-item">
                            {isAuthenticated ? (
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
                            {isAuthenticated ? (
                                <Link to="/yourchannel" className="ts-nav-link" onClick={closeUserMenu}>
                                    <BiSolidUserRectangle size={25} />
                                    <span className="ts-nav-label">Your channel</span>
                                </Link>
                            ) : (
                                <button className="ts-nav-link" style={{ opacity: 0.5, cursor: 'not-allowed' }} disabled>
                                    <BiSolidUserRectangle size={25} />
                                    <span className="ts-nav-label">Your channel</span>
                                </button>
                            )}
                        </li>

                        {/* Catube Studio */}
                        <li className="ts-nav-item">
                            {isAuthenticated ? (
                                <Link to="/studio" className="ts-nav-link" onClick={closeUserMenu}>
                                    <FaThList size={22} />
                                    <span className="ts-nav-label">Catube Studio</span>
                                </Link>
                            ) : (
                                <button className="ts-nav-link" style={{ opacity: 0.5, cursor: 'not-allowed' }} disabled>
                                    <FaThList size={22} />
                                    <span className="ts-nav-label">Catube Studio</span>
                                </button>
                            )}
                        </li>

                        <li className="ts-nav-item"><hr /></li>

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
                            <button
                                type="button"
                                className="ts-nav-link right-menu-modal-btn"
                                onClick={() => {
                                    if (isAuthenticated) {
                                        closeUserMenu();
                                        openModal('settings');
                                    }
                                }}
                                style={!isAuthenticated ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                disabled={!isAuthenticated}
                            >
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
                            <button type="button" className="ts-nav-link right-menu-modal-btn" onClick={() => {
                                if (isAuthenticated) {
                                    closeUserMenu();
                                    openModal('feedback');
                                }
                            }} style={!isAuthenticated ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                disabled={!isAuthenticated}>
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
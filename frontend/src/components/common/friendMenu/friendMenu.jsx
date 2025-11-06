import { useSidebarToggle } from '../../../hooks/useSidebarToggle';
import { useState, useCallback, useEffect } from 'react';
// import SearchBar from '../../common/header/searchBar'; // 💡 Descomentar si usas un componente SearchBar

// Importaciones de iconos
import { IoChatbox, IoPersonCircle, IoArrowBackCircle } from "react-icons/io5";
import { ImSearch, ImBlocked } from "react-icons/im";
import { IoIosCloseCircle } from "react-icons/io";
import { FaUserFriends, FaChevronDown, FaCircle } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { FaUserPlus } from "react-icons/fa";

import './friendMenu.css';

// --- CONFIGURACIÓN DE LA API ---
const API_BASE_URL = 'http://localhost:3000';

// --- FUNCIÓN CENTRAL DE FETCH (BÚSQUEDA) ---
/**
 * Realiza una búsqueda de usuarios en el backend por nombre de usuario.
 * @param {string} query - El término de búsqueda introducido por el usuario.
 * @returns {Promise<Array>} Lista de usuarios que coinciden con el query.
 */
const fetchUsers = async (query) => {
    if (!query || query.trim().length < 2) return [];

    const url = `${API_BASE_URL}/users/search?q=${query}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            console.error(`Error en la respuesta HTTP: ${response.status}`);
            return [];
        }

        // Mapea la respuesta del backend (que debería devolver objetos con id, username, etc.)
        const data = await response.json();
        return data.map(user => ({
            id: user.id,
            userName: user.username,
            status: user.status || 'offline',
            avatarUrl: user.avatarUrl || 'https://i.pravatar.cc/150',
        }));

    } catch (error) {
        console.error("Fallo al buscar usuarios:", error);
        return [];
    }
};

// ----------------------------------------------------------------------------------
// --- COMPONENTES DINÁMICOS COMPLETOS ---

const FriendProfileView = ({ friend, onBack, onGoToChat }) => {

    const goToChannel = () => {
        console.log(`Abriendo canal/perfil público de ${friend.userName}`);
        alert(`Navegando al canal de ${friend.userName}... (Simulado)`);
    };

    const removeFriend = () => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar a ${friend.userName} de tus amigos?`)) {
            console.log(`Eliminando a ${friend.userName}... (Simulado)`);
            onBack();
        }
    };

    const blockFriend = () => {
        if (window.confirm(`¿Estás seguro de que quieres bloquear a ${friend.userName}?`)) {
            console.log(`Bloqueando a ${friend.userName}... (Simulado)`);
            onBack();
        }
    };

    return (
        <div className="dynamic-view profile-view">
            <button onClick={onBack} className="back-button">
                <IoArrowBackCircle size={28} color="#90b484" />
                <h4>Return to Friends</h4>
            </button>

            <h2>{friend.userName}</h2>
            <img
                src={friend.avatarUrl}
                alt={friend.userName}
                className="profile-large-avatar"
            />

            <p className="profile-bio">
                {friend.description}
            </p>

            <div className="profile-actions-container">
                <button
                    onClick={() => onGoToChat(friend)}
                    className="profile-action-btn chat-btn"
                    title=" Send message"
                >
                    <IoChatbox size={30} color='#90b484' />
                </button>
                <button
                    onClick={goToChannel}
                    className="profile-action-btn channel-btn"
                    title="Go to profile"
                >
                    <IoPersonCircle size={30} color='#90b484' />
                </button>
                <button
                    onClick={removeFriend}
                    className="profile-action-btn remove-btn"
                    title="Delete friend"
                >
                    <MdDelete size={30} color='#e96765' />
                </button>
                <button
                    onClick={blockFriend}
                    className="profile-action-btn block-btn"
                    title="Block friend"
                >
                    <ImBlocked size={30} color='#e96765' />
                </button>
            </div>
        </div>
    );
};

const FriendChatView = ({ friend, onBack, onGoToProfile }) => (
    <div className="dynamic-view chat-view">
        <button onClick={onBack} className="back-button">
            <IoArrowBackCircle size={28} color="#90b484" />
            <h4>Return to Friends</h4>
        </button>

        <h2>
            Talk with
            <button
                onClick={() => onGoToProfile(friend)}
                className="chat-profile-link"
                title="Ir al perfil"
            >
                {friend.userName}
            </button>
        </h2>

        <div className="chat-window">
            <p>Start an epic conversation with {friend.userName}.</p>
        </div>
    </div>
);

const FriendCard = ({ user, isFriend, onGoToProfile, onGoToChat, onAddFriend }) => {
    const statusColor = user.status === 'online' ? '#90b484' : '#8c8c8c';
    // 💡 APLICACIÓN DEL ESTILO GRIS/ATENUADO PARA OFFLINE
    const cardClass = user.status === 'offline' ? 'friend-card offline-friend' : 'friend-card';

    const handleAddFriend = () => {
        alert(`Solicitud de amistad enviada a ${user.userName}! (Simulado)`);
        onAddFriend(user);
    };

    return (
        <div className={cardClass}>
            <div className="friend-info">
                <div className="avatar-container">
                    <img src={user.avatarUrl} alt={user.userName} className="friend-avatar" />
                    {isFriend && (
                        <FaCircle
                            className="status-indicator"
                            size={12}
                            style={{ color: statusColor }}
                        />
                    )}
                </div>
                <span className="friend-username">{user.userName}</span>
            </div>

            <div className="friend-actions">
                {isFriend ? (
                    <>
                        <button
                            onClick={() => onGoToProfile(user)}
                            title="Go to profile"
                            className="action-button profile-button"
                        >
                            <IoPersonCircle size={30} color="#90b484" />
                        </button>
                        <button
                            onClick={() => onGoToChat(user)}
                            title="Send message"
                            className="action-button chat-button"
                        >
                            <IoChatbox size={30} color="#90b484" />
                        </button>
                    </>
                ) : (
                    <button
                        onClick={handleAddFriend}
                        title={`Add ${user.userName}`}
                        className="action-button add-friend-button"
                    >
                        <FaUserPlus size={30} color="#90b484" />
                    </button>
                )}
            </div>
        </div>
    );
};
// ----------------------------------------------------------------------------------


export function FriendMenu({ }) {
    const { isFriendMenuOpen, toggleFriendMenu } = useSidebarToggle();
    const collapsedClass = !isFriendMenuOpen ? 'collapsed' : '';

    // --- ESTADOS DE LA VISTA Y DATOS ---
    const [userStatus, setUserStatus] = useState('online');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(''); // Término del input
    const [currentView, setCurrentView] = useState('list');
    const [selectedFriend, setSelectedFriend] = useState(null);

    // Lista de amigos. DEBE ser llenada por un fetch inicial.
    // 💡 AMIGO HARDCODEADO PARA PRUEBA
    const [friends, setFriends] = useState([
        {
            userName: 'NeoCortex',
            status: 'online',
            avatarUrl: 'https://i.pravatar.cc/150?img=1',
            description: 'Hi my name is Neo Cortex'
        },
        {
            userName: 'NeoCortex',
            status: 'online',
            avatarUrl: 'https://i.pravatar.cc/150?img=1',
            description: 'Hi my name is Neo Cortex'
        },
        {
            userName: 'NeoCortex',
            status: 'online',
            avatarUrl: 'https://i.pravatar.cc/150?img=1',
            description: 'Hi my name is Neo Cortex'
        },
        {
            userName: 'Another',
            status: 'online',
            avatarUrl: 'https://i.pravatar.cc/150?img=3'
        },
        {
            id: 4,
            userName: 'Last',
            status: 'offline',
            avatarUrl: 'https://i.pravatar.cc/150?img=4'
        },
    ]);

    const [searchResults, setSearchResults] = useState([]); // Resultados de la búsqueda
    const [isLoading, setIsLoading] = useState(false); // Estado de carga

    const friendIds = new Set(friends.map(f => f.id));
    const isSearching = searchQuery.length > 0;
    // ------------------------------------

    // 💡 Implementar: useEffect para cargar la lista inicial de amigos (setFriends) al montar.
    /*
    useEffect(() => {
        // Lógica de fetch para cargar los amigos iniciales
        // e.g., fetchInitialFriends().then(data => setFriends(data));
    }, []);
    */


    // --- MANEJADOR DE BÚSQUEDA (USADO POR EL BOTÓN) ---
    const handleSearchClick = useCallback(async () => {
        const query = searchQuery.trim();

        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsLoading(true);
        // 💡 Aquí se captura el input y se envía al fetchUsers
        const results = await fetchUsers(query);

        setSearchResults(results);
        setIsLoading(false);
    }, [searchQuery]);


    // --- FUNCIONES DE NAVEGACIÓN Y ACCIÓN ---
    const goToFriendProfile = (friend) => {
        setSelectedFriend(friend);
        setCurrentView('profile');
    };

    const goToFriendChat = (friend) => {
        setSelectedFriend(friend);
        setCurrentView('chat');
    };

    const goBackToList = () => {
        setSelectedFriend(null);
        setCurrentView('list');
        setSearchResults([]); // Limpia resultados de búsqueda
        setSearchQuery(''); // Limpia el input
    };

    const handleAddFriend = (user) => {
        console.log(`Solicitud de amistad enviada a ${user.userName}`);
        setSearchQuery('');
    };

    const handleStatusChange = (newStatus) => {
        setUserStatus(newStatus);
        setIsDropdownOpen(false);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(prev => !prev);
    };

    const statusOptions = [
        { value: 'online', label: 'Online' },
        { value: 'offline', label: 'Offline' },
    ];
    // ------------------------------------------


    // --- LÓGICA DE FILTRADO Y VISUALIZACIÓN CORREGIDA ---
    const getFilteredUsers = () => {
        if (isSearching) {
            // Muestra los resultados obtenidos del API (no se ordenan por estado)
            return searchResults;
        } else {
            // Se trabaja con la lista 'friends' completa.
            const allFriends = friends;

            // ⚠️ CORRECCIÓN CLAVE: Ordena la lista completa de amigos (Online primero, Offline al final).
            const sortedFriends = [...allFriends].sort((a, b) => {
                const statusA = a.status === 'online' ? 1 : 0;
                // FIX: Corregido el typo en el segundo status: 'onlne' -> 'online'
                const statusB = b.status === 'online' ? 1 : 0; 

                // Ordenar por estado (online (1) antes que offline (0))
                if (statusB !== statusA) {
                    return statusB - statusA;
                }

                // Si el estado es el mismo, ordenar alfabéticamente por nombre
                return a.userName.localeCompare(b.userName);
            });

            return sortedFriends;
        }
    };

    const displayedUsers = getFilteredUsers();
    // ------------------------------------------


    // --- RENDERIZADO DEL CONTENIDO DINÁMICO ---
    const renderContent = () => {
        if (currentView === 'profile' && selectedFriend) {
            return (
                <FriendProfileView friend={selectedFriend} onBack={goBackToList} onGoToChat={goToFriendChat} />
            );
        }
        if (currentView === 'chat' && selectedFriend) {
            return (
                <FriendChatView friend={selectedFriend} onBack={goBackToList} onGoToProfile={goToFriendProfile} />
            );
        }

        return (
            <>
                {/* BARRA DE BÚSQUEDA Y STATUS */}
                <div className='friends-menu-search-bar'>
                    {/* 💡 Input para capturar el término de búsqueda */}
                    <input
                        type="text"
                        placeholder="Search user..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    {/* CONEXIÓN DEL BOTÓN: Llama a handleSearchClick */}
                    <button onClick={handleSearchClick} disabled={isLoading || searchQuery.trim().length < 2}>
                        {isLoading ? '...' : <ImSearch size={18} color='#1a1a1bee' />}
                    </button>

                    {/* SELECT CUSTOM DE STATUS */}
                    {!isSearching && (
                        <div
                            className={`custom-status-select ${isDropdownOpen ? 'open' : ''}`}
                            onBlur={() => setTimeout(() => setIsDropdownOpen(false), 100)}
                            tabIndex={0}
                        >
                            <button className='select-display' onClick={toggleDropdown} aria-expanded={isDropdownOpen}>
                                {statusOptions.find(opt => opt.value === userStatus)?.label}
                                <FaChevronDown size={12} className='dropdown-icon' />
                            </button>
                            <ul className='select-options'>
                                {statusOptions.map((option) => (
                                    <li key={option.value} className={option.value === userStatus ? 'selected' : ''}>
                                        <button onClick={() => handleStatusChange(option.value)} aria-pressed={option.value === userStatus}>
                                            {option.label}
                                            <FaCircle size={18} style={{ marginLeft: '8px', color: option.value === 'online' ? '#90b484' : '#8c8c8c' }} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                {/* FIN BARRA DE BÚSQUEDA Y STATUS */}

                {/* LISTA DE AMIGOS / RESULTADOS DE BÚSQUEDA */}
                <div className="friend-list-container">
                    {isLoading ? (
                        <p className="no-friends-message">Buscando usuarios...</p>
                    ) : displayedUsers.length > 0 ? (
                        displayedUsers.map(user => (
                            <FriendCard
                                key={user.id}
                                user={user}
                                isFriend={friendIds.has(user.id)}
                                onGoToProfile={goToFriendProfile}
                                onGoToChat={goToFriendChat}
                                onAddFriend={handleAddFriend}
                            />
                        ))
                    ) : (
                        <p className="no-friends-message">
                            {isSearching ? 'Users not fount.' : 'Dont have friends yet.'}
                        </p>
                    )}
                </div>
            </>
        );
    };


    return (
        <div className={`friends-menu ${collapsedClass}`} >
            <button
                onClick={toggleFriendMenu}
                aria-expanded={isFriendMenuOpen}
                aria-controls="friend-list-content"
                className='openFriendMenu'
            >
                <FaUserFriends size={30} color="#90b484" />
            </button>

            {isFriendMenuOpen && (
                <div className='friend-menu-content'>
                    <header className='friend-menu-header'>
                        <h2>
                            {currentView !== 'list' && selectedFriend ? selectedFriend.userName : 'Friends Menu'}
                        </h2>
                        <button onClick={toggleFriendMenu}>
                            <IoIosCloseCircle size={30} color="#90b484" />
                        </button>
                    </header>
                    {renderContent()}
                </div>
            )}
        </div>
    );
}
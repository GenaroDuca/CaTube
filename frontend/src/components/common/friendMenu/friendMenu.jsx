import { useSidebarToggle } from '../../../hooks/useSidebarToggle';
import { useState, useCallback, useEffect } from 'react';
import { useNotifications } from '../../common/Toasts/useNotifications.jsx';
import { useModal } from '../modal/ModalContext.jsx';

// Importaciones de iconos
import { IoChatbox, IoPersonCircle, IoArrowBackCircle } from "react-icons/io5";
import { ImSearch, ImBlocked } from "react-icons/im";
import { IoIosCloseCircle } from "react-icons/io";
import { FaUserFriends, FaChevronDown, FaCircle } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { FaUserPlus } from "react-icons/fa";

import './friendMenu.css';
import '../../../styles/modals.css';

// --- CONFIGURACIÓN Y UTILIDADES ---
const API_BASE_URL = 'http://localhost:3000';
const DEFAULT_AVATAR = 'https://i.pravatar.cc/150?u=default';

// --- FUNCIÓN DE AUTENTICACIÓN ---
const getAuthToken = () => localStorage.getItem('accessToken');

// ***************************************************************
// --- FUNCIONES DE LA API (FETCHING & EDICIÓN) ---
// ***************************************************************

/**
 * Realiza una búsqueda de usuarios en el backend por nombre de usuario.
 * @param {string} query - El término de búsqueda.
 * @returns {Promise<Array>} Lista de usuarios que coinciden.
 */
const fetchUsers = async (query) => {
    if (!query || query.trim().length < 2) return [];

    const url = `${API_BASE_URL}/users/search?q=${query}`;
    const token = getAuthToken();

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.error(`Error en la búsqueda HTTP: ${response.status}`);
            return [];
        }

        const data = await response.json();

        return data.map(user => ({
            id: String(user.user_id),
            userName: user.username,
            status: user.status || 'offline',
            avatarUrl: user.avatarUrl || DEFAULT_AVATAR,
        }));

    } catch (error) {
        console.error("Fallo al buscar usuarios:", error);
        return [];
    }
};

/**
 * Carga la lista de amigos y solicitudes pendientes del usuario logueado.
 * @returns {Promise<{friends: Array, pendingRequests: Array}>}
 */
const fetchFriendsAndRequests = async () => {
    const token = getAuthToken();

    if (!token) {
        console.warn("Autenticación faltante. No se pueden cargar los datos de amistad.");
        return { friends: [], pendingRequests: [] };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/friendships`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || response.statusText || 'Fallo desconocido al cargar amistad.';

            console.error(`Error ${response.status} en la API de amistades:`, errorMessage);
            throw new Error('Fallo al cargar datos de amistad.');
        }

        const data = await response.json();

        // Mapear Amigos
        const mappedFriends = (data.friends || []).map(f => ({
            id: String(f.id),
            userName: f.username,
            friendshipId: String(f.friendshipId),
            avatarUrl: f.avatarUrl || DEFAULT_AVATAR,
            status: f.status || 'online',
        }));

        // Mapear Solicitudes Recibidas
        const mappedRequests = (data.receivedRequests || []).map(req => ({
            id: String(req.friendship_id),
            sender: {
                id: String(req.sender.user_id),
                userName: req.sender.username,
                avatarUrl: req.sender.avatarUrl || DEFAULT_AVATAR,
            }
        }));

        return {
            friends: mappedFriends,
            pendingRequests: mappedRequests,
        };

    } catch (error) {
        console.error("Fallo al obtener datos de amistad (Error de red o procesamiento):", error);
        return { friends: [], pendingRequests: [] };
    }
};

/**
 * Envía una solicitud de amistad.
 * @param {string} receiverId - ID del usuario que recibirá la solicitud.
 */
const sendFriendRequest = async (receiverId) => {
    const token = getAuthToken();
    if (!token) throw new Error('Usuario no autenticado.');

    const url = `${API_BASE_URL}/friendships`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ receiverId })
    });

    if (response.status === 409) {
        throw new Error('Ya existe una amistad o solicitud pendiente con este usuario.');
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Fallo al enviar la solicitud de amistad.');
    }

    return response.json();
};


/**
 * Carga los datos del perfil del usuario logueado.
 * @returns {Promise<Object>} Datos del usuario.
 */
const fetchMyProfile = async () => {
    const token = getAuthToken();
    if (!token) throw new Error('Usuario no autenticado.');

    try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });


        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Fallo al cargar mi perfil. La ruta '${API_BASE_URL}/users/me' no existe en el backend (404).`);
            }
            throw new Error(`Fallo al cargar mi perfil. Código: ${response.status}`);
        }

        const data = await response.json();
        return {
            id: data.user_id,
            userName: data.username,
            email: data.email,
            avatarUrl: data.avatarUrl || DEFAULT_AVATAR,
            description: data.description || 'Hello, I am a new user on this platform!',
        };

    } catch (error) {
        console.error("Fallo al obtener mi perfil:", error.message);
        throw error;
    }
};

/**
 * Actualiza el perfil del usuario logueado (username o description).
 * @param {Object} updateData - { username?: string, description?: string }
 * @returns {Promise<Object>} El usuario actualizado.
 */
const updateMyProfile = async (updateData) => {
    const token = getAuthToken();
    if (!token) throw new Error('Usuario no autenticado.');

    const url = `${API_BASE_URL}/users/me`;

    const response = await fetch(url, {
        method: 'PATCH', // Usamos PATCH para actualizaciones parciales
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Fallo al actualizar el perfil.');
    }

    const updatedUser = await response.json();

    return {
        id: updatedUser.user_id,
        userName: updatedUser.username,
        email: updatedUser.email,
        avatarUrl: updatedUser.avatarUrl || DEFAULT_AVATAR,
        description: updatedUser.description || 'Hello, I am a new user on this platform!',
    };
};

// ***************************************************************
// --- COMPONENTES DINÁMICOS ---
// ***************************************************************

const FriendProfileView = ({ friend, onBack, onGoToChat, onDeleteFriend, onBlockFriend }) => {
    const goToChannel = () => {
        alert(`Navegando al canal de ${friend.userName}... (Simulado)`);
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
                {friend.description || `Hello, I'm ${friend.userName}.`}
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
                    onClick={() => onDeleteFriend(friend.friendshipId, friend.userName)}
                    className="profile-action-btn remove-btn"
                    title="Delete friend"
                >
                    <MdDelete size={30} color='#e96765' />
                </button>
                <button
                    onClick={() => onBlockFriend(friend.friendshipId, friend.userName)}
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


const MyProfileView = ({ myUser, onBack, onSaveProfile, isLoading }) => {
    const [editedUsername, setEditedUsername] = useState(myUser?.userName || '');
    const [editedDescription, setEditedDescription] = useState(myUser?.description || '');

    useEffect(() => {
        if (myUser) {
            setEditedUsername(myUser.userName);
            setEditedDescription(myUser.description || '');
        }
    }, [myUser]);

    const handleSave = () => {
        const updateData = {};
        let hasChanges = false;

        // Comprobar cambios en el nombre de usuario
        if (editedUsername !== myUser.userName && editedUsername.trim() !== "") {
            updateData.username = editedUsername.trim();
            hasChanges = true;
        }

        // Comprobar cambios en la descripción
        if (editedDescription !== (myUser.description || '')) {
            updateData.description = editedDescription;
            hasChanges = true;
        }

        if (hasChanges) {
            onSaveProfile(updateData);
        }
        // Si no hay cambios, no hace nada o muestra un aviso
    };

    return (
        <div className="dynamic-view profile-view my-profile-view">
            <button onClick={onBack} className="back-button" disabled={isLoading}>
                <IoArrowBackCircle size={28} color="#90b484" />
                <h4>Return to Friends</h4>
            </button>
            <div>
                <div>
                    <h2>{myUser?.userName}</h2>

                    <img
                        src={myUser?.avatarUrl || DEFAULT_AVATAR}
                        alt={myUser?.userName || 'My Avatar'}
                        className="profile-large-avatar"
                    />

                    <div className='profile-edit-group'>
                        <label htmlFor="username-input">Username</label>
                        <input
                            id="username-input"
                            type="text"
                            value={editedUsername}
                            onChange={(e) => setEditedUsername(e.target.value)}
                            placeholder="New Username"
                            disabled={isLoading}
                        />
                    </div>

                    <div className='profile-edit-group'>
                        <label htmlFor="description-textarea">Description</label>
                        <textarea
                            id="description-textarea"
                            value={editedDescription}
                            onChange={(e) => setEditedDescription(e.target.value)}
                            placeholder="Tell something about yourself..."
                            rows={4}
                            disabled={isLoading}
                        />
                    </div>
                </div>
                <div className="profile-actions-container">
                    <button
                        onClick={handleSave}
                        className="profile-save-btn"
                        title="Save Changes"
                        disabled={isLoading || editedUsername.trim() === ""}
                    >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

        </div>
    );
};


// ***************************************************************
// --- COMPONENTE DINÁMICO FriendCard ---
// ***************************************************************

const FriendCard = ({ user, isFriend, onGoToProfile, onGoToChat, onAddFriend }) => {
    const statusColor = user.status === 'online' ? '#90b484' : '#8c8c8c';
    const cardClass = user.status === 'offline' && isFriend ? 'friend-card offline-friend' : 'friend-card';

    // Handler para hacer TODA la card clickeable (redirige al perfil)
    const handleCardClick = () => {
        if (isFriend) {
            onGoToProfile(user);
        }
    };

    // Handler para detener la propagación del click en los botones de acción
    const handleActionClick = (e, actionFunction) => {
        e.stopPropagation(); // CLAVE: Detiene el evento de subir al div principal
        actionFunction(user);
    };

    // Handler para el botón de Añadir Amigo
    const handleAddFriend = (e) => {
        e.stopPropagation();
        onAddFriend(user);
    };

    // Handler para el botón de Perfil (reintroducido)
    const handleGoToProfileButton = (e) => {
        e.stopPropagation(); // CLAVE: Detiene el evento
        onGoToProfile(user);
    };

    return (
        // Toda la card es clickeable (solo si es amigo)
        <div
            className={cardClass + (isFriend ? ' clickable' : '')}
            onClick={isFriend ? handleCardClick : null} // Acción por defecto: Ir al perfil
            role={isFriend ? "button" : "listitem"}
            tabIndex={isFriend ? 0 : -1}
            aria-label={isFriend ? `View profile of ${user.userName}` : user.userName}
        >
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
                        {/* BOTÓN DE PERFIL REINTRODUCIDO */}
                        <button
                            onClick={handleGoToProfileButton}
                            title="Go to profile"
                            className="action-button profile-button"
                        >
                            <IoPersonCircle size={30} color="#90b484" />
                        </button>

                        {/* BOTÓN DE CHAT */}
                        <button
                            onClick={(e) => handleActionClick(e, onGoToChat)}
                            title="Send message"
                            className="action-button chat-button"
                        >
                            <IoChatbox size={30} color="#90b484" />
                        </button>
                    </>
                ) : (
                    // BOTÓN DE AÑADIR AMIGO (cuando no son amigos)
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

const FriendRequestCard = ({ request, onAccept, onReject }) => {
    const sender = request.sender || { userName: 'Unknown User', avatarUrl: DEFAULT_AVATAR };

    return (
        <div className="friend-card pending-request-card">
            <div className="friend-info">
                <div className="avatar-container">
                    <img src={sender.avatarUrl} alt={sender.userName} className="friend-avatar" />
                </div>
                <span className="friend-username">{sender.userName}</span>
            </div>

            <div className="friend-actions">
                <button
                    onClick={() => onAccept(request.id)}
                    title="Aceptar solicitud"
                    className="action-button accept-button"
                >
                    <FaUserPlus size={24} color="#90b484" />
                </button>
                <button
                    onClick={() => onReject(request.id)}
                    title="Rechazar solicitud"
                    className="action-button reject-button"
                >
                    <MdDelete size={24} color="#e96765" />
                </button>
            </div>
        </div>
    );
};

// ***************************************************************
// --- COMPONENTE PRINCIPAL: FriendMenu ---
// ***************************************************************

export function FriendMenu({ }) {
    // 💡 VERIFICACIÓN DE AUTENTICACIÓN AL INICIO
    const isAuthenticated = !!getAuthToken();
    if (!isAuthenticated) return null;

    const { isFriendMenuOpen, toggleFriendMenu } = useSidebarToggle();
    const collapsedClass = !isFriendMenuOpen ? 'collapsed' : '';

    // --- ESTADOS DE LA VISTA Y DATOS ---
    const [userStatus, setUserStatus] = useState('online');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentView, setCurrentView] = useState('list');
    const [selectedFriend, setSelectedFriend] = useState(null);

    // ESTADOS CENTRALES DE AMISTAD
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    // NUEVO ESTADO PARA MI PERFIL
    const [myProfile, setMyProfile] = useState(null);

    // FeedbackToast y Modal Context
    // Estas funciones (showSuccess, showError) son las sospechosas.
    const { showSuccess, showError } = useNotifications();
    const { openModal, closeModal } = useModal();

    // Derivados de estado
    const friendIds = new Set(friends.map(f => f.id));
    const isSearching = searchQuery.length > 0;

    // --- LÓGICA DE CARGA INICIAL CON useEffect ---
    const loadData = useCallback(async () => {
        setIsLoading(true);
        const token = getAuthToken();

        if (!token) {
            setIsLoading(false);
            return; // Detener si no hay token
        }

        // 1. Cargar Amigos y Solicitudes
        try {
            const friendData = await fetchFriendsAndRequests();
            setFriends(friendData.friends);
            setPendingRequests(friendData.pendingRequests);
        } catch (error) {
            console.error("Error al cargar datos de amistad:", error);
            showError("Failed to load friend data.");
        }

        // 2. Cargar Mi Perfil (PUNTO CRÍTICO)
        try {
            const profileData = await fetchMyProfile();
            setMyProfile(profileData);
        } catch (error) {
            // Error manejado dentro de fetchMyProfile para evitar bucle por 404
            console.warn("Could not load user profile details. Check API implementation.", error.message);
            // Podríamos establecer un perfil vacío o predeterminado:
            setMyProfile({ userName: "Guest", description: "Profile not loaded", avatarUrl: DEFAULT_AVATAR });
        } finally {
            setIsLoading(false);
        }
    }, []);


    // ** SOLUCIÓN DEL BUCLE INFINITO **
    // 💡 Este useEffect está bien, ya que solo depende de loadData (que ahora es estable).
    useEffect(() => {
        let isMounted = true;

        const startLoading = async () => {
            if (isMounted) {
                await loadData();
            }
        };

        startLoading();

        return () => {
            isMounted = false;
        };
    }, [loadData]); // Ejecutar solo al montar el componente de forma segura


    // --- MANEJADORES DE BÚSQUEDA Y NAVEGACIÓN ---
    const handleSearchClick = useCallback(async () => {
        const query = searchQuery.trim();

        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsLoading(true);
        const results = await fetchUsers(query);
        setSearchResults(results);
        setIsLoading(false);
    }, [searchQuery]); // Dependencia: searchQuery

    const goToFriendProfile = (friend) => {
        setSelectedFriend(friend);
        setCurrentView('profile');
    };

    const goToFriendChat = (friend) => {
        setSelectedFriend(friend);
        setCurrentView('chat');
    };

    // NUEVO: Navegar a mi perfil
    const goToMyProfile = async () => {
        // Asegurarse de que el perfil está cargado (reintento si es nulo)
        if (!myProfile || myProfile.userName === "Guest") {
            try {
                const profileData = await fetchMyProfile();
                setMyProfile(profileData);
            } catch (error) {
                // Si falla al reintentar, ya tenemos el perfil "Guest"
                showError("Could not load your profile details. (404 likely)");
            }
        }
        setCurrentView('my_profile');
    };

    const goBackToList = () => {
        setSelectedFriend(null);
        setCurrentView('list');
        setSearchResults([]);
        setSearchQuery('');
    };

    const handleStatusChange = (newStatus) => {
        setUserStatus(newStatus);
        setIsDropdownOpen(false);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(prev => !prev);
    };
    // ------------------------------------------

    // ***************************************************************
    // --- LÓGICA DE ACCIONES DE AMISTAD (DELETE/ACCEPT/REJECT/ADD) ---
    // ***************************************************************

    /**
     * Elimina una amistad y actualiza el estado local (no recarga todo).
     */
    const handleDeleteFriendship = (friendshipId, userName) => {
        const actionFunction = async () => {
            const token = getAuthToken();
            try {
                const response = await fetch(`${API_BASE_URL}/friendships/${friendshipId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    showSuccess(`Friend ${userName} successfully deleted.`);

                    // Actualizar el estado local
                    setFriends(prevFriends => prevFriends.filter(f => String(f.friendshipId) !== String(friendshipId)));
                    goBackToList();
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    showError(errorData.message || 'Fallo al eliminar amistad.');
                }
            } catch (error) {
                console.error("Error de red al eliminar amistad:", error);
                showError('Error de red al eliminar amistad.');
            } finally {
                closeModal();
            }
        };

        openModal('confirm', {
            title: "Delete Friend",
            message: `Are you sure you want to remove ${userName} from your friends?`,
            confirmText: "Delete",
            onConfirm: actionFunction,
        });
    };

    const handleAddFriend = async (user) => {
        try {
            await sendFriendRequest(user.id);
            showSuccess(`Friend request sent to ${user.userName}!`);

            setSearchQuery('');
            setSearchResults([]);

        } catch (error) {
            console.error("Fallo al enviar solicitud:", error);
            showError(error.message || 'Fallo al enviar la solicitud de amistad.');
        }
    };

    const handleAcceptRequest = async (friendshipId) => {
        const token = getAuthToken();
        const url = `${API_BASE_URL}/friendships/${friendshipId}/accept`;

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Fallo al aceptar la solicitud.');
            }

            const acceptedFriendship = await response.json();

            const acceptedRequest = pendingRequests.find(req => String(req.id) === String(friendshipId));

            if (!acceptedRequest) {
                showSuccess("Request accepted. Loading updated list...");
                await loadData();
                return;
            }

            const newFriend = {
                id: String(acceptedRequest.sender.id),
                userName: acceptedRequest.sender.userName,
                avatarUrl: acceptedRequest.sender.avatarUrl,
                status: 'online',
                friendshipId: acceptedFriendship.id || friendshipId,
            };

            // Actualización local de estados
            setPendingRequests(prev => prev.filter(req => String(req.id) !== String(friendshipId)));
            setFriends(prev => [...prev, newFriend]);

            showSuccess(`${newFriend.userName} is your new CaFriend!`);

        } catch (error) {
            console.error("Fallo al aceptar solicitud:", error);
            showError(error.message || "Failed to accept friend request.");
        }
    };

    const handleRejectRequest = async (friendshipId) => {
        const token = getAuthToken();
        const url = `${API_BASE_URL}/friendships/${friendshipId}`;

        if (!window.confirm("¿Seguro que quieres rechazar esta solicitud?")) return;

        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Fallo al rechazar la solicitud.');
            }

            // Eliminar de pendientes (Actualización local)
            setPendingRequests(prev => prev.filter(req => String(req.id) !== String(friendshipId)));

            showSuccess(`Friend request rejected successfully!`);

        } catch (error) {
            console.error("Fallo al rechazar solicitud:", error);
            showError(error.message || "Failed to reject friend request.");
        }
    };

    const handleBlockFriend = (friendshipId, userName) => {
        // Lógica de bloqueo simulada. 
        if (window.confirm(`¿Estás seguro de que quieres bloquear a ${userName}?`)) {
            showSuccess(`User ${userName} blocked successfully!`);

            // Eliminar de la lista de amigos
            setFriends(prevFriends => prevFriends.filter(f => String(f.friendshipId) !== String(friendshipId)));

            goBackToList();
        }
    };

    // ***************************************************************
    // --- LÓGICA DE EDICIÓN DE MI PERFIL ---
    // ***************************************************************

    const handleSaveMyProfile = async (updateData) => {
        setIsLoading(true);
        try {
            const updatedProfile = await updateMyProfile(updateData);
            setMyProfile(updatedProfile); // Actualizar el estado con los nuevos datos
            showSuccess('Profile successfully updated!');

        } catch (error) {
            console.error("Fallo al guardar perfil:", error);
            showError(error.message || "Failed to save profile changes.");
        } finally {
            setIsLoading(false);
        }
    };


    // --- LÓGICA DE FILTRADO Y VISUALIZACIÓN ---
    const getFilteredUsers = () => {
        if (isSearching) {
            return searchResults;
        } else {
            const allFriends = friends;

            const sortedFriends = [...allFriends].sort((a, b) => {
                const statusA = a.status === 'online' ? 1 : 0;
                const statusB = b.status === 'online' ? 1 : 0;

                if (statusB !== statusA) {
                    return statusB - statusA;
                }

                return a.userName.localeCompare(b.userName);
            });

            return sortedFriends;
        }
    };

    const displayedUsers = getFilteredUsers();

    // --- RENDERIZADO DEL CONTENIDO DINÁMICO ---
    const statusOptions = [
        { value: 'online', label: 'Online' },
        { value: 'offline', label: 'Offline' },
    ];

    const renderContent = () => {
        if (currentView === 'my_profile') {
            if (!myProfile || myProfile.userName === "Guest") {
                // Mostrar mensaje si el perfil no pudo cargarse
                return (
                    <div className="dynamic-view profile-view">
                        <button onClick={goBackToList} className="back-button">
                            <IoArrowBackCircle size={28} color="#90b484" />
                            <h4>Return to Friends</h4>
                        </button>
                        <h2 style={{ color: '#e96765' }}>⚠️ Error</h2>
                        <p style={{ textAlign: 'center' }}>
                            Could not load your profile details. Please verify that the
                            **GET /users/me** endpoint is correctly implemented and accessible on the server.
                        </p>
                    </div>
                );
            }

            return (
                <MyProfileView
                    myUser={myProfile}
                    onBack={goBackToList}
                    onSaveProfile={handleSaveMyProfile}
                    isLoading={isLoading}
                />
            );
        }

        if (currentView === 'profile' && selectedFriend) {
            return (
                <FriendProfileView
                    friend={selectedFriend}
                    onBack={goBackToList}
                    onGoToChat={goToFriendChat}
                    onDeleteFriend={handleDeleteFriendship}
                    onBlockFriend={handleBlockFriend}
                />
            );
        }
        if (currentView === 'chat' && selectedFriend) {
            return (
                <FriendChatView
                    friend={selectedFriend}
                    onBack={goBackToList}
                    onGoToProfile={goToFriendProfile}
                />
            );
        }

        return (
            <>
                {/* BARRA DE BÚSQUEDA Y STATUS */}
                <div className='friends-menu-search-bar'>
                    <input
                        type="text"
                        placeholder="Search user..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button onClick={handleSearchClick} disabled={isLoading || searchQuery.trim().length < 2}>
                        {isLoading ? '...' : <ImSearch size={18} color='#1a1a1bee' />}
                    </button>

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

                    {/* SECCIÓN DE SOLICITUDES PENDIENTES */}
                    {pendingRequests.length > 0 && !isSearching && (
                        <div className="pending-requests-section">
                            <h3 className="list-title">Friend Requests ({pendingRequests.length})</h3>
                            {pendingRequests.map(request => (
                                <FriendRequestCard
                                    key={request.id}
                                    request={request}
                                    onAccept={handleAcceptRequest}
                                    onReject={handleRejectRequest}
                                />
                            ))}
                        </div>
                    )}

                    {/* TÍTULO CONDICIONAL DE LA LISTA PRINCIPAL */}
                    {!isSearching && <h3 className="list-title">My Friends ({friends.length})</h3>}

                    {isLoading ? (
                        <p className="no-friends-message">Cargando datos...</p>
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
                            {isSearching ? 'Users not found.' : 'Don\'t have friends yet.'}
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
                    <header>
                        <h2>
                            {currentView !== 'list' && selectedFriend ? selectedFriend.userName :
                                currentView === 'my_profile' ? 'My Profile' : 'CaTube Social'}
                        </h2>
                        <div className='header-divider-social-menu'>
                            {/* BOTÓN "MI PERFIL" (SOLO EN LA VISTA DE LISTA) */}
                            {currentView !== 'my_profile' && (
                                <button
                                    onClick={goToMyProfile}
                                    className="my-profile-button"
                                    title="View and edit my profile"
                                    disabled={isLoading}
                                >
                                    {/* <IoPersonCircle size={20} /> */}
                                    Your profile
                                </button>
                            )}

                            <button onClick={toggleFriendMenu}>
                                <IoIosCloseCircle size={30} color="#90b484" />
                            </button>
                        </div>

                    </header>

                    {renderContent()}
                </div>
            )}
        </div>
    );
}
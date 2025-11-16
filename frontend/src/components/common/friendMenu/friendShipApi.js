// src/api/friendshipApi.js
import { API_BASE_URL, DEFAULT_AVATAR } from './constants';
import { getAuthToken } from '../../../utils/auth';

/**
 * Realiza una búsqueda de usuarios en el backend por nombre de usuario.
 * @param {string} query - El término de búsqueda.
 * @returns {Promise<Array>} Lista de usuarios que coinciden.
 */
export const fetchUsers = async (query) => {
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
            console.error(`Error in HTTP search: ${response.status}`);
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
        console.error("Failed to search users:", error);
        return [];
    }
};

/**
 * Carga la lista de amigos y solicitudes pendientes del usuario logueado.
 * @returns {Promise<{friends: Array, pendingRequests: Array}>}
 */
export const fetchFriendsAndRequests = async () => {
    const token = getAuthToken();

    if (!token) {
        console.warn("Missing authentication. Cannot load friendship data.");
        return { friends: [], pendingRequests: [] };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/friendships`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || response.statusText || 'Unknown failure when loading friendships!';

            console.error(`Error ${response.status} in friendships API:`, errorMessage);
            throw new Error('Failed to load friendship data!');
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
        console.error("Failed to fetch friendship data (Network or processing error):", error);
        return { friends: [], pendingRequests: [] };
    }
};

/**
 * Envía una solicitud de amistad.
 * @param {string} receiverId - ID del usuario que recibirá la solicitud.
 */
export const sendFriendRequest = async (receiverId) => {
    const token = getAuthToken();
    if (!token) throw new Error('User not authenticated!');

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
        throw new Error('A friendship or pending request already exists with this user!');
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send friend request!');
    }

    return response.json();
};

/**
 * Carga los datos del perfil del usuario logueado.
 * @returns {Promise<Object>} Datos del usuario.
 */
export const fetchMyProfile = async () => {
    const token = getAuthToken();
    if (!token) throw new Error('User not authenticated!');

    try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Failed to load my profile. The route '${API_BASE_URL}/users/me' does not exist on the backend (404).`);
            }
            throw new Error(`Failed to load my profile. Code: ${response.status}`);
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
        console.error("Failed to fetch my profile:", error.message);
        throw error;
    }
};

/**
 * Actualiza el perfil del usuario logueado (username o description).
 * @param {Object} updateData - { username?: string, description?: string }
 * @returns {Promise<Object>} El usuario actualizado.
 */
export const updateMyProfile = async (updateData) => {
    const token = getAuthToken();
    if (!token) throw new Error('User not authenticated!');

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
        console.log("Error updating profile:");
        throw new Error(errorData.message || 'Failed to update profile!');
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

/**
 * Elimina una amistad.
 * @param {string} friendshipId - ID de la amistad a eliminar.
 */
export const deleteFriendship = async (friendshipId) => {
    const token = getAuthToken();
    if (!token) throw new Error('User not authenticated!');

    const response = await fetch(`${API_BASE_URL}/friendships/${friendshipId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete friendship!');
    }
};

/**
 * Acepta una solicitud de amistad.
 * @param {string} friendshipId - ID de la solicitud de amistad.
 */
export const acceptFriendRequest = async (friendshipId) => {
    const token = getAuthToken();
    if (!token) throw new Error('User not authenticated!');

    const url = `${API_BASE_URL}/friendships/${friendshipId}/accept`;

    const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to accept the request!');
    }

    return response.json();
};

/**
 * Rechaza una solicitud de amistad (simplemente elimina la amistad).
 * @param {string} friendshipId - ID de la solicitud de amistad.
 */
export const rejectFriendRequest = async (friendshipId) => {
    // Reutilizamos deleteFriendship ya que rechazar es esencialmente eliminar la entrada de amistad/solicitud.
    await deleteFriendship(friendshipId);
};



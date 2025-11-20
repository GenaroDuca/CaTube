import { io } from 'socket.io-client';
// Asume que la ruta es correcta
import { VITE_API_URL } from "../../../../config.js"

// Asume que la ruta es correcta
import { getAuthToken } from '../../../utils/auth';

let socket = null;

/**
 * 🛠️ Función para obtener la conexión Socket.IO.
 * @returns {Socket} La instancia del socket.
 */
export const getSocket = () => {
    if (!socket) {
        const token = getAuthToken();

        if (!token) {
            console.error("No se puede establecer conexión WebSocket: Token no encontrado.");
            return null;
        }

        socket = io(API_BASE_URL, {
            auth: {
                token: token
            }
        });

        socket.on('connect', () => {
            console.log('Socket conectado con éxito.');
        });

        socket.on('disconnect', (reason) => {
            console.log('Socket desconectado:', reason);
        });

        socket.on('exception', (error) => {
            console.error('Error de socket del servidor:', error);
        });
    }
    return socket;
};

/**
 * 📡 Envía un mensaje a través del WebSocket.
 * @param {string} toUserId - ID del usuario receptor.
 * @param {string} content - Contenido del mensaje.
 */
export const sendMessage = async (toUserId, content) => {
    let s = getSocket();
    if (!s) throw new Error("No se pudo inicializar el socket");
    if (!s.connected) {
        await new Promise((resolve, reject) => {
            s.once("connect", resolve);
            setTimeout(() => reject(new Error("Socket no conectado después de 5s")), 5000);
        });
    }
    s.emit('chat message', { toUserId, content });
};

/**
 * 📜 Carga el historial de mensajes para una sala (HTTP/REST) con paginación.
 * Usará el endpoint GET /messages/:roomId?limit=X&offset=Y
 * @param {string} roomId - El ID compuesto de la sala.
 * @param {number} limit - Número máximo de mensajes a devolver.
 * @param {number} offset - Cantidad de mensajes a omitir.
 * @returns {Promise<Array>} Lista de mensajes.
 */
export const fetchMessageHistory = async (roomId, limit = 20, offset = 0) => {
    const token = getAuthToken();
    if (!token || !roomId) return [];
    const url = `${API_BASE_URL}/messages/${roomId}?limit=${limit}&offset=${offset}`;
    try {
        const response = await fetch(VITE_API_URL, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            console.error(`Error ${response.status} al cargar historial.`);
            return [];
        }
        const data = await response.json();
        return data.map(msg => ({
            id: msg.message_id,
            content: msg.content,
            timestamp: msg.timestamp,
            senderId: msg.senderId,
            senderName: msg.sender.username,
            senderAvatar: msg.sender.avatar || '/default-avatar.png',
            isEdited: msg.is_edited || false,
        }));
    } catch (error) {
        console.error("Fallo al obtener el historial de mensajes:", error);
        return [];
    }
};

/**
 * Obtiene o crea la sala privada (HTTP/REST).
 * Usará el endpoint POST /rooms/private
 * @param {string} targetUserId - ID del amigo.
 * @returns {Promise<Object>} Objeto sala con el room_id compuesto.
 */
export const getOrCreatePrivateRoom = async (targetUserId) => {
    const token = getAuthToken();
    if (!token || !targetUserId) throw new Error("Datos insuficientes para obtener la sala.");

    const url = `${API_BASE_URL}/rooms/private`;

    const response = await fetch(VITE_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetUserId })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Fallo al obtener la sala de chat.');
    }

    return response.json();
};

/**
 * Envía una solicitud de edición de mensaje (Socket).
 * @param {string} messageId - ID del mensaje a editar.
 * @param {string} newContent - Nuevo contenido del mensaje.
 */
export const editMessage = (messageId, newContent) => {
    const s = getSocket();
    if (s && s.connected) {
        s.emit('edit message', { messageId, newContent });
    } else {
        console.error("No se pudo editar el mensaje: Socket no conectado.");
    }
};

/**
 * Envía una solicitud para eliminar un mensaje (Socket).
 * @param {string} messageId - ID del mensaje a eliminar.
 */
export const deleteMessage = (messageId) => {
    const s = getSocket();
    if (s && s.connected) {
        s.emit('delete message', { messageId });
    } else {
        console.error("No se pudo eliminar el mensaje: Socket no conectado.");
    }
};


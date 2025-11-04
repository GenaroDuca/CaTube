import {jwtDecode} from 'jwt-decode';

export const getAuthToken = () => localStorage.getItem('accessToken');

export const getMyUserId = () => {
    const token = getAuthToken();
    if (!token) {
        return null;
    }

    try {
        const decoded = jwtDecode(token);

        return decoded.id || decoded.sub || null;

    } catch (error) {
        console.error("Error al decodificar el token:", error);
        return null;
    }
};
import { VITE_API_URL } from "../../config";

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  // console.log("Token en localStorage:", token);
  
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log("Headers con autorización:", headers);
  } else {
    // console.warn('No accessToken found in localStorage - proceeding without auth');
  }
  
  return headers;
};

// GET - Obtener todas las playlists del usuario
export const getPlaylists = async () => {
  try {
    // console.log('getPlaylists: Iniciando request...');
    const url = `${VITE_API_URL}/playlists`;
    // console.log('URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    // console.log('📡 getPlaylists Response status:', response.status);
    // console.log('📡 getPlaylists Response ok:', response.ok);

    if (response.status === 401) {
      // console.warn('401 Unauthorized');
      return [];
    }

    if (!response.ok) {
      // console.error('HTTP Error:', response.status, response.statusText);
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    // console.log('getPlaylists: Datos parseados:', data);
    return data;

  } catch (error) {
    // console.error('Error en getPlaylists:', error);
    
    if (error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
      // console.warn('Network error - returning empty array');
      return [];
    }
    
    throw error;
  }
};

// GET - Obtener una playlist específica
export const getPlaylistById = async (id) => {
  try {
    const response = await fetch(`${VITE_API_URL}/playlists/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    // console.error('Error getting playlist:', error);
    throw error;
  }
};

// POST - Crear nueva playlist
export const createPlaylist = async (playlistData) => {
  try {
    const response = await fetch(`${VITE_API_URL}/playlists`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(playlistData),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    // console.error('Error creating playlist:', error);
    throw error;
  }
};

// PATCH - Actualizar playlist
export const updatePlaylist = async (id, playlistData) => {
  try {
    const response = await fetch(`${VITE_API_URL}/playlists/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(playlistData),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    // console.error('Error updating playlist:', error);
    throw error;
  }
};

// DELETE - Eliminar playlist
export const deletePlaylist = async (id) => {
  try {
    const response = await fetch(`${VITE_API_URL}/playlists/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    // console.log('DELETE Response status:', response.status); // Debug

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    // Manejar respuesta vacía (204 No Content)
    if (response.status === 204) {
      // console.log('DELETE: 204 No Content - respuesta exitosa sin cuerpo');
      return { success: true, message: 'Playlist eliminada exitosamente' };
    }

    // Verificar si hay contenido antes de parsear JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data;
    } else {
      // Si no hay JSON pero la respuesta es exitosa
      // console.log('DELETE: Respuesta exitosa sin JSON');
      return { success: true, message: 'Playlist eliminada exitosamente' };
    }

  } catch (error) {
    // console.error('Error deleting playlist:', error);
    throw error;
  }
};
const API_BASE = "http://localhost:5173/api"; // Cambiar según la configuración del backend

// Helper para headers con autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    console.warn('No JWT token found in localStorage');
    throw new Error('No authentication token found');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// GET - Obtener todas las playlists del usuario
export const getPlaylists = async () => {
  try {
    const response = await fetch(`${API_BASE}/playlists`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (response.status === 401) {
      throw new Error('No autorizado - Inicia sesión nuevamente');
    }

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting playlists:', error);
    throw error;
  }
};

// GET - Obtener una playlist específica
export const getPlaylistById = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/playlists/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting playlist:', error);
    throw error;
  }
};

// POST - Crear nueva playlist
export const createPlaylist = async (playlistData) => {
  try {
    const response = await fetch(`${API_BASE}/playlists`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(playlistData),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating playlist:', error);
    throw error;
  }
};

// PATCH - Actualizar playlist
export const updatePlaylist = async (id, playlistData) => {
  try {
    const response = await fetch(`${API_BASE}/playlists/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(playlistData),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating playlist:', error);
    throw error;
  }
};

// DELETE - Eliminar playlist
export const deletePlaylist = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/playlists/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting playlist:', error);
    throw error;
  }
};
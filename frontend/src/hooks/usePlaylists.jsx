import { useState, useEffect } from "react";
import { 
    getPlaylists,
    getPlaylistById,
    createPlaylist,
    updatePlaylist,
    deletePlaylist 
} from "../services/playlistService";

export const usePlaylist = () => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

     // Cargar todas las playlists
  const loadPlaylists = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPlaylists();
      setPlaylists(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading playlists:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar playlist por ID
  const loadPlaylist = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPlaylistById(id);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva playlist
  const addPlaylist = async (playlistData) => {
    setLoading(true);
    setError(null);
    try {
      const newPlaylist = await createPlaylist(playlistData);
      setPlaylists(prev => [...prev, newPlaylist]);
      return newPlaylist;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar playlist
  const editPlaylist = async (id, playlistData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedPlaylist = await updatePlaylist(id, playlistData);
      setPlaylists(prev => 
        prev.map(playlist => 
          playlist.playlist_id === id ? updatedPlaylist : playlist
        )
      );
      return updatedPlaylist;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar playlist
  const removePlaylist = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await deletePlaylist(id);
      setPlaylists(prev => prev.filter(playlist => playlist.playlist_id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cargar playlists al montar el componente
  useEffect(() => {
    loadPlaylists();
  }, []);

  return {
    playlists,
    loading,
    error,
    loadPlaylists,
    loadPlaylist,
    addPlaylist,
    editPlaylist,
    removePlaylist,
  };
};
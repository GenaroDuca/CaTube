import { useState, useEffect } from "react";
import { 
    getPlaylists,
    getPlaylistById,
    createPlaylist,
    updatePlaylist,
    deletePlaylist 
} from "../services/playlistService";

export const usePlaylists = () => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Cargar todas las playlists
    const loadPlaylists = async () => {
        console.log("usePlaylists: Iniciando carga de playlists...");
        setLoading(true);
        setError(null);
        try {
            const data = await getPlaylists();
            console.log("usePlaylists: Datos recibidos del servicio:", data);
            
            // Asegura que siempre sea un array
            const playlistsArray = Array.isArray(data) ? data : [];
            console.log("usePlaylists: Playlists array procesado:", playlistsArray);
            
            setPlaylists(playlistsArray);
            
        } catch (err) {
            console.log("usePlaylists: Error completo:", err);
            setError(err.message);
            // En caso de error, establece array vacío
            setPlaylists([]);
        } finally {
            setLoading(false);
            console.log("usePlaylists: Loading finalizado");
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
    const removePlaylist = async (playlistId) => {
        setLoading(true);
        setError(null);
        try {
            console.log("🗑️ Eliminando playlist:", playlistId);
            await deletePlaylist(playlistId);
            setPlaylists(prev => prev.filter(p => p.playlist_id !== playlistId));
        } catch (err) {
            console.error("Error eliminando playlist:", err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Cargar playlists al montar el componente
    useEffect(() => {
        console.log("usePlaylists: useEffect ejecutado - Montando componente");
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
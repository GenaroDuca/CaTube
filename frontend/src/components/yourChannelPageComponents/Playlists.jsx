import Container from "../common/Container";
import VideosLatest from "./VideosLatest";
import { usePlaylists } from "../../hooks/usePlaylists";
import { useRef, useState } from "react";
import CreatePlaylistButton from "../Playlist/CreatePlaylistButton";
import { useNavigate } from "react-router-dom";

function Playlists() {
    const playlistsRef = useRef(null);
    const { playlists, loading, error, removePlaylist, editPlaylist } = usePlaylists();
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editIsPublic, setEditIsPublic] = useState(false);
    const navigate = useNavigate();

    const startEditing = (playlist) => {
        setEditingId(playlist.playlist_id);
        setEditTitle(playlist.playlist_title);
        setEditDescription(playlist.playlist_description || '');
        setEditIsPublic(playlist.isPublic);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditTitle('');
        setEditDescription('');
        setEditIsPublic(false);
    };

    const saveEdit = async (playlistId) => {
        try {
            await editPlaylist(playlistId, {
                playlist_title: editTitle,
                playlist_description: editDescription,
                isPublic: editIsPublic
            });
            cancelEditing();
        } catch (error) {
            console.error('Error editing playlist:', error);
        }
    };

    const handleDelete = async (playlistId, playlistTitle) => {
        if (window.confirm(`¿Estás seguro de eliminar la playlist "${playlistTitle}"?`)) {
            try {
                await removePlaylist(playlistId);
            } catch (error) {
                console.error('Error deleting playlist:', error);
            }
        }
    };

    if (loading) {
        return (
            <Container className="video-main-content">
                <div>Cargando playlists...</div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="video-main-content">
                <div>Error: {error}</div>
            </Container>
        );
    }

    const handlePlaylistClick = (playlist) => {
        // Navegar a la página de detalles de la playlist
        navigate(`/playlist/${playlist.id}`);
    };

const transformedPlaylists = playlists.map(playlist => {
    if (!playlist) return null;
    
    // Thumbnail más específico según el tipo de playlist
    const getDefaultThumbnail = () => {
        if (playlist.playlistVideos?.length > 0) {
            return playlist.playlistVideos[0].thumbnail; // Primer video
        }
        return playlist.isPublic 
            ? '../../assets/images/thumbnails/amazingdogs.jpg'
            : '../../assets/images/thumbnails/amazingdogs.jpg';
    };
    
    return {
        id: playlist.playlist_id,
        thumbnail: playlist.thumbnail || getDefaultThumbnail(),
        name: playlist.playlist_title,
        videoCount: playlist.playlistVideos?.length || 0,
        visibility: playlist.isPublic ? 'Pública' : 'Privada',
        url: `/playlist/${playlist.playlist_id}`,
        description: playlist.playlist_description,
        createdAt: playlist.createdAt,
        originalData: playlist,
        clickable: true,
        onClick: () => handlePlaylistClick(playlist)

    };
}).filter(Boolean); // ← Filtrar cualquier null

return (
        <Container className="video-main-content">
            {/* ✅ NUEVO: Botón crear playlist */}
            <div className="playlist-actions-header">
                <CreatePlaylistButton />
            </div>

            <VideosLatest 
                render={transformedPlaylists} 
                id="playlistsSection" 
                className="content-table" 
                container="latest-container" 
                ref={playlistsRef} 
                type="videos"
                onEdit={startEditing}
                onDelete={handleDelete}
                editingId={editingId}
                editTitle={editTitle}
                editDescription={editDescription}
                editIsPublic={editIsPublic}
                onEditTitleChange={setEditTitle}
                onEditDescriptionChange={setEditDescription}
                onEditIsPublicChange={setEditIsPublic}
                onSaveEdit={saveEdit}
                onCancelEdit={cancelEditing}
            />
        </Container>
    );
}

export default Playlists;
import Container from "../common/Container";
import { usePlaylists } from "../../hooks/usePlaylists";
import { useRef, useState } from "react";
import CreatePlaylistButton from "../Playlist/CreatePlaylistButton";
import { useNavigate } from "react-router-dom";
import PlaylistItemWithActions from "../Playlist/PlaylistItemWithActions";
import "../Playlist/PlaylistActions.css";
import "../../styles/Global_components.css";
import "../../pages/YourChannelPage/YourChannelPage.css";
import playlistThumbnails from "../../assets/images/thumbnails/rabbits.jpg";
import ConfirmationModal from "../common/modal/PlaylistConfirmationModal/ConfirmationModal";

function Playlists() {
  const playlistsRef = useRef(null);
  const { playlists, loading, error, removePlaylist, editPlaylist } =
    usePlaylists();
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(false);
  const navigate = useNavigate();

  console.log("Playlists component - Estado actual:", {
    playlistsCount: playlists?.length,
    loading,
    error,
    playlists: playlists,
  });

  const startEditing = (playlist) => {
    console.log("Iniciando edición de:", playlist);
    setEditingId(playlist.id);
    setEditTitle(playlist.name);
    setEditDescription(playlist.description || "");
    setEditIsPublic(playlist.visibility === "Pública");
  };

  const cancelEditing = () => {
    console.log("Cancelando edición");
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
    setEditIsPublic(false);
  };

  const saveEdit = async (playlistId) => {
    try {
      console.log("Guardando edición para:", playlistId);
      await editPlaylist(playlistId, {
        playlist_title: editTitle,
        playlist_description: editDescription,
        isPublic: editIsPublic,
      });
      cancelEditing();
    } catch (error) {
      console.error("Error editing playlist:", error);
    }
  };

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    playlistId: null,
    playlistTitle: "",
  });

  const handleDeleteClick = (playlistId, playlistTitle) => {
    setDeleteModal({
      isOpen: true,
      playlistId,
      playlistTitle,
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteModal.playlistId) {
      try {
        await removePlaylist(deleteModal.playlistId);
        setDeleteModal({ isOpen: false, playlistId: null, playlistTitle: "" });
      } catch (error) {
        console.error("Error deleting playlist:", error);
        setDeleteModal({ isOpen: false, playlistId: null, playlistTitle: "" });
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, playlistId: null, playlistTitle: "" });
  };

  const handlePlaylistClick = (playlist) => {
    console.log("Navegando a playlist:", playlist.id);
    navigate(`/playlist/${playlist.id}`);
    //  window.location.href = `/playlist/${playlist.id}`;
  };

  if (loading) {
    console.log("Playlists: Mostrando estado loading");
    return (
      <Container className="video-main-content">
        <div className="loading">Cargando playlists...</div>
      </Container>
    );
  }

  if (error) {
    console.log("Playlists: Mostrando estado error:", error);
    return (
      <Container className="video-main-content">
        <div className="error">Error: {error}</div>
      </Container>
    );
  }

  console.log("Transformando playlists...", playlists);
  const transformedPlaylists = playlists
    .map((playlist) => {
      if (!playlist) {
        console.log("Playlist nula encontrada");
        return null;
      }

      console.log("Procesando playlist:", playlist);

      const getDefaultThumbnail = () => {
        return playlistThumbnails;
      };

      const transformed = {
        id: playlist.playlist_id,
        thumbnail: getDefaultThumbnail(),
        name: playlist.playlist_title,
        videoCount: playlist.playlistVideos?.length || 0,
        visibility: playlist.isPublic ? "Pública" : "Privada",
        description: playlist.playlist_description,
        originalData: playlist,
      };

      console.log("Playlist transformada:", transformed);
      return transformed;
    })
    .filter(Boolean);

  console.log("Playlists finales a renderizar:", transformedPlaylists);

  return (
    <Container className="video-main-content">
      <div className="playlist-actions-header">
        <CreatePlaylistButton />
      </div>

      <div className="playlists-grid">
        {transformedPlaylists.length > 0 ? (
          transformedPlaylists.map((playlist) => (
            <PlaylistItemWithActions
              key={playlist.id}
              playlist={playlist}
              onEdit={startEditing}
              onDelete={handleDeleteClick}
              onPlaylistClick={handlePlaylistClick}
              isEditing={editingId === playlist.id}
              editTitle={editTitle}
              editDescription={editDescription}
              editIsPublic={editIsPublic}
              onEditTitleChange={setEditTitle}
              onEditDescriptionChange={setEditDescription}
              onEditIsPublicChange={setEditIsPublic}
              onSaveEdit={saveEdit}
              onCancelEdit={cancelEditing}
              showActions={true}
            />
          ))
        ) : (
          <div className="no-playlists">
            <p>No tienes playlists creadas aún.</p>
            <p>¡Crea tu primera playlist usando el botón arriba!</p>
          </div>
        )}
      </div>
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Playlist"
        message={`¿Estás seguro de eliminar la playlist "${deleteModal.playlistTitle}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </Container>
  );
}

export default Playlists;

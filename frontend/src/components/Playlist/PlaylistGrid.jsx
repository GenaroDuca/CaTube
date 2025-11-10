// components/PlaylistGrid.jsx
import PlaylistItemWithActions from "../Playlist/PlaylistItemWithActions";

const PlaylistGrid = ({ 
  playlists, 
  onEdit, 
  onDelete, 
  onPlaylistClick,
  editingId,
  editTitle,
  editDescription,
  editIsPublic,
  onEditTitleChange,
  onEditDescriptionChange,
  onEditIsPublicChange,
  onSaveEdit,
  onCancelEdit,
  showActions = true
}) => {
  if (!playlists || playlists.length === 0) {
    return (
      <div className="no-playlists">
        <p>No tienes playlists creadas aún.</p>
        <p>¡Crea tu primera playlist!</p>
      </div>
    );
  }

  return (
    <div className="playlists-grid">
      {playlists.map(playlist => (
        <PlaylistItemWithActions 
          key={playlist.id}
          playlist={playlist}
          onEdit={onEdit}
          onDelete={onDelete}
          onPlaylistClick={onPlaylistClick}
          isEditing={editingId === playlist.id}
          editTitle={editTitle}
          editDescription={editDescription}
          editIsPublic={editIsPublic}
          onEditTitleChange={onEditTitleChange}
          onEditDescriptionChange={onEditDescriptionChange}
          onEditIsPublicChange={onEditIsPublicChange}
          onSaveEdit={onSaveEdit}
          onCancelEdit={onCancelEdit}
          showActions={showActions} 
        />
      ))}
    </div>
  );
};

export default PlaylistGrid;
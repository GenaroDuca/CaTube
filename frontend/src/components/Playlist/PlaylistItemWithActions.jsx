import { useState } from 'react';
import "../Playlist/PlaylistActions.css";

const PlaylistItemWithActions = ({ 
    playlist, 
    onEdit, 
    onDelete, 
    onPlaylistClick,
    isEditing = false,
    editTitle = "",
    editDescription = "",
    editIsPublic = false,
    onEditTitleChange,
    onEditDescriptionChange,
    onEditIsPublicChange,
    onSaveEdit,
    onCancelEdit,
    showActions = true 
}) => {
    const [showActionsOverlay, setShowActionsOverlay] = useState(false); // ✅ Cambiado el nombre

    // Si está en modo edición, mostrar formulario
    if (isEditing) {
        return (
            <div className="playlist-item-wrapper editing">
                <div className="playlist-edit-form">
                    <h4>Editar Playlist</h4>
                    <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => onEditTitleChange(e.target.value)}
                        placeholder="Título de la playlist"
                        className="edit-input"
                    />
                    <textarea
                        value={editDescription}
                        onChange={(e) => onEditDescriptionChange(e.target.value)}
                        placeholder="Descripción"
                        className="edit-textarea"
                    />
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={editIsPublic}
                            onChange={(e) => onEditIsPublicChange(e.target.checked)}
                        />
                        Playlist pública
                    </label>
                    <div className="edit-actions">
                        <button 
                            onClick={() => onSaveEdit(playlist.id)}
                            className="btn-save"
                        >
                            Guardar
                        </button>
                        <button 
                            onClick={onCancelEdit}
                            className="btn-cancel"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Modo visualización normal
    return (
        <div 
            className="playlist-item-wrapper"
            onMouseEnter={() => setShowActionsOverlay(true)}
            onMouseLeave={() => setShowActionsOverlay(false)}
        >
            {/* CONTENIDO CLICKEABLE */}
            <div 
                className="playlist-content"
                onClick={() => onPlaylistClick(playlist)}
            >
                <div className="playlist-thumbnail">
                    <img src={playlist.thumbnail} alt={playlist.name} />
                    <div className="video-count-badge">{playlist.videoCount} videos</div>
                </div>
                
                <div className="playlist-info">
                    <h4>{playlist.name}</h4>
                    {playlist.description && (
                        <p className="playlist-description">{playlist.description}</p>
                    )}
                    <div className="playlist-meta">
                        <span className={`visibility ${playlist.visibility.toLowerCase()}`}>
                            {playlist.visibility}
                        </span>
                    </div>
                </div>
            </div>

            {/* BOTONES DE ACCIÓN (aparecen al hover) - SOLO SI showActions ES true */}
            {showActions && showActionsOverlay && (
                <div className="playlist-actions-overlay">
                    <button 
                        className="btn-action btn-edit"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(playlist);
                        }}
                        title="Editar playlist"
                    >
                        Editar
                    </button>
                    <button 
                        className="btn-action btn-delete"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(playlist.id, playlist.name);
                        }}
                        title="Eliminar playlist"
                    >
                        Eliminar
                    </button>
                </div>
            )}
        </div>
    );
};

export default PlaylistItemWithActions;
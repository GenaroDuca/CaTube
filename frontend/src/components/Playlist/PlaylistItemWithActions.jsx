// components/Playlist/PlaylistItemWithActions.jsx
import { useState } from 'react';

const PlaylistItemWithActions = ({ playlist, onEdit, onDelete, onPlaylistClick }) => {
    const [showActions, setShowActions] = useState(false);

    return (
        <div 
            className="playlist-item-wrapper"
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            {/* ✅ CONTENIDO CLICKEABLE */}
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

            {/* ✅ BOTONES DE ACCIÓN (aparecen al hover) */}
            {showActions && (
                <div className="playlist-actions-overlay">
                    <button 
                        className="btn-action btn-edit"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(playlist.originalData);
                        }}
                        title="Editar playlist"
                    >
                        ✏️ Editar
                    </button>
                    <button 
                        className="btn-action btn-delete"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(playlist.id, playlist.name);
                        }}
                        title="Eliminar playlist"
                    >
                        🗑️ Eliminar
                    </button>
                </div>
            )}
        </div>
    );
};

export default PlaylistItemWithActions;
import { useState } from 'react';
import { usePlaylists } from '../../hooks/usePlaylists';
import "../Playlist/CreatePlaylistButton.css";

const CreatePlaylistButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const { addPlaylist, loading } = usePlaylists();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        
        try {
            await addPlaylist({
                playlist_title: title,
                playlist_description: description,
                isPublic: isPublic
            });
            setTitle('');
            setDescription('');
            setIsPublic(true);
            setIsOpen(false);
        } catch (error) {
            console.error('Error creating playlist:', error);
        }
    };

    return (
        <div className="create-playlist-section">
            <button 
                onClick={() => setIsOpen(true)}
                className="btn-create-playlist"
            >
                Crear Nueva Playlist
            </button>

            {isOpen && (
                <div className="modal-overlay" onClick={() => setIsOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Crear Nueva Playlist</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Título *</label>
                                <input
                                    type="text"
                                    placeholder="Mi playlist increíble"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Descripción</label>
                                <textarea
                                    placeholder="Describe tu playlist..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows="3"
                                />
                            </div>
                            
                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={isPublic}
                                        onChange={(e) => setIsPublic(e.target.checked)}
                                    />
                                    Playlist pública:
                                </label>
                                <small> (Los demás usuarios podrán ver esta playlist) </small>
                            </div>
                            
                            <div className="modal-actions">
                                <button type="submit" disabled={loading || !title.trim()}>
                                    {loading ? 'Creando...' : 'Crear Playlist'}
                                </button>
                                <button type="button" onClick={() => setIsOpen(false)}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreatePlaylistButton;
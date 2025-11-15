import Sidebar from "../../components/common/Sidebar.jsx";
import Youprofile from "../../components/youPageComponents/Youprofile.jsx";
import Sections from "../../components/homePageComponents/Sections.jsx";
import Footer from "../../components/common/Footer.jsx";
import Sectionyou from "../../components/youPageComponents/Sectionyou.jsx";
import deleted from "../../assets/images/yourChannel_media/Delete.png"
import ViewMoreAllSection from "../../components/youPageComponents/ViewMoreAllSection";
import Header from "../../components/common/header/Header.jsx";
import { historyvideo, playlistvideo, viewlatervideo, likedvideo, ViewLaterData, myPlaylistsData } from "../../assets/data/Data.jsx";
import { useRef, useState } from "react";
import { usePlaylists } from "../../hooks/usePlaylists";
import PlaylistGrid from "../../components//Playlist/PlaylistGrid.jsx";
import '../../styles/Global_components.css';
import '../HomePage/HomePage.css';
import '../YourChannelPage/YourChannelPage.css';
import '../YouPage/YouPage.css';
import '../../components/Playlist/PlaylistActions.css';
import playlistThumbnails from "../../assets/images/thumbnails/rabbits.jpg";                 

function You() {
    const HistoryRef = useRef(null);
    const PlaylistRef = useRef(null);
    const ViewLaterRef = useRef(null);
    const LikedRef = useRef(null);

    // Usar el hook de playlists
    const { playlists, loading, error, removePlaylist, editPlaylist } = usePlaylists();
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editIsPublic, setEditIsPublic] = useState(false);

    // Funciones para editar/eliminar
    const startEditing = (playlist) => {
        setEditingId(playlist.id);
        setEditTitle(playlist.name);
        setEditDescription(playlist.description || '');
        setEditIsPublic(playlist.visibility === 'Pública');
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

    const handlePlaylistClick = (playlist) => {
        // Navegar a la página de la playlist
        window.location.href = `/playlist/${playlist.id}`;
    };

    // Transformar las playlists para el grid
    const transformedPlaylists = playlists.map(playlist => {
        if (!playlist) return null;
        
        const getDefaultThumbnail = () => {
            return playlistThumbnails;
        };
        
        return {
            id: playlist.playlist_id,
            thumbnail: getDefaultThumbnail(),
            name: playlist.playlist_title,
            videoCount: playlist.playlistVideos?.length || 0,
            visibility: playlist.isPublic ? 'Pública' : 'Privada',
            description: playlist.playlist_description,
            originalData: playlist
        };
    }).filter(Boolean);

    // Contenido expandido para la sección de Playlists
    const PlaylistsExpandedContent = () => {
        if (loading) {
            return <div className="loading">Cargando playlists...</div>;
        }

        if (error) {
            return <div className="error">Error: {error}</div>;
        }

        return (
            <PlaylistGrid 
                playlists={transformedPlaylists}
                onEdit={startEditing}
                onDelete={handleDelete}
                onPlaylistClick={handlePlaylistClick}
                editingId={editingId}
                editTitle={editTitle}
                editDescription={editDescription}
                editIsPublic={editIsPublic}
                onEditTitleChange={setEditTitle}
                onEditDescriptionChange={setEditDescription}
                onEditIsPublicChange={setEditIsPublic}
                onSaveEdit={saveEdit}
                onCancelEdit={cancelEditing}
                showActions={false}
            />
        );
    };

    return (
        <>
            <Header />
            <Sidebar />
            
            <main className="main-content">
                <Youprofile />
                
                {/* History */}
                <Sectionyou 
                    btnclass="btn-trash" 
                    section="trending" 
                    subtitle="History" 
                    ref={HistoryRef} 
                    render={historyvideo} 
                    startExpanded={true} 
                    cts="carousel-ctsvideos"
                >
                    <img src={deleted} alt="Delete history"/> 
                </Sectionyou>
                
                {/* Playlists */}
                <Sectionyou 
                    btnclass="btn-viewall-playlists" 
                    btntitle="View more" 
                    section="trending" 
                    subtitle="Playlists" 
                    ref={PlaylistRef} 
                    render={[]} 
                    expandedContent={<PlaylistsExpandedContent />} 
                    cts="carousel-ctsvideos" 
                />
                
                {/* View Later */}
                <Sectionyou 
                    btnclass="btn-viewall-playlists" 
                    btntitle="View all" 
                    section="trending" 
                    subtitle="View Later" 
                    ref={ViewLaterRef} 
                    render={viewlatervideo} 
                    expandedContent={<ViewMoreAllSection render={ViewLaterData} />} 
                    cts="carousel-ctsvideos" 
                />
                
                {/* Liked */}
                <Sections 
                    section="trending" 
                    subtitle="Liked" 
                    ref={LikedRef} 
                    render={likedvideo} 
                    type="video" 
                    cts="carousel-ctsvideos" 
                />
                
                <Footer footer="footer" />
            </main>
        </>
    );
}

export default You;
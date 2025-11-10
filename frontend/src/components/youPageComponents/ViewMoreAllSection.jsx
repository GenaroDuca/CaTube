import Container from "../common/Container";
import Item from "./Item";
import { usePlaylists } from "../../hooks/usePlaylists";

function ViewMoreAllSection() {
    const { playlists, loading, error } = usePlaylists();

    if (loading) {
        return (
            <Container className="playlistSection">
                <div>Cargando playlists...</div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="playlistSection">
                <div>Error: {error}</div>
            </Container>
        );
    }

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
        createdAt: playlist.createdAt
    };
}).filter(Boolean); // ← Filtrar cualquier null

    return (
        <Container className="playlistSection">
            <div className="playlistContent">
                {transformedPlaylists.map(playlist => (
                    <Item
                        key={playlist.id}
                        thumbnail={playlist.thumbnail}
                        videoCount={playlist.videoCount}
                        name={playlist.name}
                        visibility={playlist.visibility}
                        url={playlist.url}
                    />
                ))}
            </div>
        </Container>
    );
}

export default ViewMoreAllSection;
import Container from "../common/Container";
import Item from "./Item";
import { usePlaylist } from "../../hooks/usePlaylists";

function ViewMoreAllSection() {
    const { playlists, loading, error } = usePlaylist();
    const transformedPlaylists = playlists.map(playlist => ({
        id: playlist.playlist.id,
        thumbnail: playlist.thumbnail,
        videoCount: playlist.videoCount,
        name: playlist.playlist_title,
        visibility: playlist.isPublic ? "Public" : "Private",
        url: `/playlist/${playlist.playlist_id}`,
    }));

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
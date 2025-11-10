import Container from "../common/Container";
import VideosLatest from "./VideosLatest";
// import { playlists } from "../../assets/data/Data";
import { usePlaylist } from "../../hooks/usePlaylists";
import { useRef } from "react";


function Playlists (){
        const playlistsRef = useRef(null);
        const { playlists, loading, error } = usePlaylist();
        const transformedPlaylists = playlists.map(playlist => ({
            id: playlist.playlist.id,
            title: playlist.playlist_title,
            thumbnail: playlist.thumbnail || "/default_playlist_thumbnail.jpg", 
            videoCount: playlist.playlistVIdeos?.length || 0,
            visibility: playlist.isPublic? "Public" : "Private",
            url: `/playlist/${playlist.playlist.id}`,
        }));

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
                <div>Error al cargar playlists: {error}</div>
            </Container>
        );
    }


    return (
        <>
        <Container className="video-main-content">
        <VideosLatest render= {transformedPlaylists} id="playlistsSection" className="content-table" container="latest-container" ref={playlistsRef} type="videos"/>
        </Container>
        </>
    );
}

export default Playlists;
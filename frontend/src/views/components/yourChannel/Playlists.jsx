import Container from "../hooks/Container";
import VideosLatest from "./VideosLatest";
import { playlists } from "../../../assets/data/Data";
import { useRef } from "react";


function Playlists (){
        const playlistsRef = useRef(null);

    return (
        <>
        <Container className="video-main-content">
        <VideosLatest render= {playlists} id="playlistsSection" className="content-table" container="latest-container" ref={playlistsRef} type="videos"/>
        </Container>
        </>
    );
}

export default Playlists;
import { useParams } from "react-router-dom";
import { usePlaylists } from "../../hooks/usePlaylists";
import Container from "../../components/common/Container";
import Header from "../../components/common/header/Header";
import Sidebar from "../../components/common/Sidebar";
import Footer from "../../components/common/Footer";
import "./PlaylistDetails.css";
import "../../styles/Global_components.css";
import "../../components/Playlist/PlaylistActions.css";
import "./PlaylistDetails.css";              
import "../../styles/Global_components.css";       
import "../../components/Playlist/PlaylistActions.css"; 
import "../HomePage/HomePage.css";                 

function PlaylistDetail() {
    const { id } = useParams();
    const { playlists, loading, error } = usePlaylists();
    
    const playlist = playlists.find(p => p.playlist_id === id);
    
    if (loading) return (
        <>
            <Header />
            <Sidebar />
            <div className="page-container">
            <main className="main-content"> 
                <Container className="video-main-content">
                    <div className="loading">Cargando playlist...</div>
                </Container>
            </main>
            <Footer footer="footer"/>
            </div>
        </>
    );
    
    if (error) return (
        <>
            <Header />
            <Sidebar />
            <div className="page-container">
            <main className="main-content"> 
                <Container className="video-main-content">
                    <div className="error">Error: {error}</div>
                </Container>
            </main>
            <Footer footer="footer"/>
            </div>
        </>
    );
    
    if (!playlist) return (
        <>
            <Header />
            <Sidebar />
            <div className="page-container">
            <main className="main-content"> 
                <Container className="video-main-content">
                    <div className="error">Playlist no encontrada</div>
                </Container>
            </main>
            <Footer footer="footer"/>
            </div>
        </>
    );

    return (
        <>
            <Header />
            <Sidebar />
            <div className="page-container">
            <main className="main-content"> 
                <Container className="video-main-content">
                    <div className="playlist-detail-header">
                        <h1>{playlist.playlist_title}</h1>
                        {playlist.playlist_description && (
                            <p className="playlist-description">{playlist.playlist_description}</p>
                        )}
                        <div className="playlist-meta">
                            <span>{playlist.playlistVideos?.length || 0} videos</span>
                            <span className={`visibility ${playlist.isPublic ? 'pública' : 'privada'}`}>
                                {playlist.isPublic ? 'Pública' : 'Privada'}
                            </span>
                        </div>
                    </div>

                    <div className="playlist-videos">
                        {playlist.playlistVideos?.length > 0 ? (
                            playlist.playlistVideos.map(video => (
                                <div key={video.video_id} className="video-item">
                                    <img src={video.thumbnail} alt={video.title} />
                                    <div className="video-info">
                                        <h3>{video.title}</h3>
                                        <p>{video.description}</p>
                                        <span>{video.duration}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-videos">
                                <p>No hay videos en esta playlist</p>
                            </div>
                        )}
                    </div>
                </Container>
            </main>
            <Footer footer="footer"/>
            </div>
        </>
    );
}

export default PlaylistDetail;
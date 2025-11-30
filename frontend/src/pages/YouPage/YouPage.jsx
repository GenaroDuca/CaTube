import Sidebar from "../../components/common/Sidebar.jsx";
import Youprofile from "../../components/youPageComponents/Youprofile.jsx";
import SectionsCarousel from "../../components/homePageComponents/SectionsCarousel.jsx";
import Footer from "../../components/common/Footer.jsx";
import Sectionyou from "../../components/youPageComponents/Sectionyou.jsx";
import deleted from "../../assets/images/yourChannel_media/Delete.png";
import Header from "../../components/common/header/Header.jsx";
import { useRef, useState, useEffect } from "react";
import { getAuthToken, getMyUserId } from '../../utils/auth.js';
import { VITE_API_URL } from '../../../config';
import resolveUrl from '../../utils/url';
import Loader from '../../components/common/Loader';
import { Link } from 'react-router-dom';

// Importaciones de estilos
import '../../styles/Global_components.css';
import '../HomePage/HomePage.css';
import '../YourChannelPage/YourChannelPage.css';
import '../YouPage/YouPage.css';

// Función para mapear datos de video (similar a Catscribers)
const mapVideoData = (video, token) => {
    const thumbnail = video.thumbnail && video.thumbnail.startsWith('/')
        ? resolveUrl(video.thumbnail)
        : (video.thumbnail || '');

    let avatar = '/assets/images/profile/A.png';
    if (video.channel?.photoUrl) {
        if (video.channel.photoUrl.startsWith('/uploads/')) {
            avatar = resolveUrl(video.channel.photoUrl);
        } else if (video.channel.photoUrl.startsWith('/assets/images/profile/')) {
            avatar = video.channel.photoUrl;
        } else if (video.channel.photoUrl.startsWith('/default-avatar/')) {
            const letterMatch = video.channel.photoUrl.match(/\/default-avatar\/([A-Z])\.png/);
            const letter = letterMatch ? letterMatch[1] : 'A';
            avatar = `/assets/images/profile/${letter}.png`;
        } else {
            avatar = `${video.channel.photoUrl}`;
        }
    }

    return {
        id: video.id,
        thumbnail,
        avatar,
        title: video.title,
        userName: video.channel?.channel_name || 'Unknown',
        description: video.description || '',
        type: video.type || 'video',
        views: `${video.views} views` || 0,
        createdAt: video.createdAt
    };
};

function You() {
    const HistoryRef = useRef(null);
    const PlaylistRef = useRef(null);
    const ViewLaterRef = useRef(null);
    const LikedRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [isLogged, setIsLogged] = useState(false);
    const [historyVideos, setHistoryVideos] = useState([]);
    const [viewLaterVideos, setViewLaterVideos] = useState([]);
    const [likedVideos, setLikedVideos] = useState([]);
    const [error, setError] = useState(null);

    const token = getAuthToken();
    const userId = getMyUserId();

    // ----------------------------------------------------
    // Lógica de Fetch
    // ----------------------------------------------------
    useEffect(() => {
        if (!token || !userId) {
            setIsLogged(false);
            setLoading(false);
            return;
        }

        setIsLogged(true);

        const fetchUserLists = async () => {
            setLoading(true);
            setError(null);

            const fetchList = async (listType) => {
                const endpoint = listType === 'history' ? `/users/${userId}/history` :
                    listType === 'watchlater' ? `/users/${userId}/watchlater` :
                        listType === 'liked' ? `/users/${userId}/liked` : null;

                if (!endpoint) return [];

                const response = await fetch(`${VITE_API_URL}${endpoint}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch ${listType}`);
                }

                const data = await response.json();
                return data.map(item => mapVideoData(item, token));
            };

            try {
                const [historyData, watchLaterData, likedData] = await Promise.all([
                    fetchList('history'),
                    fetchList('watchlater'),
                    fetchList('liked'),
                ]);

                setHistoryVideos(historyData);
                setViewLaterVideos(watchLaterData);
                setLikedVideos(likedData);

            } catch (err) {
                console.error('Error fetching user lists:', err);
                setError(new Error("Couldn't load your personalized lists."));
            } finally {
                setLoading(false);
            }
        };

        fetchUserLists();
    }, [token, userId]);


    // ----------------------------------------------------
    // RENDERIZADO CONDICIONAL: CARGANDO
    // ----------------------------------------------------
    if (loading) {
        return (
            <>
                <Header />
                <Sidebar />
                <main className="main-content">
                    <Loader isOverlay={true} />
                </main>
            </>
        );
    }

    // ----------------------------------------------------
    // RENDERIZADO CONDICIONAL: NO LOGUEADO
    // ----------------------------------------------------
    if (!isLogged) {
        return (
            <>
                <Header />
                <Sidebar />
                <main className="main-content">
                    <div className="catscribers-empty" style={{ paddingTop: '100px' }}>
                        <h2>Sign in to see your profile</h2>
                        <p>Your history, watch later list, and liked videos will appear here.</p>
                    </div>
                </main>
            </>
        );
    }

    // ----------------------------------------------------
    // RENDERIZADO FINAL
    // ----------------------------------------------------
    return (
        <>
            <Header />
            <Sidebar />

            <main className="main-content you-page">
                <Youprofile />

                <div className="title-container">
                    <h1>History</h1>
                </div>
                {/* --- History Videos --- */}
                {historyVideos.filter(v => v.type !== 'short').length > 0 && (
                    <SectionsCarousel
                        section="subscriptions"
                        subtitle="History Videos"
                        render={historyVideos.filter(v => v.type !== 'short')}
                        type="video"
                        cts="carousel-ctsvideos"
                        showTrashButton={true}
                        isHistory={true}
                    />
                )}

                {/* --- History Shorts --- */}
                {historyVideos.filter(v => v.type === 'short').length > 0 && (
                    <SectionsCarousel
                        section="trending"
                        subtitle="History Shorts"
                        render={historyVideos.filter(v => v.type === 'short')}
                        type="short"
                        cts="carousel-ctshorts"
                        showTrashButton={true}
                        isHistory={true}
                    />
                )}

                <div className="title-container">
                    <h1>Liked</h1>
                </div>
                {/* --- Liked Videos --- */}
                {likedVideos.filter(v => v.type !== 'short').length > 0 && (
                    <SectionsCarousel
                        section="subscriptions"
                        subtitle="Liked Videos"
                        render={likedVideos.filter(v => v.type !== 'short')}
                        type="video"
                        cts="carousel-ctsvideos"
                    />
                )}

                {/* --- Liked Shorts --- */}
                {likedVideos.filter(v => v.type === 'short').length > 0 && (
                    <SectionsCarousel
                        section="trending"
                        subtitle="Liked Shorts"
                        render={likedVideos.filter(v => v.type === 'short')}
                        type="short"
                        cts="carousel-ctshorts"
                    />
                )}

                <div className="title-container">
                    <h1>View Later</h1>
                </div>
                {/* --- View Later Videos --- */}
                {viewLaterVideos.filter(v => v.type !== 'short').length > 0 && (
                    <SectionsCarousel
                        section="subscriptions"
                        subtitle="View Later Videos"
                        render={viewLaterVideos.filter(v => v.type !== 'short')}
                        type="video"
                        cts="carousel-ctsvideos"
                    />
                )}

                {/* --- View Later Shorts --- */}
                {viewLaterVideos.filter(v => v.type === 'short').length > 0 && (
                    <SectionsCarousel
                        section="trending"
                        subtitle="View Later Shorts"
                        render={viewLaterVideos.filter(v => v.type === 'short')}
                        type="short"
                        cts="carousel-ctshorts"
                    />
                )}

                {/* Mensaje si no hay nada en las listas */}
                {historyVideos.length === 0 && viewLaterVideos.length === 0 && likedVideos.length === 0 && !loading && (
                    <div className="catscribers-empty" style={{ paddingTop: '50px' }}>
                        <h2>Nothing here yet</h2>
                        <p>Start watching videos, liking them, or saving them to "View Later".</p>
                    </div>
                )}

                {error && (
                    <div className="catscribers-empty" style={{ paddingTop: '50px', color: 'red' }}>
                        <h2>Error loading content</h2>
                        <p>{error.message}</p>
                    </div>
                )}

                {/* <Footer footer="footer" /> */}
            </main>

        </>
    );
}

export default You;
import Sidebar from "../../components/common/Sidebar.jsx";
import Youprofile from "../../components/youPageComponents/Youprofile.jsx";
import SectionsCarousel from "../../components/homePageComponents/SectionsCarousel.jsx";
import Footer from "../../components/common/Footer.jsx";
import Sectionyou from "../../components/youPageComponents/Sectionyou.jsx";
import deleted from "../../assets/images/yourChannel_media/Delete.png";
import Header from "../../components/common/header/Header.jsx";
import { useRef, useState, useEffect } from "react";
import { getAuthToken, getMyUserId } from '../../utils/auth.js';
import { useToast } from '../../hooks/useToast';
import { VITE_API_URL } from '../../../config';
import resolveUrl from '../../utils/url';
import Loader from '../../components/common/Loader';
import { Link, useLocation } from 'react-router-dom';

// Importaciones de estilos
import '../../styles/Global_components.css';
import '../HomePage/HomePage.css';
import '../YourChannelPage/YourChannelPage.css';
import '../YouPage/YouPage.css';

//Modal
import { useModal } from '../../components/common/modal/ModalContext.jsx';
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
    const location = useLocation();

    const HistoryRef = useRef(null);
    const YouRef = useRef(null);
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
    const { showSuccess, showError } = useToast();
    const { openModal, closeModal } = useModal();

    // ----------------------------------------------------
    // Lógica de Scroll a la Sección
    // ----------------------------------------------------
    useEffect(() => {
        if (loading || !isLogged) {
            return;
        }

        const hash = location.hash;
        let refToScroll = null;
        const HEADER_HEIGHT = 70;

        // Lógica para determinar el destino del scroll
        if (hash) {
            const sectionId = hash.substring(1);

            switch (sectionId) {
                case 'you':
                    refToScroll = YouRef;
                    break;
                case 'history':
                    refToScroll = HistoryRef;
                    break;
                case 'viewlater':
                    refToScroll = ViewLaterRef;
                    break;
                case 'liked':
                    refToScroll = LikedRef;
                    break;
                default:
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    return;
            }
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }
        if (refToScroll && refToScroll.current) {
            setTimeout(() => {
                const element = refToScroll.current;
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - HEADER_HEIGHT + 10;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }, 100);
        }
    }, [loading, isLogged, location]);
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

    const handleRemoveFromWatchLater = async (video) => {

        if (!token || !userId) return;
        try {
            const res = await fetch(`${VITE_API_URL}/users/${userId}/watchlater/${video.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                throw new Error('Failed to remove from Watch Later');
            }
            setViewLaterVideos(prev => prev.filter(v => v.id !== video.id));
            showSuccess('Removed from Watch Later');
        } catch (err) {
            console.error('Error removing from watch later', err);
            showError('Could not remove from Watch Later');
        }
    };

    const handleRemoveFromHistory = async (video) => {
        if (!token || !userId) return;
        try {
            const res = await fetch(`${VITE_API_URL}/users/me/history/${video.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                throw new Error('Failed to remove from history');
            }
            setHistoryVideos(prev => prev.filter(v => v.id !== video.id));
            showSuccess('Removed from History');
        } catch (err) {
            console.error('Error removing from history', err);
            showError('Could not remove from History');
        }
    };

    const handleClearHistory = async () => {
        if (!token || !userId) return;
        try {
            const res = await fetch(`${VITE_API_URL}/users/me/history`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Failed to clear history');
            setHistoryVideos([]);
            showSuccess('History cleared');
            closeModal();
        } catch (err) {
            console.error('Error clearing history', err);
            showError('Could not clear history');
            closeModal();
        }
    };

    const handleClearHistoryConfirm = async () => {
        openModal('confirm', {
            title: "Delete Comment",
            message: `Are you sure you want to delete this comment?`,
            confirmText: "Delete",
            onConfirm: handleClearHistory,
        });
    }


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

            <main className="main-content you-page" ref={YouRef} id="you">
                <Youprofile />

                <div className="title-container" ref={HistoryRef} id="history">
                    <h1>History</h1>

                </div>
                {historyVideos.length === 0 && !loading && (
                    <div className="youpage-empty">
                        <p>Nothing here yet</p>
                    </div>
                )}

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
                        onRemove={handleRemoveFromHistory}
                    />
                )}
                {historyVideos.length > 0 && (
                    <div className="btn-clear-history-container">
                        <button className="btn-clear-history" onClick={handleClearHistoryConfirm} aria-label="Clear history">Clear history</button>
                    </div>
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
                        onRemove={handleRemoveFromHistory}
                    />
                )}

                <div className="title-container" ref={LikedRef} id="liked">
                    <h1>Liked</h1>
                </div>
                {likedVideos.length === 0 && !loading && (
                    <div className="youpage-empty">
                        <p>Nothing here yet</p>
                    </div>
                )}
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

                <div className="title-container" ref={ViewLaterRef} id="viewlater">
                    <h1>View Later</h1>
                </div>
                {viewLaterVideos.length === 0 && !loading && (
                    <div className="youpage-empty">
                        <p>Nothing here yet</p>
                    </div>
                )}
                {/* --- View Later Videos --- */}
                {viewLaterVideos.filter(v => v.type !== 'short').length > 0 && (
                    <SectionsCarousel
                        section="subscriptions"
                        subtitle="View Later Videos"
                        render={viewLaterVideos.filter(v => v.type !== 'short')}
                        type="video"
                        cts="carousel-ctsvideos"
                        showTrashButton={true}
                        onRemove={handleRemoveFromWatchLater}
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
                        showTrashButton={true}
                        onRemove={handleRemoveFromWatchLater}
                    />
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
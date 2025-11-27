import Sidebar from "../../components/common/Sidebar.jsx";
import { useState, useEffect } from 'react';
import Footer from "../../components/common/Footer.jsx";
import { ChannelList } from '../../components/user/ChannelList.jsx';
import { VideoList } from '../../components/videoPageComponents/VideoList.jsx';
import '../../styles/Global_components.css'
import '../HomePage/HomePage.css'
import '../SearchPage/SearchPage.css'
import './CatscribersPage.css'
import Header from "../../components/common/header/Header.jsx";
import { getAuthToken, getMyUserId } from '../../utils/auth.js';
import { VITE_API_URL } from '../../../config';
import Container from '../../components/common/Container.jsx'
import Subtitle from '../../components/homePageComponents/Subtitle.jsx'
import Video from '../../components/homePageComponents/Video.jsx'
import Short from '../../components/homePageComponents/Short.jsx'
import { Link } from 'react-router-dom';
import SectionsCarousel from "../../components/homePageComponents/SectionsCarousel.jsx";
// IMPORTANTE: Asegúrate de importar el componente Loader
import Loader from '../../components/common/Loader';


function Catscribers() {
    const [subscribedChannels, setSubscribedChannels] = useState([]);
    const [subscribedVideos, setSubscribedVideos] = useState([]);
    const [subscribedShorts, setSubscribedShorts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState(null); // Añadir estado de error
    const token = getAuthToken();

    useEffect(() => {
        async function fetchSubscribedContent() {
            try {
                setLoading(true);
                setError(null); // Resetear error al iniciar la carga

                const userId = getMyUserId();
                if (!userId) {
                    console.log('No user logged in');
                    setLoading(false);
                    return;
                }

                // ----------------------------------------------------
                // 1. Promesas para obtener los datos en paralelo
                // ----------------------------------------------------

                // Función auxiliar para obtener suscripciones
                const fetchSubscriptions = () => fetch(`${VITE_API_URL}/subscriptions/user/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                }).then(res => res.json());

                // Función auxiliar para obtener todos los canales
                const fetchAllChannels = () => fetch(`${VITE_API_URL}/channels`).then(res => res.json());

                // Función auxiliar para obtener videos
                const fetchAllVideos = () => fetch(`${VITE_API_URL}/videos`, {
                    headers: { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) },
                }).then(res => res.json());

                // Función auxiliar para obtener shorts
                const fetchAllShorts = () => fetch(`${VITE_API_URL}/videos/shorts`, {
                    headers: { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) },
                }).then(res => res.json());

                // Usamos Promise.all para esperar las peticiones críticas
                const [subscriptions, allChannels, allVideos, allShorts] = await Promise.all([
                    fetchSubscriptions(),
                    fetchAllChannels(),
                    fetchAllVideos(),
                    fetchAllShorts(),
                ]);

                const subscribedChannelIds = subscriptions.map(sub => sub.channel_id);

                // 2. Procesar Canales
                const subscribedChannelsData = allChannels
                    .filter(channel => subscribedChannelIds.includes(channel.channel_id))
                    // ... (Lógica de transformación de canales)
                    .map(channel => {
                        let avatar = '/assets/images/profile/A.png';
                        // ... Lógica de path de avatar (la lógica original es extensa, la mantengo)
                        if (channel.photoUrl) {
                            if (channel.photoUrl.startsWith('/uploads/')) {
                                avatar = `${VITE_API_URL}${channel.photoUrl}`;
                            } else if (channel.photoUrl.startsWith('/assets/images/profile/')) {
                                avatar = channel.photoUrl;
                            } else if (channel.photoUrl.startsWith('/default-avatar/')) {
                                const letterMatch = channel.photoUrl.match(/\/default-avatar\/([A-Z])\.png/);
                                const letter = letterMatch ? letterMatch[1] : 'A';
                                avatar = `/assets/images/profile/${letter}.png`;
                            } else {
                                avatar = `${channel.photoUrl}`;
                            }
                        } else {
                            const firstLetter = channel.channel_name?.charAt(0).toUpperCase() || 'A';
                            avatar = `https://catube-uploads.s3.sa-east-1.amazonaws.com/profile/${firstLetter}.png`;
                        }

                        return {
                            id: channel.channel_id,
                            avatar,
                            userName: channel.channel_name,
                            subscriptions: channel.subscriberCount || 0,
                            url: channel.url
                        };
                    });
                setSubscribedChannels(subscribedChannelsData);


                // 3. Procesar Videos
                const subscribedVideosData = allVideos
                    .filter(video => subscribedChannelIds.includes(video.channel?.channel_id))
                    .filter(video => video.type === 'video')
                    .map(video => {
                        // ... Lógica de transformación de videos (la mantengo)
                        const thumbnail = video.thumbnail && video.thumbnail.startsWith('/')
                            ? `${VITE_API_URL}${video.thumbnail}`
                            : (video.thumbnail || '');

                        let avatar = '/assets/images/profile/A.png';
                        if (video.channel?.photoUrl) {
                            if (video.channel.photoUrl.startsWith('/uploads/')) {
                                avatar = `${VITE_API_URL}${video.channel.photoUrl}`;
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
                    });
                setSubscribedVideos(subscribedVideosData);

                // 4. Procesar Shorts
                const subscribedShortsData = allShorts
                    .filter(short => subscribedChannelIds.includes(short.channel?.channel_id))
                    .map(short => ({
                        id: short.id,
                        thumbnail: short.thumbnail,
                        nameshort: short.title,
                        shortviews: `${short.views || 0} views`,
                        createdAt: short.createdAt,
                        userName: short.channel?.channel_name || 'Unknown'
                    }));
                setSubscribedShorts(subscribedShortsData);

            } catch (err) {
                console.error('Error fetching subscribed content:', err);
                setError(new Error("Hubo un error al cargar tus suscripciones."));
                setSubscribedChannels([]);
                setSubscribedVideos([]);
                setSubscribedShorts([]);
            } finally {
                setLoading(false);
            }
        }

        if (token) {
            fetchSubscribedContent();
        } else {
            setLoading(false);
        }
    }, [token]);


    // Filtrar canales por búsqueda
    const filteredChannels = subscribedChannels.filter(channel =>
        channel.userName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filtrar videos por búsqueda (buscar en título o nombre del canal)
    const filteredVideos = subscribedVideos.filter(video =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.userName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filtrar shorts por búsqueda
    const filteredShorts = subscribedShorts.filter(short =>
        short.nameshort.toLowerCase().includes(searchQuery.toLowerCase()) ||
        short.userName.toLowerCase().includes(searchQuery.toLowerCase())
    );


    // ============================================
    // 1. RENDERIZADO CONDICIONAL: CARGANDO
    // ============================================
    if (loading) {
        return (
            <>
                <Header />
                <Sidebar />
                <main className="main-content">
                    {/* Usamos el Loader genérico en modo Overlay */}
                    <Loader isOverlay={true} />

                    {/* Mantenemos el input para que no salte el layout, pero cubierto por el loader */}
                    <div className="catscribers-search-container" style={{ opacity: 0 }}>
                        <input type="text" className="catscribers-search-input" disabled />
                    </div>
                </main>
            </>
        );
    }

    // ============================================
    // 2. RENDERIZADO CONDICIONAL: ERROR
    // ============================================
    if (error) {
        return (
            <>
                <Header />
                <Sidebar />
                <main className="main-content">
                    <div className="catscribers-empty error-state">
                        <h2>{error.message}</h2>
                        <p>No pudimos cargar tu contenido suscrito. Por favor, revisa tu conexión e inténtalo de nuevo.</p>
                    </div>
                </main>
            </>
        );
    }

    // El resto de la lógica de No Token y No Suscripciones se mantiene igual

    if (!token) {
        return (
            <>
                <Header />
                <Sidebar />
                <main className="main-content">
                    <div className="catscribers-empty">
                        <h2>Sign in to see your Catscribers</h2>
                        <p>You need to be logged in to see your subscribed channels</p>
                    </div>
                </main>
            </>
        );
    }

    if (subscribedChannels.length === 0 && subscribedVideos.length === 0 && subscribedShorts.length === 0 && !searchQuery) {
        return (
            <>
                <Header />
                <Sidebar />
                <main className="main-content">
                    <div className="catscribers-empty">
                        <h2>No Catscriptions Yet</h2>
                        <p>Subscribe to channels to see their content here!</p>
                    </div>
                </main>
            </>
        );
    }


    return (
        <>
            <Header />
            <Sidebar />
            <main className="main-content">
                {/* Buscador */}
                <div className="catscribers-search-container">
                    <input
                        type="text"
                        className="catscribers-search-input"
                        placeholder="Search in your subscriptions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Lista de canales suscritos */}
                <section className="catscribers-channels-section">
                    <h2 className="catscribers-section-title">Your Catscriptions <span>({filteredChannels.length})</span></h2>
                    {filteredChannels.length > 0 ? (
                        <ChannelList channels={filteredChannels} />
                    ) : (
                        <p className="catscribers-no-results">
                            {searchQuery
                                ? `No channels found matching "${searchQuery}"`
                                : 'No channels available from your subscribed channels.'}
                        </p>
                    )}
                </section>

                {/* Shorts de canales suscritos */}
                <section className="catscribers-shorts-section">
                    {filteredShorts.length > 0 ? (
                        <SectionsCarousel
                            section="trending-shorts"
                            subtitle="Shorts"
                            render={filteredShorts}
                            type="short"
                            cts="carousel-ctshorts"
                        />
                    ) : (
                        <p className="catscribers-no-results">
                            {searchQuery
                                ? `No shorts found matching "${searchQuery}"`
                                : 'No shorts available from your subscribed channels.'}
                        </p>
                    )}
                </section>

                {/* Videos de canales suscritos */}
                <section className="catscribers-videos-section">
                    {filteredVideos.length > 0 ? (
                        <Container className="VideoContainer">
                            <Subtitle subtitle="Videos" />
                            <Container className="recommendations-container">
                                {filteredVideos.map((video, index) => (
                                    <Link to={`/watch/${video.id}`} key={video.id || index}>
                                        <Video
                                            namevideo={video.title}
                                            videoviews={video.views}
                                            thumbnail={video.thumbnail}
                                            createdAt={video.createdAt}
                                        />
                                    </Link>
                                ))}
                            </Container>
                        </Container>
                    ) : (
                        <p className="catscribers-no-results">
                            {searchQuery ? `No videos found matching "${searchQuery}"` : 'No videos available from your subscribed channels.'}
                        </p>
                    )}
                </section>

                {/* <Footer footer="footer"></Footer> */}
            </main>
        </>
    );
}

export default Catscribers;
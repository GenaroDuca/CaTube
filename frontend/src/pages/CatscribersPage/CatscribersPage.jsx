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


function Catscribers() {
    const [subscribedChannels, setSubscribedChannels] = useState([]);
    const [subscribedVideos, setSubscribedVideos] = useState([]);
    const [subscribedShorts, setSubscribedShorts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const token = getAuthToken();

    useEffect(() => {
        async function fetchSubscribedContent() {
            try {
                setLoading(true);

                // Obtener el userId desde el token
                const userId = getMyUserId();
                if (!userId) {
                    console.log('No user logged in');
                    setLoading(false);
                    return;
                }

                // 1. Obtener las suscripciones del usuario
                const subsResponse = await fetch(`${VITE_API_URL}/subscriptions/user/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!subsResponse.ok) {
                    console.error('Failed to fetch subscriptions');
                    setLoading(false);
                    return;
                }

                const subscriptions = await subsResponse.json();
                const subscribedChannelIds = subscriptions.map(sub => sub.channel_id);

                // 2. Obtener todos los canales y filtrar los suscritos
                const channelsResponse = await fetch(`${VITE_API_URL}/channels`);
                if (channelsResponse.ok) {
                    const allChannels = await channelsResponse.json();

                    const subscribedChannelsData = allChannels
                        .filter(channel => subscribedChannelIds.includes(channel.channel_id))
                        .map(channel => {
                            let avatar = '/assets/images/profile/A.png';

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
                                avatar = `/assets/images/profile/${firstLetter}.png`;
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
                }

                // 3. Obtener todos los videos y filtrar los de canales suscritos
                const videosResponse = await fetch(`${VITE_API_URL}/videos`, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token && { 'Authorization': `Bearer ${token}` })
                    },
                });

                if (videosResponse.ok) {
                    const allVideos = await videosResponse.json();

                    const subscribedVideosData = allVideos
                        .filter(video => subscribedChannelIds.includes(video.channel?.channel_id))
                        .filter(video => video.type === 'video')
                        .map(video => {
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
                }

                // 4. Obtener todos los shorts y filtrar los de canales suscritos
                const shortsResponse = await fetch(`${VITE_API_URL}/videos/shorts`, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token && { 'Authorization': `Bearer ${token}` })
                    },
                });

                if (shortsResponse.ok) {
                    const allShorts = await shortsResponse.json();
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
                }

            } catch (error) {
                console.error('Error fetching subscribed content:', error);
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

    if (loading) {
        return (
            <>
                <Header />
                <Sidebar />
                <main className="main-content">
                    <div className="catscribers-loading">Loading your subscriptions...</div>
                </main>
            </>
        );
    }

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
                    <Footer footer="footer"></Footer>
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
                    <Footer footer="footer"></Footer>
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
                            ref={filteredShorts}
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

                <Footer footer="footer"></Footer>
            </main>
        </>
    );
}

export default Catscribers;
import { useEffect, useState, useRef } from "react";
import Container from "../common/Container";
import ContainerChannel from "../../components/yourChannelPageComponents/ContainerChannel";
import SectionsCarousel from "../homePageComponents/SectionsCarousel";
import { getAuthToken } from "../../utils/auth.js";
import { VITE_API_URL } from '../../../config';
import Loader from "../../components/common/Loader";

function HomeTab({ channelId }) {
    const foryouRef = useRef(null); // Usado para Recent Videos
    const popularRef = useRef(null); // Nuevo ref para Popular Videos
    const shortsRef = useRef(null);

    const [videos, setVideos] = useState([]);
    const [shorts, setShorts] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = getAuthToken();

    useEffect(() => {
        async function fetchChannelContent() {
            try {
                if (!channelId) return;

                setLoading(true);

                // Fetch videos for this channel
                const videosRes = await fetch(`${VITE_API_URL}/videos/channel/${channelId}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                if (videosRes.ok) {
                    const data = await videosRes.json();

                    // --- Mapeo y Separación de Contenido ---

                    const allVideos = data.filter(v => v.type === "video" || !v.type).map(video => ({
                        id: video.id,
                        namevideo: video.title,
                        // Almacenar las vistas como número para la clasificación
                        views: video.views || 0,
                        videoviews: `${video.views || 0} views`,
                        createdAt: video.createdAt,
                        thumbnail: `${video.thumbnail}`,
                        channel_name: video.channel?.channel_name || 'Unknown'
                    }));

                    const allShorts = data.filter(v => v.type === "short").map(short => ({
                        id: short.id,
                        nameshort: short.title,
                        shortviews: `${short.views || 0} views`,
                        thumbnail: `${short.thumbnail}`,
                        createdAt: short.createdAt
                    }));

                    setVideos(allVideos);
                    setShorts(allShorts);
                } else {
                    console.error('Error fetching channel videos');
                    setVideos([]);
                    setShorts([]);
                }
            } catch (error) {
                console.error("Error fetching channel content:", error);
                setVideos([]);
                setShorts([]);
            } finally {
                setLoading(false);
            }
        }

        fetchChannelContent();
    }, [channelId, token]);

    if (loading) {
        return <Loader />;
    }

    // --- LÓGICA DE ORDENAMIENTO DE VIDEOS ---
    const recentVideos = videos.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const popularVideos = videos.slice().sort((a, b) => b.views - a.views);

    return (
        <>
            <Container className="content-table">
                <ContainerChannel channelId={channelId} />
            </Container>

            {/* --- 1. RECIENTES (LATEST) --- */}
            {recentVideos.length > 0 && (
                <SectionsCarousel
                    section="subscriptions"
                    subtitle="Recent Videos"
                    ref={foryouRef}
                    render={recentVideos}
                    type="video"
                    cts="carousel-ctsvideos"
                />
            )}

            {/* --- 2. MÁS POPULARES (MOST POPULAR) --- */}
            {popularVideos.length > 0 && (
                <SectionsCarousel
                    section="subscriptions"
                    subtitle="Most Popular"
                    ref={popularRef}
                    render={popularVideos}
                    type="video"
                    cts="carousel-ctsvideos"
                />
            )}

            {/* --- 3. SHORTS --- */}
            {shorts.length > 0 && (
                <SectionsCarousel
                    section="subscriptions"
                    subtitle="Shorts"
                    ref={shortsRef}
                    render={shorts}
                    type="short"
                    cts="carousel-ctshorts"
                />
            )}

            {videos.length === 0 && shorts.length === 0 && (
                <div className="empty-channel-message">
                    <h3>No videos uploaded yet</h3>
                    <p>This channel hasn't uploaded any content</p>
                </div>
            )}
        </>
    );
}

export default HomeTab;
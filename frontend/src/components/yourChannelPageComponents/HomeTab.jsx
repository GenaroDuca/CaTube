import { useEffect, useState, useRef } from "react";
import Container from "../common/Container";
import ContainerChannel from "../../components/yourChannelPageComponents/ContainerChannel";
import Sections from "../../components/homePageComponents/Sections";
import { getAuthToken } from "../../utils/auth.js";

function HomeTab({ channelId }) {
    const foryouRef = useRef(null);
    const videosRef = useRef(null);
    const shortsRef = useRef(null);

    const [videos, setVideos] = useState([]);
    const [shorts, setShorts] = useState([]);
    // recent videos will be derived from `videos` (sorted by createdAt desc)

    const token = getAuthToken();

    useEffect(() => {
        async function fetchChannelContent() {
            try {
                if (!channelId) return;

                // Fetch videos for this channel
                const videosRes = await fetch(`http://localhost:3000/videos/channel/${channelId}`);
                if (videosRes.ok) {
                    const data = await videosRes.json();
                    // Separate by type
                    const allVideos = data.filter(v => v.type === "video" || !v.type).map(video => ({
                        ...video,
                        views: video.views || 0, // Aseguramos que todos los videos tengan un conteo de vistas
                        createdAt: video.createdAt || new Date().toISOString() // Aseguramos que todos tengan fecha
                    }));
                    const allShorts = data.filter(v => v.type === "short");

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
            }
        }

        fetchChannelContent();
    }, [channelId]);

    // Ordenar los videos
    const recentVideos = videos.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const popularVideos = videos.slice().sort((a, b) => {
        // Por ahora usamos un orden aleatorio hasta implementar vistas
        // Luego será: return b.views - a.views;
        return Math.random() - 0.5;
    });

    return (
        <>
            <Container className="content-table">
                <ContainerChannel channelId={channelId} />
            </Container>

            {recentVideos.length > 0 && (
                <Sections
                    section="subscriptions"
                    subtitle="Recent Videos"
                    ref={foryouRef}
                    render={recentVideos}
                    type="video"
                    cts="carousel-ctsvideos"
                />
            )}

            {popularVideos.length > 0 && (
                <Sections
                    section="subscriptions"
                    subtitle="Most Popular"
                    ref={videosRef}
                    render={popularVideos}
                    type="video"
                    cts="carousel-ctsvideos"
                />
            )}

            {shorts.length > 0 && (
                <Sections
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
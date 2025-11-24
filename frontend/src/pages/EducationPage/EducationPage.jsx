import Sidebar from "../../components/common/Sidebar.jsx";
import SectionsCarousel from "../../components/homePageComponents/SectionsCarousel.jsx";
import { useEffect, useRef, useState } from 'react';
import Title from "../../components/trendingPageComponents/Title.jsx";
import Footer from "../../components/common/Footer.jsx";
import Block from "../../components/trendingPageComponents/Block.jsx";
import VideoCard from "../../components/trendingPageComponents/VideoCard";
import Header from "../../components/common/header/Header.jsx";
import '../../styles/Global_components.css'
import '../HomePage/HomePage.css'
import '../TrendingPage/TrendingPage.css'
import { getAuthToken } from "../../utils/auth";
import { VITE_API_URL } from '../../../config';

function Education() {
    const shortsRef = useRef(null);
    const [shorts, setShorts] = useState([]);
    const videosRef = useRef(null);
    const [videos, setVideos] = useState([]);

    const token = getAuthToken();

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await fetch(`${VITE_API_URL}/videos/education`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const data = await response.json();

                const transformed = data.map(video => ({
                    type: video.type,
                    id: video.id,
                    nameshort: video.title,
                    shortviews: `${video.views || 0} views`,
                    thumbnail: ` ${video.thumbnail}`,
                    createdAt: video.createdAt,
                }));

                // Separar entre shorts y videos largos según el campo "type"
                const shortsList = transformed.filter(v => v.type === 'short');
                const videosList = transformed.filter(v => v.type === 'video');

                setShorts(shortsList);
                setVideos(videosList);
                console.log(shortsList);
                console.log(videosList);
            } catch (error) {
                console.error('Error fetching videos:', error);
            }
        };

        fetchVideos();
    }, []);

    return (
        <>
            <Header />
            <Sidebar />
            <main className="main-content">
                <Title class="title-container" title="Education"></Title>

                {/* Bloque para Videos Largos */}
                <Block section="trending-videos" subtitle="Education Videos">
                    {videos.length > 0 ? (
                        videos.map(video => <VideoCard key={video.id} video={video} />)
                    ) : (
                        <p>No educational videos found.</p>
                    )}
                </Block>

                {/* --- Lógica para Shorts --- */}
                {shorts.length > 0 ? (
                    // 1. Si hay shorts, renderizar el carrusel
                    <SectionsCarousel
                        section="trending-shorts"
                        subtitle="Education Shorts"
                        ref={shortsRef}
                        render={shorts}
                        type="short"
                        cts="carousel-ctshorts"
                    />
                ) : (
                    // 2. Si no hay shorts, mostrar un <Block> con el mensaje
                    <Block section="trending-shorts" subtitle="Education Shorts">
                        <p>No educational shorts found.</p>
                    </Block>
                )}

                <Footer footer="footer"> </Footer>
            </main>
        </>
    );
}


export default Education;
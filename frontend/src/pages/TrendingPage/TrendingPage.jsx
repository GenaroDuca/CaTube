import Sidebar from "../../components/common/Sidebar.jsx";
import SectionsCarousel from "../../components/homePageComponents/SectionsCarousel.jsx";
import { useRef, useState, useEffect } from 'react';
import Title from "../../components/trendingPageComponents/Title.jsx";
import Footer from "../../components/common/Footer.jsx";
import Block from "../../components/trendingPageComponents/Block.jsx";
import VideoCard from "../../components/trendingPageComponents/VideoCard.jsx"
import Header from "../../components/common/header/Header.jsx";
import '../../styles/Global_components.css'
import '../HomePage/HomePage.css'
import '../TrendingPage/TrendingPage.css'
import { getAuthToken } from '../../utils/auth.js';
import { VITE_API_URL } from '../../../config';
import Loader from '../../components/common/Loader.jsx';

function Trending() {
    const shortsRef = useRef(null);
    const [shorts, setShorts] = useState([]);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = getAuthToken();

    useEffect(() => {
        async function fetchTrendingContent() {
            try {
                setLoading(true);

                // Función auxiliar para ordenar por vistas (descendente)
                const sortByViews = (a, b) => {
                    // Convertir la cadena de vistas a un número entero para la comparación
                    // Suponiendo que 'views' es una propiedad numérica en el objeto de la API
                    return b.views - a.views;
                };

                // --- Fetch shorts ---
                const shortsResponse = await fetch(`${VITE_API_URL}/videos/shorts`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (shortsResponse.ok) {
                    const shortsData = await shortsResponse.json();

                    // 1. Aplicar el ordenamiento
                    const sortedShorts = shortsData.sort(sortByViews);

                    const formattedShorts = sortedShorts.map(short => ({
                        id: short.id,
                        nameshort: short.title,
                        shortviews: `${short.views} views`,
                        thumbnail: short.thumbnail,
                        createdAt: short.createdAt
                    }));
                    setShorts(formattedShorts);
                }

                // --- Fetch videos ---
                const videosResponse = await fetch(`${VITE_API_URL}/videos`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (videosResponse.ok) {
                    const videosData = await videosResponse.json();

                    const filteredVideos = videosData.filter(video => video.type === 'video');

                    // 2. Aplicar el ordenamiento
                    const sortedVideos = filteredVideos.sort(sortByViews);

                    // APLICAR LA POSICIÓN DE TENDENCIA AQUÍ
                    const formattedVideos = sortedVideos.map((video, index) => ({
                        id: video.id,
                        title: video.title,
                        videoviews: `${video.views} views`,
                        thumbnail: video.thumbnail,
                        createdAt: video.createdAt,
                        description: video.description,
                        // ESTA ES LA NUEVA PROPIEDAD
                        position: index + 1 // El índice empieza en 0, la posición en 1
                    }));
                    setVideos(formattedVideos);
                }
            } catch (error) {
                console.error('Error fetching trending content:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchTrendingContent();
    }, []);

    if (loading) {
        return (
            <main className="main-content">
                <Loader isOverlay={true}/>
            </main>
        );
    }

    return (
        <>
            <Header></Header>
            <Sidebar>
            </Sidebar>

            <main className="main-content">
                <Title class="title-container" title="Trending"></Title>
                <SectionsCarousel section="trending-shorts" subtitle="Trending Shorts" ref={shortsRef} render={shorts} type="short" cts="carousel-ctshorts"></SectionsCarousel>
                <Block section="trending-videos" subtitle="Trending Videos">
                    {videos.map(video => (
                        // Se pasa la posición como parte del objeto 'video'
                        <VideoCard key={video.id} video={video} />
                    ))}
                </Block>
                {/* <Footer footer="footer"></Footer> */}
            </main>
        </>
    );
}

export default Trending;
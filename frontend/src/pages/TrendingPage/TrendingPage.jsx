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
            <>
                <Header></Header>
                <Sidebar></Sidebar>
                <main className="main-content">
                    <div className="title-container">
                        <div className="skeleton" style={{ width: '150px', height: '40px', backgroundColor: '#e0e0e0', borderRadius: '4px' }}></div>
                    </div>

                    {/* Skeleton for Trending Shorts */}
                    <div className="title-container">
                        <div className="skeleton" style={{ width: '220px', height: '30px', backgroundColor: '#e0e0e0', borderRadius: '4px', marginTop: '20px' }}></div>
                    </div>
                    <div style={{ width: '95%', margin: '1rem auto', backgroundColor: 'var(--primary-color)', borderRadius: '30px', padding: '20px' }}>
                        <div style={{ display: 'flex', gap: '15px'}}>
                            {[...Array(6)].map((_, index) => (
                                <div key={index} style={{ minWidth: '200px' }}>
                                    <div className="skeleton" style={{ width: '200px', aspectRatio: '9/16', backgroundColor: '#e0e0e0', borderRadius: '15px', marginBottom: '10px' }}></div>
                                    <div className="skeleton" style={{ width: '100%', height: '15px', backgroundColor: '#e0e0e0', borderRadius: '4px', marginBottom: '5px' }}></div>
                                    <div className="skeleton" style={{ width: '70%', height: '12px', backgroundColor: '#e0e0e0', borderRadius: '4px' }}></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Skeleton for Trending Videos */}
                    <div className="title-container">
                        <div className="skeleton" style={{ width: '220px', height: '30px', backgroundColor: '#e0e0e0', borderRadius: '4px', marginTop: '20px' }}></div>
                    </div>
                    <div style={{ width: '95%', margin: '1rem auto' }}>
                        {[...Array(5)].map((_, index) => (
                            <div key={index} style={{ display: 'flex', gap: '15px', marginBottom: '20px', backgroundColor: 'var(--primary-color)', borderRadius: '20px', padding: '15px' }}>
                                <div className="skeleton" style={{ width: '60px', height: '60px', backgroundColor: '#e0e0e0', borderRadius: '10px', flexShrink: 0 }}></div>
                                <div className="skeleton" style={{ width: '280px', aspectRatio: '16/9', backgroundColor: '#e0e0e0', borderRadius: '15px', flexShrink: 0 }}></div>
                                <div style={{ flex: 1 }}>
                                    <div className="skeleton" style={{ width: '80%', height: '24px', backgroundColor: '#e0e0e0', borderRadius: '4px', marginBottom: '10px' }}></div>
                                    <div className="skeleton" style={{ width: '100%', height: '16px', backgroundColor: '#e0e0e0', borderRadius: '4px', marginBottom: '5px' }}></div>
                                    <div className="skeleton" style={{ width: '100%', height: '16px', backgroundColor: '#e0e0e0', borderRadius: '4px', marginBottom: '5px' }}></div>
                                    <div className="skeleton" style={{ width: '40%', height: '14px', backgroundColor: '#e0e0e0', borderRadius: '4px' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Footer footer="footer"></Footer>
                </main>
            </>
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
                <Footer footer="footer"></Footer>
            </main>
        </>
    );
}

export default Trending;
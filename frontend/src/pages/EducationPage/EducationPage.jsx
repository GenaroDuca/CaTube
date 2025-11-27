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
// IMPORTANTE: Asegúrate de importar el componente Loader
import Loader from '../../components/common/Loader';


function Education() {
    const shortsRef = useRef(null);
    const [shorts, setShorts] = useState([]);
    const videosRef = useRef(null); // No usado, se puede remover
    const [videos, setVideos] = useState([]);

    // 1. Agregar el estado de carga y error
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = getAuthToken();

    useEffect(() => {
        const fetchVideos = async () => {
            setLoading(true); // Iniciar la carga
            setError(null);

            try {
                const response = await fetch(`${VITE_API_URL}/videos/education`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Error al obtener videos: ${response.statusText}`);
                }

                const data = await response.json();

                // Separar y transformar los datos (Lógica original)
                const shortsList = data.filter(v => v.type === 'short');
                const transformedShorts = shortsList.map(short => ({
                    type: short.type,
                    id: short.id,
                    nameshort: short.title,
                    shortviews: `${short.views || 0} views`,
                    thumbnail: ` ${short.thumbnail}`,
                    createdAt: short.createdAt,
                    description: short.description,
                }));

                const videosList = data.filter(v => v.type === 'video');
                const transformedVideos = videosList.map(video => ({
                    type: video.type,
                    id: video.id,
                    title: video.title,
                    videoviews: `${video.views || 0} views`,
                    thumbnail: ` ${video.thumbnail}`,
                    createdAt: video.createdAt,
                    description: video.description,
                }));

                setShorts(transformedShorts);
                setVideos(transformedVideos);

            } catch (err) {
                console.error('Error fetching videos:', err);
                setError(err);
                // Asegurar que los arrays estén vacíos en caso de error
                setShorts([]);
                setVideos([]);
            } finally {
                setLoading(false); // 2. Finalizar la carga
            }
        };

        fetchVideos();
    }, [token]);


    // 3. Renderizado Condicional del Loader
    if (loading) {
        return (
            // Usamos isOverlay={true} para que cubra toda la página mientras carga
            <div className="education-loading-container">
                <Loader isOverlay={true} />
            </div>
        );
    }

    // 4. Renderizado Condicional de Error
    if (error) {
        return (
            <div className="error-message">
                <Header />
                <Sidebar />
                <main className="main-content">
                    <h1>¡Ups! No se pudo cargar la sección Educación.</h1>
                    <p>Error: {error.message}</p>
                </main>
            </div>
        );
    }


    // 5. Renderizado del Contenido (cuando loading es false y no hay error)
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
                    // Si hay shorts, renderizar el carrusel
                    <SectionsCarousel
                        section="trending-shorts"
                        subtitle="Education Shorts"
                        ref={shortsRef}
                        render={shorts}
                        type="short"
                        cts="carousel-ctshorts"
                    />
                ) : (
                    // Si no hay shorts, mostrar un <Block> con el mensaje
                    <Block section="trending-shorts" subtitle="Education Shorts">
                        <p>No educational shorts found.</p>
                    </Block>
                )}

                {/* <Footer footer="footer"> </Footer> */}
            </main>
        </>
    );
}

export default Education;
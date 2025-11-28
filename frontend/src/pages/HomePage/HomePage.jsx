import './HomePage.css'
import '../../styles/Global_components.css'
import Sidebar from "../../components/common/Sidebar";
import VideosContainer from '../../components/homePageComponents/VideosContainer.jsx'
import SectionsCarousel from '../../components/homePageComponents/SectionsCarousel.jsx'
import TopSectionWrapper from '../../components/homePageComponents/TopSectionWrapper.jsx'
import OfficialSection from '../../components/homePageComponents/OfficialSection.jsx'
import Header from '../../components/common/header/Header.jsx'
import { useRef, useState, useEffect } from 'react';
import { getAuthToken } from "../../utils/auth";
import { VITE_API_URL } from '../../../config';
import resolveUrl from '../../utils/url';
import Loader from '../../components/common/Loader';

function Home() {
  const [channels, setChannels] = useState([]);
  const [recentChannels, setRecentChannels] = useState([]);
  const [videos, setVideos] = useState([]);
  const [shorts, setShorts] = useState([]);
  // El loading empieza en true
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const popularChannelsRef = useRef(null);
  const shortsRef = useRef(null);

  const token = getAuthToken();

  useEffect(() => {
    // 1. Funciones auxiliares para realizar las peticiones (ya no tienen el try/catch/finally)
    const fetchChannels = async () => {
      const response = await fetch(`${VITE_API_URL}/channels`);
      if (!response.ok) {
        throw new Error('Failed to fetch channels');
      }
      const data = await response.json();

      const transformedChannels = data.map(channel => ({
        name: channel.channel_name,
        subs: channel.subscriberCount,
          photo: channel.photoUrl?.startsWith('http') ? channel.photoUrl : resolveUrl(channel.photoUrl),
        url: channel.url,
        channel_date: channel.channel_date,
        handle: '@' + channel.url,
        user_type: channel.user?.user_type,
      }));

      // Retornamos los datos para ser usados fuera
      return transformedChannels;
    };

    const fetchVideos = async () => {
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${VITE_API_URL}/videos`, {
        method: 'GET',
        headers: headers,
      });
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }
      const data = await response.json();

      const videosOnly = data.filter(video => video.type === 'video');
      const transformedVideos = videosOnly.map(video => ({
        id: video.id,
        title: video.title,
        namevideo: video.title,
        videoviews: `${video.views || 0} views`,
        views: video.views || 0,
        thumbnail: `${video.thumbnail}`,
        channel: video.channel,
        channel_name: video.channel?.channel_name || 'Unknown',
        channel_date: video.channel_date,
        createdAt: video.createdAt,
      }));

      return transformedVideos;
    };

    const fetchShorts = async () => {
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${VITE_API_URL}/videos/shorts`, {
        method: 'GET',
        headers: headers,
      });
      if (!response.ok) {
        throw new Error('Failed to fetch shorts');
      }
      const data = await response.json();

      const transformedShorts = data.map(short => ({
        id: short.id,
        nameshort: short.title,
        shortviews: `${short.views || 0} views`,
        thumbnail: `${short.thumbnail}`,
        createdAt: short.createdAt,
      }));

      return transformedShorts;
    };

    // 2. Función principal que coordina todas las llamadas
    const fetchAllData = async () => {
      try {
        // Ejecuta todas las peticiones en paralelo
        const [channelsResult, videosResult, shortsResult] = await Promise.all([
          fetchChannels(),
          fetchVideos(),
          fetchShorts(),
        ]);

        // Manejar Canales
        const sortedBySubscribers = [...channelsResult].sort((a, b) => b.subs - a.subs);
        setChannels(sortedBySubscribers);

        const nonAdminChannels = channelsResult.filter(channel => channel.user_type !== 'admin');
        const sortedByDate = [...nonAdminChannels].sort((a, b) => {
          const dateA = new Date(a.channel_date);
          const dateB = new Date(b.channel_date);
          return dateB - dateA;
        });
        setRecentChannels(sortedByDate);

        // Manejar Videos y Shorts
        setVideos(videosResult);
        setShorts(shortsResult);

      } catch (err) {
        // Captura cualquier error de cualquiera de las peticiones
        console.error('Error fetching data:', err);
        setError(err);
        // Si hay error, asegura que se muestre el contenido con arrays vacíos
        setChannels([]);
        setRecentChannels([]);
        setVideos([]);
        setShorts([]);
      } finally {
        // Esto se ejecuta siempre, asegurando que el Loader se oculte
        setLoading(false);
      }
    };

    // Ejecutar la función coordinadora
    fetchAllData();

  }, [token]); // Dependencia del token

  // Renderizado del Loader
  if (loading) {
    return (
      // Asegura que el Loader se vea bien en el layout
      <div className="home-page-loading-container">
        <Loader isOverlay={true} />
      </div>
    );
  }

  // Renderizado de Error
  if (error) {
    return (
      <div className="error-message">
        <Header />
        <Sidebar />
        <main className="main-content">
          <h1>Ups! an error occurred</h1>
          <p>Please try again later. ({error.message})</p>
        </main>
      </div>
    );
  }

  // Renderizado del Contenido (cuando loading es false y no hay error)
  return (
    <>
      <Header />
      <Sidebar />
      <main className="main-content">
        <SectionsCarousel section="popular-channels" subtitle="Recent Channels" ref={popularChannelsRef} render={recentChannels} type="profile" cts="carousel-cts" />

        <SectionsCarousel section="trending" subtitle="Shorts" ref={shortsRef} render={shorts} type="short" cts="carousel-ctshorts" />

        <div className="official-channels-section-container">
          <TopSectionWrapper channels={channels} videos={videos} />
          <OfficialSection />
        </div>

        <VideosContainer />
      </main>
    </>
  )
}

export default Home;
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ShortCard from '../../components/shortPageComponents/ShortsCard';
import './shortsPage.css';
import Header from '../../components/common/header/Header';
import Sidebar from '../../components/common/Sidebar';
import Footer from '../../components/common/Footer';
import { getAuthToken } from '../../utils/auth';
import { VITE_API_URL } from '../../../config';
// IMPORTANTE: Asegúrate de importar el componente Loader
import Loader from '../../components/common/Loader';

export default function ShortPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [shorts, setShorts] = useState([]);
  // Usaremos el Loader genérico para esta carga
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [maximizedId, setMaximizedId] = useState(null);

  // ESTADO CENTRAL: ID del short que debe estar reproduciéndose
  const [activeShortId, setActiveShortId] = useState(null);

  const shortRefs = useRef({});
  const token = getAuthToken();

  // Función para incrementar vistas (se mantiene igual)
  const incrementView = async (videoId) => {
    const userId = localStorage.getItem('userId') || 'anonymous';
    const viewedVideosKey = `viewedVideos_${userId}`;
    const viewedVideos = JSON.parse(localStorage.getItem(viewedVideosKey) || '[]');

    if (!viewedVideos.includes(videoId)) {
      try {
        await fetch(`${VITE_API_URL}/videos/${videoId}/views`, {
          headers: { Authorization: `Bearer ${token}` },
          method: 'POST',
        });
        viewedVideos.push(videoId);
        localStorage.setItem(viewedVideosKey, JSON.stringify(viewedVideos));
      } catch (error) {
        console.error('Error incrementing views:', error);
      }
    }
  };

  // Lógica de Fetch de Shorts
  useEffect(() => {
    const fetchShorts = async () => {
      try {
        setLoading(true); // Iniciar carga
        setError(null);

        const response = await fetch(`${VITE_API_URL}/videos/shorts`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Error fetching shorts');

        const data = await response.json();

        const transformed = data.map((short) => ({
          id: short.id,
          videoSrc: `${short.url}`,
          title: short.title,
          description: short.description,
          channelName: short.channel?.channel_name || 'Unknown',
          channelAvatar: short.channel?.photoUrl,
          channelId: short.channel?.channel_id,
          channelUrl: short.channel?.url,
          likes: short.likes || 0,
          comments: short.comments || 0,
          dislikes: short.dislikes || 0,
          tags: short.tags,
          ownerId: short.channel?.user?.user_id,
          thumbnail: short.thumbnail
        }));


        if (id) {
          const index = transformed.findIndex((s) => String(s.id) === String(id));
          if (index !== -1) {
            const selected = transformed[index];
            transformed.splice(index, 1);
            transformed.unshift(selected);
          }
        }

        setShorts(transformed);

        // Si hay shorts, activamos inmediatamente el primero
        if (transformed.length > 0) {
          const firstShortId = transformed[0].id;
          setActiveShortId(firstShortId);

          // También incrementamos la vista inicial aquí
          incrementView(firstShortId);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false); // Finalizar carga
      }
    };

    fetchShorts();
  }, [id, token]);

  // Lógica del IntersectionObserver para detectar y activar el video (sin cambios)
  useEffect(() => {
    if (shorts.length === 0) return;

    const getIdFromPath = () => window.location.pathname.split('/').pop();

    const updateUrlIfNeeded = (visibleId) => {
      const currentIdInUrl = getIdFromPath();
      if (visibleId && visibleId !== currentIdInUrl) {
        window.history.replaceState(null, '', `/shorts/${visibleId}`);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.65) {
            const visibleId = entry.target.getAttribute('data-id');

            // ACTUALIZA EL ESTADO CENTRAL: Pausa el anterior y activa este.
            if (activeShortId !== visibleId) {
              setActiveShortId(visibleId);
            }

            // Lógica de URL
            updateUrlIfNeeded(visibleId);
          }
        });
      },
      { threshold: [0.65] }
    );

    Object.values(shortRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [shorts, activeShortId]);

  // Función de Callback para ShortCard (sin cambios)
  const handleVideoActive = (shortId) => {
    if (activeShortId !== shortId) {
      setActiveShortId(shortId);

      // Si se activa por callback, actualizamos la URL y sumamos vista
      const currentIdInUrl = window.location.pathname.split('/').pop();
      if (shortId && shortId !== currentIdInUrl) {
        window.history.replaceState(null, '', `/shorts/${shortId}`);
      }
      incrementView(shortId);
    }
  };

  const handleMaximize = (shortId) => {
    setMaximizedId((prev) => (prev === shortId ? null : shortId));
  };

  // Bloquear el scroll cuando se maximiza un short (sin cambios)
  useEffect(() => {
    if (maximizedId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [maximizedId]);

  // ===================================
  // RENDERIZADO CONDICIONAL DE CARGA/ERROR
  // ===================================
  if (loading) {
    return (
      <>
        <Header />
        <Sidebar />
        <main className="main-content">
          {/* Usamos el Loader genérico en modo Overlay */}
          <Loader isOverlay={true} />
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <Sidebar />
        <main className="main-content">
          <div className="shortpage-error">
            <h1>Error al cargar los Shorts</h1>
            <p>{error.message}</p>
            <button onClick={() => window.location.reload()}>Recargar Página</button>
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
        <div className="container-short-principal">
          {shorts.map((short) => (
            <div
              key={short.id}
              data-id={short.id}
              ref={(el) => (shortRefs.current[short.id] = el)}
            >
              <ShortCard
                short={short}
                isMaximized={maximizedId === short.id}
                onToggleMaximize={() => handleMaximize(short.id)}
                isActive={activeShortId === short.id}
                onVideoActive={handleVideoActive}
              />
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
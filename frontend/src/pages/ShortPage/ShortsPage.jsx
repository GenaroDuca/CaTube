import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ShortCard from '../../components/shortPageComponents/ShortsCard';
import './shortsPage.css';
import Header from '../../components/common/header/Header';
import Sidebar from '../../components/common/Sidebar';
import Footer from '../../components/common/Footer';
import { getAuthToken } from '../../utils/auth';
import { VITE_API_URL } from '../../../config';

export default function ShortPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [shorts, setShorts] = useState([]);
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

  // Lógica de Fetch de Shorts (CORRECCIÓN DE INICIALIZACIÓN AQUÍ)
  useEffect(() => {
    const fetchShorts = async () => {
      try {
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
          thumbnail: short.thumbnail // Also adding thumbnail just in case
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

        // 🚀 CORRECCIÓN: Si hay shorts, activamos inmediatamente el primero
        if (transformed.length > 0) {
          const firstShortId = transformed[0].id;
          setActiveShortId(firstShortId);

          // También incrementamos la vista inicial aquí
          incrementView(firstShortId);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchShorts();
  }, [id, token]);

  // Lógica del IntersectionObserver para detectar y activar el video
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

            // 🚀 ACTUALIZA EL ESTADO CENTRAL: Pausa el anterior y activa este.
            if (activeShortId !== visibleId) {
              setActiveShortId(visibleId);
            }

            // Lógica de URL y Vistas
            updateUrlIfNeeded(visibleId);
            // Ya no llamamos a incrementView aquí, ya que se llama en handleVideoActive o en la inicialización

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

  // Función de Callback para ShortCard (la usa el ShortCard para notificarnos)
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

  // Bloquear el scroll cuando se maximiza un short
  useEffect(() => {
    if (maximizedId) {
      // Bloquear scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restaurar scroll
      document.body.style.overflow = 'auto';
    }

    // Cleanup: Asegurar que el scroll se restaura al desmontar el componente
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [maximizedId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

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
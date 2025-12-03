import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ShortCard from '../../components/shortPageComponents/ShortsCard';
import './shortsPage.css';
import Header from '../../components/common/header/Header';
import Sidebar from '../../components/common/Sidebar';
import Footer from '../../components/common/Footer';
import { getAuthToken, getMyUserId } from '../../utils/auth';
import { VITE_API_URL } from '../../../config';
import Loader from '../../components/common/Loader';
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

export default function ShortPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [maximizedId, setMaximizedId] = useState(null);
  const [activeShortId, setActiveShortId] = useState(null);

  const shortRefs = useRef({});
  const lastHistoryShortRef = useRef(null); // Para evitar duplicados en historial
  const token = getAuthToken();

  // Función para incrementar vistas y agregar al historial
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

    // Agregar al historial (siempre, para actualizar timestamp)
    if (token && userId !== 'anonymous') {
      try {
        const myId = getMyUserId();
        // Solo agregar si es un short diferente al último agregado
        if (myId && lastHistoryShortRef.current !== videoId) {
          lastHistoryShortRef.current = videoId; // Marcar como agregado
          await fetch(`${VITE_API_URL}/users/${myId}/history`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ videoId })
          });
        }
      } catch (err) {
        console.error('Error adding short to history:', err);
      }
    }
  };

  // Lógica de Fetch de Shorts
  useEffect(() => {
    const fetchShorts = async () => {
      try {
        setLoading(true);
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

        if (transformed.length > 0) {
          const firstShortId = transformed[0].id;
          setActiveShortId(firstShortId);
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

  // Lógica del IntersectionObserver - AHORA GUARDA EN HISTORIAL AL HACER SCROLL
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

            if (activeShortId !== visibleId) {
              setActiveShortId(visibleId);
              // ✅ AGREGAR AL HISTORIAL CUANDO SE VUELVE VISIBLE POR SCROLL
              incrementView(visibleId);
            }

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

  const handleScroll = (direction) => {
    if (shorts.length === 0) return;

    const currentIndex = shorts.findIndex(s => String(s.id) === String(activeShortId));

    const safeIndex = currentIndex === -1 ? 0 : currentIndex;

    let nextIndex = safeIndex;
    if (direction === 'next') {
      nextIndex = Math.min(shorts.length - 1, safeIndex + 1);
    } else {
      nextIndex = Math.max(0, safeIndex - 1);
    }

    if (nextIndex !== safeIndex || currentIndex === -1) {
      const nextShortId = shorts[nextIndex].id;
      const element = shortRefs.current[nextShortId];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Lógica de navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (shorts.length === 0) return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleScroll('prev');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleScroll('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shorts, activeShortId]);

  // Función de Callback para ShortCard
  const handleVideoActive = (shortId) => {
    if (activeShortId !== shortId) {
      setActiveShortId(shortId);

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
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [maximizedId]);

  if (loading) {
    return (
      <>
        <Header />
        <Sidebar />
        <main className="main-content shortpage">
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
        <main className="main-content shortpage">
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
    <div className="short-page-wrapper">
      <Header />
      <Sidebar />

      <main className="main-content shortpage">
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

        <div className="short-nav-buttons">
          <button className="nav-btn-up" onClick={() => handleScroll('prev')} aria-label="Previous Short">
            <FaArrowUp size={20} />
          </button>
          <button className="nav-btn-down" onClick={() => handleScroll('next')} aria-label="Next Short">
            <FaArrowDown size={20} />
          </button>
        </div>
      </main>
    </div>
  );
}
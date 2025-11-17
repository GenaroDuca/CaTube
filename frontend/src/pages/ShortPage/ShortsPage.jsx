import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ShortCard from '../../components/shortPageComponents/ShortsCard';
import './shortsPage.css';
import Header from '../../components/common/header/Header';
import Sidebar from '../../components/common/Sidebar';
import Footer from '../../components/common/Footer';
import { getAuthToken } from '../../utils/auth';

export default function ShortPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [maximizedId, setMaximizedId] = useState(null);

  const shortRefs = useRef({});
  const token = getAuthToken();

  useEffect(() => {
    const fetchShorts = async () => {
      try {
        const response = await fetch('http://localhost:3000/videos/shorts', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Error fetching shorts');

        const data = await response.json();

        const transformed = data.map((short) => ({
          id: short.id,
          videoSrc: `http://localhost:3000${short.url}`,
          title: short.title,
          description: short.description,
          channelName: short.channel?.channel_name || 'Unknown',
          channelAvatar: short.channel?.photoUrl,
          likes: short.likes || 0,
          comments: short.comments || 0,
          dislikes: short.dislikes || 0,
          tags: short.tags,
        }));

        // Si entrás en /shorts/:id → mover ese short al principio
        if (id) {
          const index = transformed.findIndex((s) => String(s.id) === String(id));
          if (index !== -1) {
            const selected = transformed[index];
            transformed.splice(index, 1);
            transformed.unshift(selected);
          }
        }

        setShorts(transformed);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchShorts();
  }, [id, token]);

  // Actualizar la URL según el short visible
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
            updateUrlIfNeeded(visibleId);
          }
        });
      },
      { threshold: [0.65] }
    );

    Object.values(shortRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    // Detección inicial del primer short
    const firstRef = shortRefs.current[shorts[0].id];
    if (firstRef) {
      const visibleId = firstRef.getAttribute('data-id');
      updateUrlIfNeeded(visibleId);
    }

    return () => observer.disconnect();
  }, [shorts]);


  const handleMaximize = (shortId) => {
    setMaximizedId((prev) => (prev === shortId ? null : shortId));
  };

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
              />
            </div>
          ))}
        </div>

        <Footer footer="footer" />
      </main>
    </>
  );
}

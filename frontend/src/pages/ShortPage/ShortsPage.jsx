import React, { useState, useEffect } from 'react'
import ShortCard from '../../components/shortPageComponents/ShortsCard'
import './shortsPage.css'
import Header from '../../components/common/header/Header';
import Sidebar from '../../components/common/Sidebar';
import Footer from '../../components/common/Footer';

export default function ShortPage() {
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [maximizedId, setMaximizedId] = useState(null)

  useEffect(() => {
    const fetchShorts = async () => {
      try {
        const response = await fetch('http://localhost:3000/videos/shorts');
        if (!response.ok) {
          throw new Error('Failed to fetch shorts');
        }
        const data = await response.json();
        // Transform shorts to match ShortCard component props
        const transformedShorts = data.map(short => {
          // Normalize channel photo URL:
          // - /uploads/... => backend host
          // - /assets/images/profile/... => keep as-is (served by frontend)
          // - /default-avatar/X.png => map to /assets/images/profile/X.png
          // - other absolute paths starting with / => assume backend uploads and prefix
          let channelPhotoUrl = null;
          const rawPhoto = short.channel?.photoUrl;
          if (rawPhoto && rawPhoto.trim() !== '') {
            if (rawPhoto.startsWith('/uploads/')) {
              channelPhotoUrl = `http://localhost:3000${rawPhoto}`;
            } else if (rawPhoto.startsWith('/assets/images/profile/')) {
              channelPhotoUrl = rawPhoto;
            } else if (rawPhoto.startsWith('/default-avatar/')) {
              const letterMatch = rawPhoto.match(/\/default-avatar\/([A-Z])\.png/);
              const letter = letterMatch ? letterMatch[1] : (short.channel?.channel_name?.charAt(0).toUpperCase() || 'A');
              channelPhotoUrl = `/assets/images/profile/${letter}.png`;
            } else if (rawPhoto.startsWith('/')) {
              // fallback: likely uploaded path
              channelPhotoUrl = `http://localhost:3000${rawPhoto}`;
            } else {
              channelPhotoUrl = rawPhoto;
            }
          } else {
            // default avatar based on channel name first letter
            const firstLetter = short.channel?.channel_name?.charAt(0).toUpperCase() || 'A';
            channelPhotoUrl = `/assets/images/profile/${firstLetter}.png`;
          }

          return {
            id: short.id,
            videoSrc: `http://localhost:3000${short.url}`,
            channelAvatar: channelPhotoUrl,
            channelName: short.channel?.channel_name || 'Unknown',
            channelId: short.channel?.channel_id,
            channelUrl: short.channel?.url,
            description: short.description || '',
            title: short.title,
            isOwner: false,
            isSubscribed: false,
            likes: short.likes || 0,
            comments: short.comments || 0,
            dislikes: short.dislikes || 0,
          };
        });
        setShorts(transformedShorts);
      } catch (err) {
        console.error('Error fetching shorts:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchShorts();
  }, []);

  function handleMaximize(id) {
    setMaximizedId(id)
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <>
      <Header></Header>
      <Sidebar></Sidebar>
      <main className="main-content">
        <div className="container-short-principal" aria-live="polite">
          {shorts.map((s) => (
            <ShortCard
              key={s.id}
              short={s}
              isMaximized={maximizedId === s.id}
              onToggleMaximize={() => handleMaximize(maximizedId === s.id ? null : s.id)}
            />
          ))}
        </div>
        <Footer footer="footer"></Footer>

      </main>
    </>
  )
}

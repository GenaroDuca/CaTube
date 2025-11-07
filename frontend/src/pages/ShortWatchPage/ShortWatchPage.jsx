import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ShortCard from '../../components/shortPageComponents/ShortsCard'
import './ShortWatchPage.css'
import Header from '../../components/common/header/Header';
import Sidebar from '../../components/common/Sidebar';
import Footer from '../../components/common/Footer';

export default function ShortWatchPage() {
  const [short, setShort] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMaximized, setIsMaximized] = useState(false);

  const { id } = useParams();

  useEffect(() => {
    const fetchShort = async () => {
      try {
        const response = await fetch(`http://localhost:3000/videos/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch short');
        }
        const data = await response.json();

        // Verificar que sea un short
        if (data.type !== 'short') {
          throw new Error('Not a short');
        }

        // Normalize channel photo URL:
        // - /uploads/... => backend host
        // - /assets/images/profile/... => keep as-is (served by frontend)
        // - /default-avatar/X.png => map to /assets/images/profile/X.png
        // - other absolute paths starting with / => assume backend uploads and prefix
        let channelPhotoUrl = null;
        const rawPhoto = data.channel?.photoUrl;
        if (rawPhoto && rawPhoto.trim() !== '') {
          if (rawPhoto.startsWith('/uploads/')) {
            channelPhotoUrl = `http://localhost:3000${rawPhoto}`;
          } else if (rawPhoto.startsWith('/assets/images/profile/')) {
            channelPhotoUrl = rawPhoto;
          } else if (rawPhoto.startsWith('/default-avatar/')) {
            const letterMatch = rawPhoto.match(/\/default-avatar\/([A-Z])\.png/);
            const letter = letterMatch ? letterMatch[1] : (data.channel?.channel_name?.charAt(0).toUpperCase() || 'A');
            channelPhotoUrl = `/assets/images/profile/${letter}.png`;
          } else if (rawPhoto.startsWith('/')) {
            // fallback: likely uploaded path
            channelPhotoUrl = `http://localhost:3000${rawPhoto}`;
          } else {
            channelPhotoUrl = rawPhoto;
          }
        } else {
          // default avatar based on channel name first letter
          const firstLetter = data.channel?.channel_name?.charAt(0).toUpperCase() || 'A';
          channelPhotoUrl = `/assets/images/profile/${firstLetter}.png`;
        }

        // Transform short to match ShortCard component props
        const transformedShort = {
          id: data.id,
          videoSrc: `http://localhost:3000${data.url}`,
          channelAvatar: channelPhotoUrl,
          channelName: data.channel?.channel_name || 'Unknown',
          channelId: data.channel?.channel_id,
          channelUrl: data.channel?.url,
          description: data.description || '',
          title: data.title,
          isOwner: false,
          isSubscribed: false,
          likes: data.likes || 0,
          comments: data.comments || 0,
          dislikes: data.dislikes || 0,
        };
        setShort(transformedShort);
      } catch (err) {
        console.error('Error fetching short:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchShort();
    }
  }, [id]);

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
          {short && (
            <ShortCard
              key={short.id}
              short={short}
              isMaximized={isMaximized}
              onToggleMaximize={() => setIsMaximized(!isMaximized)}
            />
          )}
        </div>
        <Footer footer="footer"></Footer>
      </main>
    </>
  )
}

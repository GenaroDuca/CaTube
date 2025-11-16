import { useState, useMemo, useEffect } from 'react'
import { useParams } from 'react-router-dom'

//Components
import Header from '../../components/common/header/Header.jsx'
import WatchVideo from '../../components/videoPageComponents/WatchVideo.jsx';
import Sidebar from '../../components/common/Sidebar.jsx';

//Styles
import './VideoPage.css';

//Assets
import Yukki from '../../assets/images/profile/yukki.jpg'
import Video from '../../assets/videos/channel-video-proof.mp4'
import thumbnail from '../../assets/images/thumbnails/pinterest_swap_challenge.jpg'
import Gena from '../../assets/images/profile/gena.jpg'
import Jere from '../../assets/images/profile/jere.jpg'
import { VideoList } from '../../components/videoPageComponents/VideoList.jsx';
import { getAuthToken } from '../../utils/auth.js';

export function VideoPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const token = getAuthToken();

    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, []);

    // Cargar video por id desde la ruta /watch/:id
    const { id } = useParams();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchVideo() {
            if (!id) {
                setVideo({
                    url: Video,
                    title: 'Pinterest Swap Challenge',
                    avatar: Yukki,
                    userName: "Yukki",
                    description: 'Video de ejemplo',
                });
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const res = await fetch(`http://localhost:3000/videos/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!res.ok) throw new Error('Video not found');
                const data = await res.json();

                const fileUrl = data.url && data.url.startsWith('/') ? `http://localhost:3000${data.url}` : data.url;
                const thumbnailUrl = data.thumbnail && data.thumbnail.startsWith('/') ? `http://localhost:3000${data.thumbnail}` : data.thumbnail;

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

                // Formatear el número de suscriptores
                const formatSubscriptions = (count) => {
                    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
                    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
                    return count.toString();
                };

                setVideo({
                    url: fileUrl,
                    title: data.title,
                    avatar: channelPhotoUrl || Yukki,
                    userName: data.channel?.channel_name || 'Unknown',
                    description: data.description || '',
                    channelId: data.channel?.channel_id,
                    subscriptions: data.channel?.subscriberCount || 0,
                    tags: data.tags
                });

            } catch (err) {
                console.error('Error fetching video:', err);
                setVideo({
                    url: Video,
                    title: 'Video no encontrado',
                    avatar: Yukki,
                    userName: 'Unknown',
                    description: '',
                });
            } finally {
                setLoading(false);
            }
        }

        fetchVideo();
    }, [id]);

    return (
        <>
            <Header
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />
            <Sidebar>
            </Sidebar>
            <main className="main-content">


                <div className="container-all">
                    {loading ? <p>Loading video...</p> : <WatchVideo {...video} />}
                    <VideoList currentVideoId={id} />
                </div>
            </main>
        </>

    );
}
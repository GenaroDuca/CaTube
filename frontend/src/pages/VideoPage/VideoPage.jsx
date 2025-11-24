import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

//Components
import Header from '../../components/common/header/Header.jsx'
import WatchVideo from '../../components/videoPageComponents/WatchVideo.jsx';
import Sidebar from '../../components/common/Sidebar.jsx';

//Styles
import './VideoPage.css';

//Assets
import Yukki from '../../assets/images/profile/yukki.jpg'
import Video from '../../assets/videos/channel-video-proof.mp4'
import { VideoList } from '../../components/videoPageComponents/VideoList.jsx';
import { getAuthToken } from '../../utils/auth.js';
import Footer from '../../components/common/Footer.jsx';

import { VITE_API_URL } from '../../../config';

export function VideoPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const token = getAuthToken();

    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, []);

    const { id } = useParams();
    const navigate = useNavigate();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [videoList, setVideoList] = useState([]);

    // Fetch de la lista de videos para navegación
    useEffect(() => {
        async function fetchVideoList() {
            try {
                const res = await fetch(`${VITE_API_URL}/videos`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    // Filtrar shorts para que no aparezcan en la navegación
                    const regularVideos = data.filter(v => v.type !== 'short');
                    setVideoList(regularVideos);
                }
            } catch (error) {
                console.error("Error fetching video list:", error);
            }
        }
        fetchVideoList();
    }, [token]);

    // Calcular siguiente y anterior
    const { nextVideoId, prevVideoId } = useMemo(() => {
        // videoList ya está filtrado (sin shorts)
        if (!videoList.length || !id) return { nextVideoId: null, prevVideoId: null };

        const currentIndex = videoList.findIndex(v => v.id === id);

        // Si el video actual no está en la lista (ej: es un short al que se accedió directamente), no hay next/prev
        if (currentIndex === -1) return { nextVideoId: null, prevVideoId: null };

        const prev = currentIndex > 0 ? videoList[currentIndex - 1].id : null;
        const next = currentIndex < videoList.length - 1 ? videoList[currentIndex + 1].id : null;

        return { nextVideoId: next, prevVideoId: prev };
    }, [videoList, id]);

    const handleNextVideo = () => {
        if (nextVideoId) navigate(`/watch/${nextVideoId}`);
    };

    const handlePrevVideo = () => {
        if (prevVideoId) navigate(`/watch/${prevVideoId}`);
    };

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
                const res = await fetch(`${VITE_API_URL}/videos/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!res.ok) throw new Error('Video not found');
                const data = await res.json();

                const fileUrl = data.url && data.url.startsWith('/') ? `${VITE_API_URL}${data.url}` : data.url;
                const thumbnailUrl = data.thumbnail && data.thumbnail.startsWith('/') ? `${VITE_API_URL}${data.thumbnail}` : data.thumbnail;

                let channelPhotoUrl = null;
                const rawPhoto = data.channel?.photoUrl;
                if (rawPhoto && rawPhoto.trim() !== '') {
                    if (rawPhoto.startsWith('/uploads/')) {
                        channelPhotoUrl = `${VITE_API_URL}${rawPhoto}`;
                    } else if (rawPhoto.startsWith('/assets/images/profile/')) {
                        channelPhotoUrl = rawPhoto;
                    } else if (rawPhoto.startsWith('/default-avatar/')) {
                        const letterMatch = rawPhoto.match(/\/default-avatar\/([A-Z])\.png/);
                        const letter = letterMatch ? letterMatch[1] : (data.channel?.channel_name?.charAt(0).toUpperCase() || 'A');
                        channelPhotoUrl = `/assets/images/profile/${letter}.png`;
                    } else if (rawPhoto.startsWith('/')) {
                        channelPhotoUrl = `${VITE_API_URL}${rawPhoto}`;
                    } else {
                        channelPhotoUrl = rawPhoto;
                    }
                } else {
                    const firstLetter = data.channel?.channel_name?.charAt(0).toUpperCase() || 'A';
                    channelPhotoUrl = `/assets/images/profile/${firstLetter}.png`;
                }

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
                    channelUrl: data.channel?.url || '',
                    tags: data.tags,
                    views: data.views,
                    ownerId: data.channel?.user?.user_id,
                    thumbnail: thumbnailUrl
                });

                // --------------------------------------------------------
                // IMPLEMENTACIÓN DE VISTAS 
                // --------------------------------------------------------
                const userId = localStorage.getItem('userId') || 'anonymous';
                const viewedVideosKey = `viewedVideos_${userId}`;
                const viewedVideos = JSON.parse(localStorage.getItem(viewedVideosKey) || '[]');

                if (!viewedVideos.includes(id)) {
                    try {
                        await fetch(`${VITE_API_URL}/videos/${id}/views`, {
                            headers: { Authorization: `Bearer ${token}` },
                            method: 'POST',
                        });

                        viewedVideos.push(id);
                        localStorage.setItem(viewedVideosKey, JSON.stringify(viewedVideos));
                        // console.log('Views incremented successfully');
                    } catch (error) {
                        console.error('Error incrementing views:', error);
                    }
                }
                // --------------------------------------------------------

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
            <Sidebar></Sidebar>
            <main className="main-content">

                <div className="container-all">
                    {loading ? <p>Loading video...</p> : (
                        <WatchVideo
                            {...video}
                            videoId={id}
                            onNext={handleNextVideo}
                            onPrev={handlePrevVideo}
                            hasNext={!!nextVideoId}
                            hasPrev={!!prevVideoId}
                        />
                    )}
                    <VideoList currentVideoId={id} videos={videoList} />
                </div>

            </main>
            {/* <Footer> </Footer> */}
        </>
    );
}

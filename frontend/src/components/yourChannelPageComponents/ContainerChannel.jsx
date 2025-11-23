import { useState, useEffect } from 'react';
import { getAuthToken } from '../../utils/auth';
import { VITE_API_URL } from '../../../config';

function ContainerChannel({ channelId }) {
    const [featuredVideo, setFeaturedVideo] = useState(null);
    const token = getAuthToken();

    useEffect(() => {
        async function fetchFeaturedVideo() {
            if (!channelId) return;

            try {
                const response = await fetch(`${VITE_API_URL}/videos/channel/${channelId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const videos = await response.json();
                    // Por ahora usamos el video más reciente como video principal
                    // En el futuro esto se puede cambiar por el video con más vistas
                    const mainVideo = videos
                        .filter(v => v.type === "video" || !v.type)
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

                    if (mainVideo) {
                        const createdAt = new Date(mainVideo.createdAt);
                        const timeAgo = getTimeAgo(createdAt);

                        setFeaturedVideo({
                            src: mainVideo.thumbnail,
                            name: mainVideo.title,
                            views: '0 views', // Se actualizará cuando se implemente el conteo de vistas
                            time: timeAgo,
                            description: mainVideo.description,
                            id: mainVideo.id
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching featured video:', error);
            }
        }

        fetchFeaturedVideo();
    }, [channelId]);

    // Función helper para calcular tiempo transcurrido
    function getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        
        return Math.floor(seconds) + " seconds ago";
    }

    if (!featuredVideo) {
        return null; // No mostrar nada si no hay videos
    }

    return (
        <div className="container-channel">
            <div className="principal-video-container">
                <div className="principal-video">
                    <a href={`/watch/${featuredVideo.id}`}>
                        <img 
                            className="principal-video" 
                            src={`${featuredVideo.src}`} 
                            alt={featuredVideo.name}
                        />
                    </a>
                </div>
                <div className="text-principal-video">
                    <h2>{featuredVideo.name}</h2>
                    <div className="row-principal">
                        <p className="space">{featuredVideo.views}</p>
                        <p className="space">{featuredVideo.time}</p>
                    </div>
                    <p>{featuredVideo.description}</p>
                </div>
            </div>
        </div>
    );
}

export default ContainerChannel;
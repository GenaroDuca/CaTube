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
                            views: mainVideo.views,
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
    function getTimeAgo(dateInput) {
        const date = new Date(dateInput);

        const msDifference = Math.abs(new Date() - date);
        const seconds = Math.floor(msDifference / 1000);

        let interval = seconds / 31536000;
        if (interval >= 1) {
            const time = Math.floor(interval);
            const unit = time === 1 ? "year" : "years";
            return `${time} ${unit} ago`;
        }

        interval = seconds / 2592000;
        if (interval >= 1) {
            const time = Math.floor(interval);
            const unit = time === 1 ? "month" : "months";
            return `${time} ${unit} ago`;
        }

        interval = seconds / 86400;
        if (interval >= 1) {
            const time = Math.floor(interval);
            const unit = time === 1 ? "day" : "days";
            return `${time} ${unit} ago`;
        }

        interval = seconds / 3600;
        if (interval >= 1) {
            const time = Math.floor(interval);
            const unit = time === 1 ? "hour" : "hours";
            return `${time} ${unit} ago`;
        }

        interval = seconds / 60;
        if (interval >= 1) {
            const time = Math.floor(interval);
            const unit = time === 1 ? "minute" : "minutes";
            return `${time} ${unit} ago`;
        }

        // If less than 60 seconds
        const time = Math.floor(seconds);
        // Note: It's common to use "just now" for very small time differences (e.g., < 5s)
        if (time < 5) {
            return "just now";
        }
        const unit = time === 1 ? "second" : "seconds";
        return `${time} ${unit} ago`;
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
                    <div>
                        <h3>Description</h3>
                        <p>{featuredVideo.description}</p>
                    </div>
                    <div className="row-principal">
                        <p className="space">{featuredVideo.views} views</p>
                        <p className="space" style={{ color: '#90b484' }}>{featuredVideo.time}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ContainerChannel;
import { Link } from 'react-router-dom';
import { VITE_API_URL } from '../../../config';

function getTimeAgo(dateInput) {
    const date = new Date(dateInput);
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

function VideoCard({ video }) {
    // Handle thumbnail URL properly
    let thumbnailSrc = video.thumbnail || '';
    if (thumbnailSrc && !thumbnailSrc.startsWith('http')) {
        thumbnailSrc = `${VITE_API_URL}${thumbnailSrc}`;
    }

    return (
        // Utilizamos un div contenedor si Link no es el elemento más externo, 
        // o envolvemos la Link si queremos que toda la tarjeta sea cliqueable.
        // Asumiendo que quieres el número FUERA del link (como en YouTube Trending)

        <div className="trending-video-wrapper">
            {/* 1. NÚMERO DE POSICIÓN */}
            {/* Usamos el valor 'position' que viene del componente Trending.jsx */}
            <div className="trending-position-number">
                #{video.position}
            </div>

            {/* 2. CARD CLICKEABLE */}
            <Link className="trending-video-card" to={`/watch/${video.id}`}>
                {/* Reestructura el contenido dentro de Link para que el número quede fuera */}

                <img src={thumbnailSrc} alt={video.title} />

                <div className="trending-video-info">
                    <h3>{video.title}</h3>
                    <p>{video.description}</p>
                    <div>
                        <p>{video.videoviews}</p>
                        <p style={{ color: 'var(--btn)' }}>{getTimeAgo(video.createdAt)}</p>
                    </div>
                </div>
            </Link>
        </div>
    );
}

export default VideoCard;
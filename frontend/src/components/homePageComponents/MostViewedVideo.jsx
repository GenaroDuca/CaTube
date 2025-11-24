import './MostViewedVideo.css';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

function MostViewedVideo({ video }) {
    if (!video) {
        return null;
    }

    const formatViews = (views) => {
        if (views >= 1000000) {
            return `${(views / 1000000).toFixed(1)}M`;
        } else if (views >= 1000) {
            return `${(views / 1000).toFixed(1)}K`;
        }
        return views;
    };

    const timeAgo = video.createdAt
        ? formatDistanceToNow(new Date(video.createdAt), { addSuffix: true, locale: es })
        : '';

    return (
        <div className="most-viewed-container">
            <Link to={`/video/${video.id}`}>
                <img src={video.thumbnail} alt={video.title} />
                <div className="video-info">
                    <h3>{video.title}</h3>
                    <p>{video.channel.name}</p>
                    <p>{formatViews(video.views)} vistas</p>
                    <p>{timeAgo}</p>
                </div>
            </Link>
        </div>
    );
}

export default MostViewedVideo;

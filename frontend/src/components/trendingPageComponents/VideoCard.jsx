import { Link } from 'react-router-dom';

function VideoCard({ video }) {
    // Handle thumbnail URL properly
    let thumbnailSrc = video.thumbnail || '';
    if (thumbnailSrc && !thumbnailSrc.startsWith('http')) {
        thumbnailSrc = `http://localhost:3000${thumbnailSrc}`;
    }

    return (
        <Link className="trending-video-card" to={`/watch/${video.id}`}>
            <img src={thumbnailSrc} alt={video.title} />
            <div className="trending-video-info">
                <h4>{video.title}</h4>
                <p>{video.videoviews}</p>
            </div>
        </Link>
    );
}

export default VideoCard;

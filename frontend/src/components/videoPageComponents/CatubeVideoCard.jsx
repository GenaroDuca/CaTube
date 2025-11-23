//Styles
import './VideoCard.css'

//Router
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import { VITE_API_URL } from '../../../config';

function getTimeAgo(dateInput) {
        const date = new Date(dateInput); // Ensure dateInput is parsed into a Date object
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

export function CatubeVideoCard({ video }) {
    const { pathname } = useLocation();
    const isVideoPage = pathname.includes('/watch');

    if (!video || video.type === 'short') {
        return null;
    }

    const cardClassName = isVideoPage
        ? 'ct-videoCard-description watch'
        : 'ct-videoCard-description';

    return (
        <article className="ct-videoCard">
            <header className="ct-videoCard-header">
                <Link to={`/watch/${video.id}`}>
                    <img
                        className='ct-videoCard-thumbnail'
                        src={`${video.thumbnail}`}
                        alt="thumbnail"
                    />
                </Link>
            </header>

            <div className="ct-videoCard-info">
                <div className="ct-videoCard-infoVideo">
                    <Link to={`/watch/${video.id}`} className="ct-videoCard-title">{video.title}</Link>
                    <div>
                        <p>{video.views || 0} views </p>
                        <p style={{ color: 'var(--btn)' }}>{getTimeAgo(video.createdAt)}</p>
                    </div>
                </div>

                <div className="ct-videoCard-infoUser">
                    {video.channel && (
                        <Link to={`/yourchannel/${video.channel.url}`} className="ct-videoCard-user">
                            <img
                                className='ct-videoCard-avatar'
                                src={
                                    video.channel.photoUrl
                                        ? (video.channel.photoUrl.startsWith('/uploads/')
                                            ? `${VITE_API_URL}${video.channel.photoUrl}`
                                            : video.channel.photoUrl)
                                        : `/assets/images/profile/${video.channel.channel_name?.charAt(0).toUpperCase() || 'A'}.png`
                                }
                                alt="avatar del canal"
                            />
                            <h3 className="ct-videoCard-infoUserName">{video.channel.channel_name}</h3>
                        </Link>
                    )}
                    <p className={cardClassName}>{video.description}</p>
                </div>
            </div>
        </article>
    );
}

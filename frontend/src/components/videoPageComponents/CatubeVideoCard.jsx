//Styles
import './VideoCard.css'

//Router
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import { VITE_API_URL } from '../../../config';

export function CatubeVideoCard({ video }) {
    const { pathname } = useLocation();
    const isVideoPage = pathname.includes('/watch');

    // 🧠 Si no hay video o es un short, no renderiza nada
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
                        src={`${VITE_API_URL}${video.thumbnail}`}
                        alt="thumbnail"
                    />
                </Link>
            </header>

            <div className="ct-videoCard-info">
                <div className="ct-videoCard-infoVideo">
                    <h1 className="ct-videoCard-title">{video.title}</h1>
                    <p>{video.views || 0} views • {new Date(video.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="ct-videoCard-infoUser">
                    {video.channel && (
                        <div className="ct-videoCard-user">
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
                        </div>
                    )}
                    <p className={cardClassName}>{video.description}</p>
                </div>
            </div>
        </article>
    );
}

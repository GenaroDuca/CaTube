import { VITE_API_URL } from "../../../../config";
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

function CommentItem(props) {
    const [channelUrl, setChannelUrl] = useState(props.channelUrl || null);

    useEffect(() => {
        // If channelUrl is not provided but channelId is, fetch the channel URL
        if (!channelUrl && props.channelId) {
            const fetchChannelUrl = async () => {
                try {
                    const res = await fetch(`${VITE_API_URL}/channels/${props.channelId}`);
                    if (res.ok) {
                        const channelData = await res.json();
                        setChannelUrl(channelData.url);
                    }
                } catch (err) {
                    console.error('Error fetching channel URL for comment user:', err);
                }
            };
            fetchChannelUrl();
        }
    }, [channelUrl, props.channelId]);

    const getAvatar = (photoUrl, username) => {
        if (photoUrl && photoUrl.trim() !== '') {
            let photoPath = photoUrl;
            if (photoPath.startsWith('/uploads/')) {
                // Imagen subida por el usuario
                return VITE_API_URL + photoPath;
            } else if (photoPath.startsWith('/assets/images/profile/')) {
                // Imagen predeterminada ya mapeada
                return photoPath;
            } else if (photoPath.startsWith('/default-avatar/')) {
                // Map old default-avatar paths to new assets path
                const letterMatch = photoPath.match(/\/default-avatar\/([A-Z])\.png/);
                const letter = letterMatch ? letterMatch[1] : 'A';
                return `/assets/images/profile/${letter}.png`;
            } else {
                return photoPath;
            }
        } else {
            // Set default avatar based on first letter of username
            const firstLetter = username?.charAt(0).toUpperCase() || 'A';
            return `https://catube-uploads.s3.sa-east-1.amazonaws.com/profile/${firstLetter}.png`;
        }
    };

    const to = channelUrl ? `/yourchannel/${channelUrl}` : '#';
    const videoTo = props.videoType === 'short' ? `/shorts/${props.videoId}` : `/watch/${props.videoId}`;

    return (
        <div className="video-dashboard">
            <Link to={to}>
                <img className="userphoto-dashboard" src={getAvatar(props.userPhoto, props.username)} alt={props.username} />
            </Link>
            <div className="user">
                <p className="username-dashboard">{props.username}</p>
                <p className="user-message-dashboard">{props.message}</p>
            </div>
            <Link to={videoTo}>
                <img className="video-commented-dashboard" src={props.videoThumbnail} alt="Video thumbnail" />
            </Link>
        </div>
    );
}

export default CommentItem;

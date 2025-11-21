import Container from "../../common/Container";
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from "../../common/friendMenu/constants.js";
import { Link } from 'react-router-dom';

function VideoCommunity() {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getAvatar = (photoUrl, username) => {
        if (photoUrl && photoUrl.trim() !== '') {
            let photoPath = photoUrl;
            if (photoPath.startsWith('/uploads/')) {
                // Imagen subida por el usuario
                return API_BASE_URL + photoPath;
            } else if (photoPath.startsWith('/assets/images/profile/')) {
                // Imagen predeterminada ya mapeada
                return photoPath;
            } else if (photoPath.startsWith('/default-avatar/')) {
                // Map old default-avatar paths to new assets path
                const letterMatch = photoPath.match(/\/default-avatar\/([A-Z])\.png/);
                const letter = letterMatch ? letterMatch[1] : 'A';
                return `/assets/images/profile/${letter}.png`;
            } else {
                // Otro tipo de ruta, asumir que es subida
                return API_BASE_URL + photoPath;
            }
        } else {
            // Set default avatar based on first letter of username
            const firstLetter = username?.charAt(0).toUpperCase() || 'A';
            return `/assets/images/profile/${firstLetter}.png`;
        }
    };

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch(`${API_BASE_URL}/comment/user-comments?limit=10`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch comments');
                }
                const data = await response.json();
                setComments(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <>
            {comments.length > 0 ? comments.map(comment => {
                const to = comment.channelUrl ? `/yourchannel/${comment.channelUrl}` : '#';
                return (
                    <Container className="video-community" key={comment.id}>
                        <Container className="user-container">
                            <Link to={to}>
                                <img className="userphoto-community" src={getAvatar(comment.userPhoto, comment.username)} alt={comment.username}></img>
                            </Link>
                            <Container className="use-info-container">
                                <p className="username">{comment.username}</p>
                                <p className="user-message-community">{comment.message}</p>

                            </Container>
                        </Container>
                        <Container className="video">
                            <Link to={comment.videoType === 'short' ? `/shorts/${comment.videoId}` : `/watch/${comment.videoId}`}>
                                <img className="video-commented-community" src={`${API_BASE_URL}${comment.videoThumbnail}`} alt="Video thumbnail" />
                            </Link>
                            <p>{comment.title}</p>
                        </Container>
                    </Container>
                );
            }) : <p className="no-comments">No comments yet.</p>}
        </>
    );
}

export default VideoCommunity;
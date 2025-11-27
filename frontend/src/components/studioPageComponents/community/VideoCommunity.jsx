import Container from "../../common/Container";
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { VITE_API_URL } from "../../../../config";

function VideoCommunity({ channelId }) {
    const [activeTab, setActiveTab] = useState('comments');

    const [comments, setComments] = useState([]);
    const [catscribers, setCatscribers] = useState([]);
    const [likes, setLikes] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [limitComments, setLimitComments] = useState(10);
    const [limitCatscribers, setLimitCatscribers] = useState(10);
    const [limitLikes, setLimitLikes] = useState(10);

    const getAvatar = (photoUrl, username) => {
        if (photoUrl && photoUrl.trim() !== '') {
            let photoPath = photoUrl;
            if (photoPath.startsWith('/uploads/')) {
                return VITE_API_URL + photoPath;
            } else if (photoPath.startsWith('/assets/images/profile/')) {
                return photoPath;
            } else if (photoPath.startsWith('/default-avatar/')) {
                const letterMatch = photoPath.match(/\/default-avatar\/([A-Z])\.png/);
                const letter = letterMatch ? letterMatch[1] : 'A';
                return `/assets/images/profile/${letter}.png`;
            } else {
                return photoPath;
            }
        } else {
            const firstLetter = username?.charAt(0).toUpperCase() || 'A';
            return `https://catube-uploads.s3.sa-east-1.amazonaws.com/profile/${firstLetter}.png`;
        }
    };

    // Fetch Comments
    useEffect(() => {
        if (activeTab !== 'comments') return;
        const fetchComments = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch(`${VITE_API_URL}/comment/user-comments?limit=${limitComments}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Failed to fetch comments');
                const data = await response.json();
                setComments(data);
            } catch (err) { setError(err.message); } finally { setLoading(false); }
        };
        fetchComments();
    }, [activeTab, limitComments]);

    // Fetch Catscribers
    useEffect(() => {
        if (activeTab !== 'catscribers' || !channelId) return;
        const fetchCatscribers = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch(`${VITE_API_URL}/subscriptions/channel/${channelId}/recent?limit=${limitCatscribers}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Failed to fetch catscribers');
                const data = await response.json();
                setCatscribers(data);
            } catch (err) { setError(err.message); } finally { setLoading(false); }
        };
        fetchCatscribers();
    }, [activeTab, limitCatscribers, channelId]);

    // Fetch Likes
    useEffect(() => {
        if (activeTab !== 'likes') return;
        const fetchLikes = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch(`${VITE_API_URL}/likes/user/recent?limit=${limitLikes}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Failed to fetch likes');
                const data = await response.json();
                setLikes(data);
            } catch (err) { setError(err.message); } finally { setLoading(false); }
        };
        fetchLikes();
    }, [activeTab, limitLikes]);

    const handleLoadMore = () => {
        if (activeTab === 'comments') setLimitComments(prev => prev + 10);
        if (activeTab === 'catscribers') setLimitCatscribers(prev => prev + 10);
        if (activeTab === 'likes') setLimitLikes(prev => prev + 10);
    };

    const renderComments = () => (
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
                                <p className="username"><strong>{comment.username}</strong></p>
                                <p className="user-message-community">{comment.message}</p>
                            </Container>
                        </Container>
                        <Container className="video">
                            <Link to={comment.videoType === 'short' ? `/shorts/${comment.videoId}` : `/watch/${comment.videoId}`}>
                                <img
                                    className={comment.videoType === 'short' ? 'video-commented-community short' : 'video-commented-community'}
                                    src={comment.videoThumbnail}
                                    alt={comment.videoTitle}
                                />
                            </Link>
                        </Container>
                    </Container>
                );
            }) : <p className="no-comments">No comments yet.</p>}
            {comments.length >= limitComments && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <button className="btn-community" onClick={handleLoadMore}>Load More</button>
                </div>
            )}
        </>
    );

    const renderCatscribers = () => (
        <>
            {catscribers.length > 0 ? catscribers.map(sub => (
                <Container className="video-community" key={sub.id}>
                    <Container className="user-container">
                        <Link to={sub.channel ? `/yourchannel/${sub.channel.channel_id}` : '#'}>
                            <img className="userphoto-community" src={getAvatar(sub.channel?.photoUrl, sub.username)} alt={sub.username}></img>
                        </Link>
                        <Container className="use-info-container">
                            <p className="username"> <strong>{sub.username}</strong></p>
                            <p className="user-message-community">Catscriber since {new Date(sub.subscribedAt).toLocaleDateString()}</p>
                        </Container>
                    </Container>
                </Container>
            )) : <p className="no-comments">No catscribers yet.</p>}
            {catscribers.length >= limitCatscribers && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <button className="btn-community" onClick={handleLoadMore}>Load More</button>
                </div>
            )}
        </>
    );

    const renderLikes = () => (
        <>
            {likes.length > 0 ? likes.map(like => (
                <Container className="video-community" key={like.id}>
                    <Container className="user-container">
                        <Link to={`/yourchannel/${like.user.id}`}> {/* Assuming user id is channel id or similar, or just link to user profile if possible */}
                            <img className="userphoto-community" src={getAvatar(like.user.photoUrl, like.user.username)} alt={like.user.username}></img>
                        </Link>
                        <Container className="use-info-container">
                            <p className="username"><strong>{like.user.username}</strong></p>
                            <p className="user-message-community">Liked your video</p>
                        </Container>
                    </Container>
                    <Container className="video">
                        <Link to={like.video.type === 'short' ? `/shorts/${like.video.id}` : `/watch/${like.video.id}`}>
                            <img
                                className={like.video.type === 'short' ? 'video-commented-community short' : 'video-commented-community'}
                                src={like.video.thumbnail}
                                alt={like.video.title}
                            />
                        </Link>
                    </Container>
                </Container>
            )) : <p className="no-comments">No likes yet.</p>}
            {likes.length >= limitLikes && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <button className="btn-community" onClick={handleLoadMore}>Load More</button>
                </div>
            )}
        </>
    );

    return (
        <>
            <div className="filter-bar">
                <ul className="content-ul">
                    <li><button className={activeTab === 'comments' ? 'active' : ''} onClick={() => setActiveTab('comments')}>Comments</button></li>
                    <li><button className={activeTab === 'catscribers' ? 'active' : ''} onClick={() => setActiveTab('catscribers')}>Catscribers</button></li>
                    <li><button className={activeTab === 'likes' ? 'active' : ''} onClick={() => setActiveTab('likes')}>Likes</button></li>
                </ul>
            </div>

            {loading && <div style={{ textAlign: 'center' }}>Loading...</div>}
            {error && <div>Error: {error}</div>}

            {!loading && !error && (
                <>
                    {activeTab === 'comments' && renderComments()}
                    {activeTab === 'catscribers' && renderCatscribers()}
                    {activeTab === 'likes' && renderLikes()}
                </>
            )}
        </>
    );
}

export default VideoCommunity;
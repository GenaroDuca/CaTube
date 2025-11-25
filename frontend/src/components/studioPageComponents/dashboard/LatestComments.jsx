import { useState, useEffect } from 'react';
import Subtitle from '../../homePageComponents/Subtitle';
import CommentItem from './CommentItem';
import Container from "../../common/Container";
import NewButton from '../../homePageComponents/Button';
import { Link } from 'react-router-dom'
import { VITE_API_URL } from "../../../../config";

function LatestComments() {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch(`${VITE_API_URL}/comment/user-comments`, {
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

    if (loading) {
        return (
            <Container className="dashboard-card">
                <Subtitle subtitle="Latest comments" />
                {[...Array(3)].map((_, index) => (
                    <div key={index} style={{ display: 'flex', gap: '15px', marginBottom: '15px', padding: '10px' }}>
                        <div className="skeleton" style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#e0e0e0', flexShrink: 0 }}></div>
                        <div style={{ flex: 1 }}>
                            <div className="skeleton" style={{ width: '30%', height: '16px', backgroundColor: '#e0e0e0', borderRadius: '4px', marginBottom: '8px' }}></div>
                            <div className="skeleton" style={{ width: '100%', height: '14px', backgroundColor: '#e0e0e0', borderRadius: '4px', marginBottom: '5px' }}></div>
                            <div className="skeleton" style={{ width: '80%', height: '14px', backgroundColor: '#e0e0e0', borderRadius: '4px' }}></div>
                        </div>
                        <div className="skeleton" style={{ width: '80px', aspectRatio: '16/9', backgroundColor: '#e0e0e0', borderRadius: '8px', flexShrink: 0 }}></div>
                    </div>
                ))}
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="dashboard-card">
                <Subtitle subtitle="Latest comments" />
                <p>Error: {error}</p>
            </Container>
        );
    }

    return (
        <Container className="dashboard-card">
            <Subtitle subtitle="Latest comments" />
            {comments.length > 0 ? (
                <>
                    {comments.map(comment => (
                        <CommentItem
                            key={comment.id}
                            userPhoto={comment.userPhoto}
                            username={comment.username}
                            message={comment.message}
                            videoThumbnail={comment.videoThumbnail}
                            channelUrl={comment.channelUrl}
                            videoId={comment.videoId}
                            videoType={comment.videoType}
                        />
                    ))}
                    {/* Solo se muestra el botón si hay comentarios */}
                    <Link to="/studio?section=community">
                        <NewButton btnclass="btn-dashboard" btntitle="View more" />
                    </Link>
                </>
            ) : (
                <p>No comments yet.</p>
            )}
        </Container>
    );
}

export default LatestComments;

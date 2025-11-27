import { useState, useEffect } from 'react';
import Subtitle from '../../homePageComponents/Subtitle';
import CommentItem from './CommentItem';
import Container from "../../common/Container";
import NewButton from '../../homePageComponents/Button';
import { Link } from 'react-router-dom'
import { VITE_API_URL } from "../../../../config";
import Loader from '../../common/Loader';

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

    if (error) {
        return (
            <Container className="dashboard-card">
                <Subtitle subtitle="Latest comments" />
                <p>Error: {error}</p>
            </Container>
        );
    }
    
    if (loading) {
        return <div className="dashboard-card">
            <Loader />
        </div>
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

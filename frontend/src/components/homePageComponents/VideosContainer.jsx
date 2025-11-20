import Container from '../common/Container.jsx'
import Subtitle from './Subtitle.jsx'
import Video from './Video.jsx'
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAuthToken } from '../../utils/auth.js';
import { VITE_API_URL } from "../../../config"

function VideosContainer() {
    const [recommended, setRecommended] = useState([]);
    const token = getAuthToken();

    useEffect(() => {
        let mounted = true;
        async function fetchRecommended() {
            try {
                const res = await fetch(`${VITE_API_URL}/videos/videos-only`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!res.ok) {
                    setRecommended([]);
                    return;
                }
                const data = await res.json();

                // Map to UI-friendly shape and pick first 8 (or fewer)
                const mapped = data.map(v => ({
                    id: v.id,
                    title: v.title,
                    viewsLabel: v.views ? `${v.views} views` : '0 views',
                    thumbnail: v.thumbnail || v.photo || '',
                }));

                // Optionally sort by views desc to recommend popular, then take top 8
                mapped.sort((a, b) => (b.views || 0) - (a.views || 0));

                if (mounted) setRecommended(mapped.slice(0, 8));
            } catch (err) {
                console.error('Error fetching recommended videos:', err);
                if (mounted) setRecommended([]);
            }
        }

        fetchRecommended();
        return () => { mounted = false };
    }, []);

    return (
        <Container className="VideoContainer">
            <Subtitle subtitle="Recommended" />
            <Container className="recommendations-container">
                {recommended.map((video, index) => (
                    <Link to={`/watch/${video.id}`} key={video.id || index}>
                        <Video
                            namevideo={video.title}
                            videoviews={video.viewsLabel}
                            thumbnail={video.thumbnail}
                        />
                    </Link>
                ))}
            </Container>
        </Container>
    );
}

export default VideosContainer;
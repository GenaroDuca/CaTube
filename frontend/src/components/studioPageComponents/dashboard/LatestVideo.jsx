import { useEffect, useState } from 'react';
import Container from "../../common/Container";
import Subtitle from "../../homePageComponents/Subtitle";
import { getAuthToken } from '../../../utils/auth';
import { VITE_API_URL } from '../../../../config';
import { Link } from 'react-router-dom';

function LatestVideo({ channelId }) {
    const [latest, setLatest] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = getAuthToken();
    useEffect(() => {
        async function fetchLatest() {
            setLoading(true);
            try {
                if (!channelId) {
                    setLatest(null);
                    setLoading(false);
                    return;
                }

                const res = await fetch(`${VITE_API_URL}/videos/channel/${channelId}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!res.ok) {
                    setLatest(null);
                    setLoading(false);
                    return;
                }

                const data = await res.json();
                if (!Array.isArray(data) || data.length === 0) {
                    setLatest(null);
                    setLoading(false);
                    return;
                }

                // pick the most recent by createdAt
                const sorted = data.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                const v = sorted[0];

                const thumbnail = v.thumbnail && v.thumbnail.startsWith('/') ? `${VITE_API_URL}${v.thumbnail}` : (v.thumbnail || '');
                setLatest({
                    id: v.id,
                    title: v.title,
                    thumbnail,
                    views: v.views || 0,
                    createdAt: v.createdAt,
                    type: v.type,
                });
            } catch (err) {
                console.error('Error loading latest video:', err);
                setLatest(null);
            } finally {
                setLoading(false);
            }
        }

        fetchLatest();
    }, [channelId]);

    const formatDate = (iso) => {
        if (!iso) return '';
        const d = new Date(iso);
        return d.toLocaleDateString();
    };

    return (
        <Container className="dashboard-card">
            <Subtitle subtitle="Latest Video performance"></Subtitle>
            {loading ? (
                <>
                    <div className="skeleton" style={{ width: '80%', aspectRatio: '16/9', backgroundColor: '#e0e0e0', borderRadius: '15px', margin: '0 auto 15px' }}></div>
                    <Container className="lca-dashboard">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                            <div className="skeleton" style={{ width: '70%', height: '20px', backgroundColor: '#e0e0e0', borderRadius: '4px' }}></div>
                            <div className="skeleton" style={{ width: '40%', height: '16px', backgroundColor: '#e0e0e0', borderRadius: '4px' }}></div>
                            <div className="skeleton" style={{ width: '50%', height: '16px', backgroundColor: '#e0e0e0', borderRadius: '4px' }}></div>
                        </div>
                    </Container>
                </>
            ) : latest ? (
                <>
                    <Link to={latest.type === 'short' ? `/shorts/${latest.id}` : `/watch/${latest.id}`}>
                        <img
                            className={latest.type === 'short' ? 'latest-video short' : 'latest-video'}
                            src={latest.thumbnail}
                            alt={latest.title}
                        />
                    </Link>
                    <Container className="lca-dashboard">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <strong>{latest.title}</strong>
                            <span>{latest.views} views</span>
                            <span>Uploaded: {formatDate(latest.createdAt)}</span>
                        </div>
                    </Container>
                </>
            ) : (
                <p>No videos uploaded yet.</p>
            )}
        </Container>
    );
}

export default LatestVideo;
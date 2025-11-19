import Title from "../../trendingPageComponents/Title"
import Container from "../../common/Container"
import FilterBar from "./FilterBar"
import VideoContent from "./VideoContent";
import { useState, useEffect } from "react";
import { API_URL } from "../../../../config"

function Content() {
    const [activeContent, setActiveContent] = useState('Videos');
    const [videos, setVideos] = useState([]);
    const [shorts, setShorts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch the logged-in user's videos when the component mounts or when activeContent changes to Videos/Shorts
        const fetchMyVideos = async () => {
            const accessToken = localStorage.getItem('accessToken');
            const storedChannelId = localStorage.getItem('channelId');
            setLoading(true);

            // helper to map response video objects to table shape
            const mapVideos = (data) => data.map(v => {
                let src = v.thumbnail || '';
                if (src && src.startsWith('/uploads/')) src = `${API_URL}${src}`;
                if (!src) src = '/assets/images/thumbnails/pinterest_swap_challenge.jpg';
                return {
                    id: v.id,
                    src,
                    alt: v.title,
                    title: v.title,
                    description: v.description || '',
                    visibility: v.visibility || 'Public',
                    restrictions: v.restrictions || 'None',
                    date: v.createdAt || '',
                    views: v.views ?? 0,
                    comments: v.comments?.length ?? 0,
                    like: v.likes?.length ?? 0,
                    type: v.type || 'video',
                    tags: v.tags?.map(t => t.name) || []
                };
            });

            try {
                console.debug('Content: fetching videos, accessToken present?', !!accessToken, 'storedChannelId:', storedChannelId);
                if (accessToken) {
                    const res = await fetch(`${API_URL}/videos/my-videos`, {
                        headers: { 'Authorization': `Bearer ${accessToken}` },
                    });
                    console.debug('Content: /videos/my-videos status', res.status);
                        if (!res.ok) {
                            const text = await res.text().catch(() => '<no body>');
                            console.error('Content: /videos/my-videos error', res.status, text);
                            setVideos([]);
                            setShorts([]);
                            return;
                        }
                    const data = await res.json();
                    console.debug('Content: /videos/my-videos returned', Array.isArray(data) ? data.length : typeof data, data);
                    const mapped = mapVideos(data);
                    setVideos(mapped.filter(x => x.type === 'video'));
                    setShorts(mapped.filter(x => x.type === 'short'));
                    return;
                }

                // No access token — try to fetch by stored channelId (public endpoint)
                if (storedChannelId) {
                    const res = await fetch(`${BASE_URL}/videos/channel/${storedChannelId}`, {
                        headers: { 'Authorization': `Bearer ${accessToken}` },
                    });
                    console.debug('Content: /videos/channel/:id status', res.status);
                        if (!res.ok) {
                            const text = await res.text().catch(() => '<no body>');
                            console.error('Content: /videos/channel/:id error', res.status, text);
                            setVideos([]);
                            setShorts([]);
                            return;
                        }
                    const data = await res.json();
                    console.debug('Content: /videos/channel returned', Array.isArray(data) ? data.length : typeof data, data);
                    const mapped = mapVideos(data);
                    setVideos(mapped.filter(x => x.type === 'video'));
                    setShorts(mapped.filter(x => x.type === 'short'));
                    return;
                }

                // No token and no stored channel id — nothing to show
                setVideos([]);
                setShorts([]);
            } catch (err) {
                console.error('Error fetching my/channel videos:', err);
                setVideos([]);
                setShorts([]);
            } finally {
                setLoading(false);
            }
        };

        // Only fetch if user is viewing Videos or Shorts content
        if (activeContent === 'Videos' || activeContent === 'Shorts') {
            fetchMyVideos();
        }
    }, [activeContent]);

    return (
        <>
            <Title title="Content"></Title>
            <hr></hr>
            <Container className="content">
                <FilterBar activeFilter={activeContent} onFilterChange={setActiveContent} ></FilterBar>

                {/* Informative messages for empty state */}
                {!loading && videos.length === 0 && shorts.length === 0 && (
                    <div className="studio-empty-message" style={{padding: '1rem', color: '#666'}}>
                        No hay videos para mostrar. Asegúrate de haber iniciado sesión o de que tu canal esté seleccionado.
                        Si subiste un video recientemente, inicia sesión y visita la página "Tu canal" para sincronizar el canal (localStorage). 
                    </div>
                )}

                {activeContent === 'Videos' && <VideoContent content={videos} contentType={activeContent} />}
                {activeContent === 'Shorts' && <VideoContent content={shorts} contentType={activeContent} />}
                {/* {activeContent === 'Playlists' && <VideoContent content={[]} contentType={activeContent} />} */}
            </Container>
        </>
    );
}

export default Content;
import Title from "../../trendingPageComponents/Title"
import Container from "../../common/Container"
import FilterBar from "./FilterBar"
import VideoContent from "./VideoContent";
import { useState, useEffect } from "react";
import { VITE_API_URL } from "../../../../config"

function Content() {
    const [activeContent, setActiveContent] = useState('Videos');
    const [videos, setVideos] = useState([]);
    const [shorts, setShorts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchMyVideos = async () => {
            const accessToken = localStorage.getItem('accessToken');
            const storedChannelId = localStorage.getItem('channelId');
            setLoading(true);

            const mapVideos = (data) => {
                const mapped = data.map((v) => {
                    let src = v.thumbnail || '';
                    if (src && src.startsWith('/uploads/')) src = `${VITE_API_URL}${src}`;
                    if (!src) src = '/assets/images/thumbnails/pinterest_swap_challenge.jpg';

                    // Los conteos vienen directamente del backend
                    const commentsCount = parseInt(v.video_commentCount || '0', 10);
                    const likesCount = parseInt(v.video_likeCount || '0', 10);

                    return {
                        id: v.id,
                        src,
                        alt: v.title,
                        title: v.title,
                        description: v.description,
                        visibility: v.visibility || 'Public',
                        restrictions: v.restrictions || 'None',
                        date: v.createdAt || '',
                        views: v.views ?? 0,
                        comments: commentsCount,
                        like: likesCount,
                        type: v.type || 'video',
                        tags: v.tags?.map(t => t.name) || []
                    };
                });
                return mapped;
            };

            try {
                const myVideosEndpoint = `${VITE_API_URL}/videos/my-videos`;

                // 1. Determinar la URL a usar
                let urlToFetch = myVideosEndpoint;
                if (!accessToken && storedChannelId) {
                    urlToFetch = `${VITE_API_URL}/videos/channel/${storedChannelId}`;
                } else if (!accessToken && !storedChannelId) {
                    setVideos([]);
                    setShorts([]);
                    return;
                }

                // 2. Realizar la petición
                const res = await fetch(urlToFetch, {
                    headers: { 'Authorization': `Bearer ${accessToken}` },
                });

                // 3. Manejar errores de respuesta
                if (!res.ok) {
                    const text = await res.text().catch(() => '<no body>');
                    console.error('Content: video fetch error', res.status, text); // Mantener este log de error
                    setVideos([]);
                    setShorts([]);
                    return;
                }

                // 4. Procesar y mapear datos
                const data = await res.json();
                const mapped = mapVideos(data);

                // 5. Actualizar estado
                setVideos(mapped.filter(x => x.type === 'video'));
                setShorts(mapped.filter(x => x.type === 'short'));

            } catch (err) {
                console.error('Error fetching my/channel videos:', err); // Mantener este log de error
                setVideos([]);
                setShorts([]);
            } finally {
                setLoading(false);
            }
        };

        if (activeContent === 'Videos' || activeContent === 'Shorts') {
            fetchMyVideos();
        }
    }, [activeContent]);

    return (
        <>
            <Title title="Content"></Title>
            <Container className="content">
                {/* FilterBar visibility logic */}
                {(videos.length > 0 || shorts.length > 0) && (
                    <FilterBar activeFilter={activeContent} onFilterChange={setActiveContent} ></FilterBar>
                )}

                {/* Informative messages for empty state */}
                {!loading && videos.length === 0 && shorts.length === 0 && (
                    <div className="studio-empty-message" >
                        There are no videos to show.
                    </div>
                )}

                {/* Video Content display */}
                {activeContent === 'Videos' && videos.length > 0 && <VideoContent content={videos} contentType={activeContent} />}
                {activeContent === 'Shorts' && shorts.length > 0 && <VideoContent content={shorts} contentType={activeContent} />}

                {/* Empty type messages */}
                {activeContent === 'Videos' && videos.length === 0 && shorts.length > 0 && (
                    <div className="studio-empty-message" >
                        No videos to show.
                    </div>
                )}
                {activeContent === 'Shorts' && shorts.length === 0 && videos.length > 0 && (
                    <div className="studio-empty-message" >
                        No shorts to show.
                    </div>
                )}
            </Container>
        </>
    );
}

export default Content;
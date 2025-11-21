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
        // Fetch the logged-in user's videos when the component mounts or when activeContent changes to Videos/Shorts
        const fetchMyVideos = async () => {
            const accessToken = localStorage.getItem('accessToken');
            const storedChannelId = localStorage.getItem('channelId');
            setLoading(true);

            const mapVideos = async (data) => {
                const mapped = await Promise.all(data.map(async (v) => {
                    let src = v.thumbnail || '';
                    if (src && src.startsWith('/uploads/')) src = `${VITE_API_URL}${src}`;
                    if (!src) src = '/assets/images/thumbnails/pinterest_swap_challenge.jpg';

                    // Fetch comment count for each video
                    let commentsCount = 0;
                    try {
                        const res = await fetch(`${BASE_URL}/comment/${v.id}/comments/count`);
                        if (res.ok) {
                            const countData = await res.json();
                            commentsCount = countData || 0;
                        }
                    } catch (err) {
                        console.error('Error fetching comment count for video', v.id, err);
                    }

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
                        comments: commentsCount,
                        like: v.likes ?? 0,
                        type: v.type || 'video',
                        tags: v.tags?.map(t => t.name) || []
                    };
                }));
                return mapped;
            };

            try {
                console.debug('Content: fetching videos, accessToken present?', !!accessToken, 'storedChannelId:', storedChannelId);
                if (accessToken) {
                    const res = await fetch(`${VITE_API_URL}/videos/my-videos`, {
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
                    const mapped = await mapVideos(data);
                    setVideos(mapped.filter(x => x.type === 'video'));
                    setShorts(mapped.filter(x => x.type === 'short'));
                    return;
                }

                // No access token — try to fetch by stored channelId (public endpoint)
                if (storedChannelId) {
                    const res = await fetch(`${VITE_API_URL}/videos/channel/${storedChannelId}`, {
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
                {/* Only show FilterBar if there are videos or shorts */}
                {(videos.length > 0 || shorts.length > 0) && (
                    <FilterBar activeFilter={activeContent} onFilterChange={setActiveContent} ></FilterBar>
                )}

                {/* Informative messages for empty state */}
                {!loading && videos.length === 0 && shorts.length === 0 && (
                    <div className="studio-empty-message" >
                    There are no videos to show.
                    </div>
                )}

                {/* Only show VideoContent if there are items for the active content type */}
                {activeContent === 'Videos' && videos.length > 0 && <VideoContent content={videos} contentType={activeContent} />}
                {activeContent === 'Shorts' && shorts.length > 0 && <VideoContent content={shorts} contentType={activeContent} />}
                {/* Show message when no videos but shorts exist */}
                {activeContent === 'Videos' && videos.length === 0 && shorts.length > 0 && (
                    <div className="studio-empty-message" >
                        No videos to show.
                    </div>
                )}
                {/* Show message when no shorts but videos exist */}
                {activeContent === 'Shorts' && shorts.length === 0 && videos.length > 0 && (
                    <div className="studio-empty-message" >
                        No shorts to show.
                    </div>
                )}
                {/* {activeContent === 'Playlists' && <VideoContent content={[]} contentType={activeContent} />} */}
            </Container>
        </>
    );
}

export default Content;
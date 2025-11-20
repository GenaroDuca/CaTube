import ContainerButton from "./ContainerButton"
import VideosLatest from "./VideosLatest";
import Container from "../common/Container";
import { useState, useEffect } from "react";
import { useRef } from "react";
import { getAuthToken } from "../../utils/auth.js";
import { VITE_API_URL } from '../../../config';

function VideosTab() {
    const tabvs = ['Latest', 'Popular', 'Oldest'];
    const [activeTab, setActiveTab] = useState(0);
    const videosLatestRef = useRef(null);
    const videosPopularRef = useRef(null);
    const videosOldestRef = useRef(null);
    const [videos, setVideos] = useState({ latest: [], popular: [], oldest: [] });
    const [loading, setLoading] = useState(true);

    const token = getAuthToken();

    const [channelId, setChannelId] = useState(localStorage.getItem('channelId'));

    useEffect(() => {
        async function fetchVideos() {
            if (!channelId) return;

            try {
                const res = await fetch(`${VITE_API_URL}/videos/channel/${channelId}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!res.ok) throw new Error("Error al obtener los videos");
                const data = await res.json();

                // Separar por tipo, si los videos tienen un campo "type"
                const allVideos = data.filter(v => v.type === "video" || !v.type);

                // Ordenar por latest, popular, oldest
                const latest = [...allVideos].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                const popular = [...allVideos].sort((a, b) => b.views - a.views);
                const oldest = [...allVideos].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

                setVideos({ latest, popular, oldest });
            } catch (error) {
                console.error("Error fetching videos:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchVideos();
    }, [channelId]);

    if (loading) {
        return <Container className="video-main-content"><p>Loading videos...</p></Container>;
    }

    const tabContents = [
        <VideosLatest render={videos.latest} id="latestSection" className="content-table-videos" container="latest-container" ref={videosLatestRef} type="videos"/>,
        <VideosLatest render={videos.popular} id="popularSection" className="content-table-videos" container="latest-container" ref={videosPopularRef} type="videos"/>,
        <VideosLatest render={videos.oldest} id="oldestSection" className="content-table-videos" container="latest-container" ref={videosOldestRef} type="videos"/>
    ];

    return (
        <>
        <Container className="video-main-content">
        <ContainerButton tabs={tabvs} activeTabIndex={activeTab} onTabClick={setActiveTab} buttonClass="nav-btn-videos" ></ContainerButton>

        <div className="tab-content-container">
                        {tabContents[activeTab]}
        </div>
        </Container>
        </>
    );
}

export default VideosTab;

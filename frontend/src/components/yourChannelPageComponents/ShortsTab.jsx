import Container from "../common/Container";
import ContainerButton from "./ContainerButton";
import { useState, useEffect } from "react";
import { useRef } from "react";
import { getAuthToken } from "../../utils/auth.js";
import { VITE_API_URL } from '../../../config';
import { Link } from 'react-router-dom';
import Subtitle from '../homePageComponents/Subtitle'
import Short from "../homePageComponents/Short";

function ShortsTab() {
    const tabs = ['Latest', 'Popular', 'Oldest'];
    const [activeTab, setActiveTab] = useState(0);
    const shortsLatestRef = useRef(null);
    const shortsPopularRef = useRef(null);
    const shortsOldestRef = useRef(null);
    const [shorts, setShorts] = useState({ latest: [], popular: [], oldest: [] });
    const [loading, setLoading] = useState(true);

    const token = getAuthToken();
    const [channelId, setChannelId] = useState(localStorage.getItem('channelId'));

    useEffect(() => {
        async function fetchShorts() {
            if (!channelId) return;

            try {
                const res = await fetch(`${VITE_API_URL}/videos/channel/${channelId}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!res.ok) throw new Error("Error al obtener los shorts");
                const data = await res.json();

                // Filtrar solo shorts y mapear
                const allShorts = data.filter(v => v.type === "short").map(short => ({
                    id: short.id,
                    nameshort: short.title,
                    shortviews: `${short.views || 0} views`,
                    thumbnail: short.thumbnail,
                    createdAt: short.createdAt
                }));

                // Ordenar por latest, popular, oldest
                const latest = [...allShorts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                const popular = [...allShorts].sort((a, b) => b.views - a.views);
                const oldest = [...allShorts].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

                setShorts({ latest, popular, oldest });
            } catch (error) {
                console.error("Error fetching shorts:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchShorts();
    }, [channelId]);

    if (loading) {
        return <Container className="video-main-content"><p>Loading shorts...</p></Container>;
    }

    if (shorts.latest.length === 0) {
        return (
            <Container className="video-main-content">
                <div className="empty-channel-message">
                    <h3>No shorts uploaded yet</h3>
                    <p>This channel hasn't uploaded any shorts</p>
                </div>
            </Container>
        );
    }

    const tabContents = [
        <Container className="VideoContainer">
            <Subtitle subtitle="Lastest Shorts" />
            <Container className="recommendations-container shorts">
                {shorts.latest.map((video, index) => (
                    <Link to={`/watch/${video.id}`} key={video.id || index}>
                        <Short
                            key={index}
                            nameshort={video.nameshort}
                            shortviews={video.shortviews}
                            thumbnail={video.thumbnail}
                            createdAt={video.createdAt}
                        />
                    </Link>
                ))}
            </Container>
        </Container>,
        <Container className="VideoContainer">
            <Subtitle subtitle="Popular Shorts" />
            <Container className="recommendations-container shorts">
                {shorts.popular.map((video, index) => (
                    <Link to={`/watch/${video.id}`} key={video.id || index}>
                        <Short
                            key={index}
                            nameshort={video.nameshort}
                            shortviews={video.shortviews}
                            thumbnail={video.thumbnail}
                            createdAt={video.createdAt}
                        />
                    </Link>
                ))}
            </Container>
        </Container>,
        <Container className="VideoContainer">
            <Subtitle subtitle="Oldest Shorts" />
            <Container className="recommendations-container shorts">
                {shorts.oldest.map((video, index) => (
                    <Link to={`/watch/${video.id}`} key={video.id || index}>
                        <Short
                            key={index}
                            nameshort={video.nameshort}
                            shortviews={video.shortviews}
                            thumbnail={video.thumbnail}
                            createdAt={video.createdAt}
                        />
                    </Link>
                ))}
            </Container>
        </Container>,
        // <VideosLatest render={shorts.latest} id="shortsLatest" className="content-table-shorts" container="shorts-container" ref={shortsLatestRef} type="shorts" />,
        // <VideosLatest render={shorts.popular} id="shortsPopular" className="content-table-shorts" container="shorts-container" ref={shortsPopularRef} type="shorts" />,
        // <VideosLatest render={shorts.oldest} id="shortsOldest" className="content-table-shorts" container="shorts-container" ref={shortsOldestRef} type="shorts" />
    ];
    return (
        <>
            <Container className="video-main-content">
                <ContainerButton tabs={tabs} activeTabIndex={activeTab} onTabClick={setActiveTab} containerName="nav-btn-videos-container" ></ContainerButton>

                <div className="tab-content-container">
                    {tabContents[activeTab]}
                </div>
            </Container>
        </>
    );
}

export default ShortsTab;
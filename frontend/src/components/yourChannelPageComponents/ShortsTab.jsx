import Container from "../common/Container";
import ContainerButton from "./ContainerButton";
import { useState, useEffect } from "react";
import { useRef } from "react";
import { getAuthToken } from "../../utils/auth.js";
import { VITE_API_URL } from '../../../config';
import { Link } from 'react-router-dom';
import Subtitle from '../homePageComponents/Subtitle'
import Short from "../homePageComponents/Short";
import Loader from "../../components/common/Loader";

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
                    // MANTENER la vista como número para clasificar
                    views: short.views || 0,
                    shortviews: `${short.views || 0} views`,
                    thumbnail: short.thumbnail,
                    createdAt: short.createdAt
                }));

                // Ordenar por latest, popular, oldest
                const latest = [...allShorts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                // CORREGIDO: Ahora usamos la propiedad numérica 'views'
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
    }, [channelId, token]);

    if (loading) {
        return <Loader />
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

    const renderShorts = (shortList, subtitle) => (
        <Container className="VideoContainer">
            <Subtitle subtitle={subtitle} />
            <Container className="recommendations-container shorts">
                {shortList.map((video, index) => (
                    // Asegúrate de usar `/shorts/${video.id}` si ese es el endpoint correcto para shorts
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
        </Container>
    );

    const tabContents = [
        renderShorts(shorts.latest, "Latest Shorts"),
        renderShorts(shorts.popular, "Popular Shorts"),
        renderShorts(shorts.oldest, "Oldest Shorts"),
    ];

    return (
        <>
            <Container className="video-main-content">
                <ContainerButton
                    tabs={tabs}
                    activeTabIndex={activeTab}
                    onTabClick={setActiveTab}
                    containerName="nav-btn-videos-container"
                />

                <div className="tab-content-container">
                    {tabContents[activeTab]}
                </div>
            </Container>
        </>
    );
}

export default ShortsTab;
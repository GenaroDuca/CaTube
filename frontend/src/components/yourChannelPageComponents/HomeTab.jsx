import { useEffect, useState, useRef } from "react";
import Container from "../common/Container";
import ContainerChannel from "../../components/yourChannelPageComponents/ContainerChannel";
import Sections from "../../components/homePageComponents/Sections";
import { getAuthToken } from "../../utils/auth.js";

function HomeTab() {
    const foryouRef = useRef(null);
    const videosRef = useRef(null);
    const shortsRef = useRef(null);

    const [videos, setVideos] = useState([]);
    const [shorts, setShorts] = useState([]);

    const token = getAuthToken();

    useEffect(() => {
        async function fetchVideos() {
            try {
                const res = await fetch("http://localhost:3000/videos/my-videos", {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!res.ok) throw new Error("Error al obtener los videos");
                const data = await res.json();

                // Separar por tipo, si los videos tienen un campo "type"
                const allVideos = data.filter(v => v.type === "video" || !v.type);
                const allShorts = data.filter(v => v.type === "short");

                console.log (allVideos)

                setVideos(allVideos);
                setShorts(allShorts);
            } catch (error) {
                console.error("Error fetching videos:", error);
            }
        }

        fetchVideos();
    }, []);

    return (
        <>
            <Container className="content-table">
                <ContainerChannel />
            </Container>

            <Sections
                section="subscriptions"
                subtitle="Recent"
                ref={foryouRef}
                render={videos.slice(0, 5)}
                type="video"
                cts="carousel-ctsvideos"
            />

            <Sections
                section="subscriptions"
                subtitle="All Videos"
                ref={videosRef}
                render={videos}
                type="video"
                cts="carousel-ctsvideos"
            />

            <Sections
                section="subscriptions"
                subtitle="Shorts"
                ref={shortsRef}
                render={shorts}
                type="short"
                cts="carousel-ctshorts"
            />
        </>
    );
}

export default HomeTab;
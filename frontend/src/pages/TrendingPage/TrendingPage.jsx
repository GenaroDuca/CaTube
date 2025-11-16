import Sidebar from "../../components/common/Sidebar.jsx";
import SectionsCarousel from "../../components/homePageComponents/SectionsCarousel.jsx";
import { useRef, useState, useEffect } from 'react';
import Title from "../../components/trendingPageComponents/Title.jsx";
import Footer from "../../components/common/Footer.jsx";
import Block from "../../components/trendingPageComponents/Block.jsx";
import VideoCard from "../../components/trendingPageComponents/VideoCard.jsx"
import Header from "../../components/common/header/Header.jsx";
import '../../styles/Global_components.css'
import '../HomePage/HomePage.css'
import '../TrendingPage/TrendingPage.css'
import { getAuthToken } from '../../utils/auth.js';

function Trending() {
    const shortsRef = useRef(null);
    const [shorts, setShorts] = useState([]);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = getAuthToken();

    useEffect(() => {
        async function fetchTrendingContent() {
            try {
                setLoading(true);

                // Fetch shorts
                const shortsResponse = await fetch('http://localhost:3000/videos/shorts', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (shortsResponse.ok) {
                    const shortsData = await shortsResponse.json();
                    const formattedShorts = shortsData.map(short => ({
                        id: short.id,
                        nameshort: short.title,
                        shortviews: `${short.views} views`,
                        photo: short.thumbnail
                    }));
                    setShorts(formattedShorts);
                }

                // Fetch videos
                const videosResponse = await fetch('http://localhost:3000/videos' , {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (videosResponse.ok) {
                    const videosData = await videosResponse.json();
                    const formattedVideos = videosData
                        .filter(video => video.type === 'video')
                        .map(video => ({
                            id: video.id,
                            title: video.title,
                            videoviews: `${video.views} views`,
                            thumbnail: video.thumbnail
                        }));
                    setVideos(formattedVideos);
                }
            } catch (error) {
                console.error('Error fetching trending content:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchTrendingContent();
    }, []);

    return (
        <>
            <Header></Header>
            <Sidebar>
            </Sidebar>

            <main className="main-content">
                <Title class="title-container" title="Trending"></Title>
                <SectionsCarousel section="trending-shorts" subtitle="Trending Shorts" ref={shortsRef} render={shorts} type="short" cts="carousel-ctshorts"></SectionsCarousel>
                <Block section="trending-videos" subtitle="Trending Videos">
                    {loading ? (
                        <p>Loading videos...</p>
                    ) : (
                        videos.map(video => (
                            <VideoCard key={video.id} video={video} />
                        ))
                    )}
                </Block>
                <Footer footer="footer"></Footer>
            </main>
        </>
    );
}

export default Trending;

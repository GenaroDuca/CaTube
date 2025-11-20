import Sidebar from "../../components/common/Sidebar.jsx";
import SectionsCarousel from "../../components/homePageComponents/SectionsCarousel.jsx";
import { useRef, useState, useEffect } from 'react';
import VideosContainer from "../../components/homePageComponents/VideosContainer.jsx"
import Ads from "../../components/homePageComponents/Ads.jsx"
import Footer from "../../components/common/Footer.jsx";
import '../../styles/Global_components.css'
import '../HomePage/HomePage.css'
import '../TrendingPage/TrendingPage.css'
import Header from "../../components/common/header/Header.jsx";
import { getAuthToken } from '../../utils/auth.js';
import { VITE_API_URL } from '../../../config';

function Catscribers() {
    const shortsRef = useRef(null);
    const [shorts, setShorts] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = getAuthToken();

    useEffect(() => {
        async function fetchShorts() {
            try {
                setLoading(true);
                const response = await fetch(`${VITE_API_URL}/videos/shorts`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    const formattedShorts = data.map(short => ({
                        id: short.id,
                        nameshort: short.title,
                        shortviews: `${short.views} views`,
                        thumbnail: short.thumbnail
                    }));
                    setShorts(formattedShorts);
                }
            } catch (error) {
                console.error('Error fetching shorts:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchShorts();
    }, []);

    return (
        <>
            <Header></Header>

            <Sidebar>
            </Sidebar>

            <main className="main-content">
                <SectionsCarousel section="trending-shorts" subtitle="Shorts" ref={shortsRef} render={shorts} type="short" cts="carousel-ctshorts"></SectionsCarousel>
                <VideosContainer />
                {/* <Ads/> */}
                <Footer footer="footer"></Footer>
            </main>
        </>
    );
}

export default Catscribers;

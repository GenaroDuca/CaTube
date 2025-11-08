import Sidebar from "../../components/common/Sidebar.jsx";
import Sections from "../../components/homePageComponents/Sections.jsx";
import { useRef, useState, useEffect } from 'react';
import Recommendations from "../../components/homePageComponents/Recommendations.jsx"
import Ads from "../../components/homePageComponents/Ads.jsx"
import Footer from "../../components/common/Footer.jsx";
import '../../styles/Global_components.css'
import '../HomePage/HomePage.css'
import '../TrendingPage/TrendingPage.css'
import Header from "../../components/common/header/Header.jsx";

function Catscribers(){
    const shortsRef = useRef(null);
    const [shorts, setShorts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchShorts() {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:3000/videos/shorts');
                if (response.ok) {
                    const data = await response.json();
                    const formattedShorts = data.map(short => ({
                        id: short.id,
                        nameshort: short.title,
                        shortviews: `${short.views} views`,
                        photo: short.thumbnail
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

    return(
        <>
            <Header></Header>

                <Sidebar>
                </Sidebar>

                <main className="main-content">
                    <Sections section="trending-shorts" subtitle="Shorts" ref={shortsRef} render={shorts} type="short" cts="carousel-ctshorts"></Sections>
                    <Recommendations />
                    {/* <Ads/> */}
                    <Footer footer="footer"></Footer>
                </main>
        </>
    );
}

export default Catscribers;

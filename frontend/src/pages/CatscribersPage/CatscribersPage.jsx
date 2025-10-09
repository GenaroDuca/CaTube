import Sidebar from "../../components/common/Sidebar.jsx";
import Sections from "../../components/homePageComponents/Sections.jsx";
import { useRef } from 'react';
import { catscribersshorts } from "../../assets/data/Data.jsx";
import Recommendations from "../../components/homePageComponents/Recommendations.jsx"
import Ads from "../../components/homePageComponents/Ads.jsx"
import Footer from "../../components/common/Footer.jsx";
import '../../styles/Global_components.css'
import '../HomePage/HomePage.css'
import '../TrendingPage/TrendingPage.css'
import Header from "../../components/common/header/Header.jsx";

function Catscribers(){
    const shortsRef = useRef(null);
    return(
        <>
            <Header></Header>

                <Sidebar>
                </Sidebar>

                <main className="main-content">
                    <Sections section="trending-shorts" subtitle="Shorts" ref={shortsRef} render={catscribersshorts} type="short" cts="carousel-ctshorts"></Sections>
                    <Recommendations />
                    <Ads/>
                    <Footer footer="footer"></Footer>
                </main>
        </>
    );
}

export default Catscribers;
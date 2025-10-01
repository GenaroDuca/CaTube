import Sidebar from "../views/components/hooks/Sidebar";
import Sections from "./components/home/Sections";
import { useRef } from 'react';
import { catscribersshorts } from "../assets/data/Data";
import Recommendations from "./components/home/Recommendations"
import Ads from "./components/home/Ads"
import Footer from "./components/hooks/Footer.jsx";
import '../styles/Global_components.css'
import '../styles/Home.css'
import '../styles/Trending.css'
import Header from "./components/header/Header.jsx";

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
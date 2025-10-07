import Sidebar from "../../hooks/Sidebar.jsx";
import Sections from "../../components/homePageComponents/Sections.jsx";
import { useRef } from 'react';
import { educationshorts } from "../../assets/data/Data.jsx";
import Title from "../../components/trendingPageComponents/Title.jsx";
import Footer from "../../hooks/Footer.jsx";
import Block from "../../components/trendingPageComponents/Block.jsx";
import VideoCard from "../../components/trendingPageComponents/VideoCard";
import Header from "../../components/common/header/Header.jsx";
import '../../styles/Global_components.css'
import '../HomePage/HomePage.css'
import '../TrendingPage/TrendingPage.css'

function Education() {
    const shortsRef = useRef(null);
    return (
        <>
                <Header></Header>
                <Sidebar>
                </Sidebar>
                <main className="main-content">
                    <Title class="title-trending-container" title="Education"></Title>
                    <Block section="trending-videos" subtitle="Education Videos">
                        <VideoCard></VideoCard>
                    </Block>
                    <Sections section="trending-shorts" subtitle="Education Shorts" ref={shortsRef} render={educationshorts} type="short" cts="carousel-ctshorts"></Sections>
                    <Footer footer="footer"></Footer>
                </main>
        </>
    );
}

export default Education;
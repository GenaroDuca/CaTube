import Sidebar from "../../hooks/Sidebar.jsx";
import Sections from "../../components/homePageComponents/Sections.jsx";
import { useRef } from 'react';
import { trendingshorts } from "../../assets/data/Data.jsx";
import Title from "../../components/trendingPageComponents/Title.jsx";
import Footer from "../../hooks/Footer.jsx";
import Block from "../../components/trendingPageComponents/Block.jsx";
import VideoCard from "../../components/trendingPageComponents/VideoCard.jsx"
import Header from "../../components/common/header/Header.jsx";
import '../../styles/Global_components.css'
import '../HomePage/HomePage.css'
import '../TrendingPage/TrendingPage.css'

function Trending (){
    const shortsRef = useRef(null);
    return(
        <>
                <Header></Header>
                <Sidebar>
                </Sidebar>

                <main className="main-content">
                    <Title class="title-trending-container" title="Trending"></Title>  
                    <Sections section="trending-shorts" subtitle="Trending Shorts" ref={shortsRef} render={trendingshorts} type="short" cts="carousel-ctshorts"></Sections>
                    <Block section="trending-videos" subtitle="Trending Videos">
                        <VideoCard></VideoCard>
                    </Block>
                    <Footer footer="footer"></Footer>
                </main>
        </>
    );
}

export default Trending;
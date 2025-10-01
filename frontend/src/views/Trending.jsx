import Sidebar from "../views/components/hooks/Sidebar";
import Sections from "./components/home/Sections";
import { useRef } from 'react';
import { trendingshorts } from "../assets/data/Data";
import Title from "./components/trending/Title";
import Footer from "./components/hooks/Footer.jsx";
import Block from "./components/trending/Block.jsx";
import VideoCard from "./components/trending/VideoCard";
import Header from "./components/header/Header.jsx";
import '../styles/Global_components.css'
import '../styles/Home.css'
import '../styles/Trending.css'

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
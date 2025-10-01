import Sidebar from "../views/components/hooks/Sidebar";
import Sections from "./components/home/Sections";
import { useRef } from 'react';
import { educationshorts } from "../assets/data/Data";
import Title from "./components/trending/Title";
import Footer from "./components/hooks/Footer.jsx";
import Block from "./components/trending/Block";
import VideoCard from "./components/trending/VideoCard";
import Header from "./components/header/Header.jsx";
import '../styles/Global_components.css'
import '../styles/Home.css'
import '../styles/Trending.css'

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
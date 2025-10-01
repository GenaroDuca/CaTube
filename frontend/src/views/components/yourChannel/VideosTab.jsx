import ContainerButton from "./ContainerButton"
import VideosLatest from "./VideosLatest";
import Container from "../hooks/Container";
import { useState } from "react";
import { useRef } from "react";
import { videoLatest, videoOldest, videoPopular } from "../../../assets/data/Data";

function VideosTab() {
    const tabvs = ['Latest', 'Popular', 'Oldest'];
    const [activeTab, setActiveTab] = useState(0);
    const videosLatestRef = useRef(null);
    const videosPopularRef = useRef(null);
    const videosOldestRef = useRef(null);

    const tabContents = [
        <VideosLatest render= {videoLatest} id="latestSection" className="content-table-videos" container="latest-container" ref={videosLatestRef} type="videos"/>,
        <VideosLatest render= {videoPopular} id="popularSection" className="content-table-videos" container="latest-container" ref={videosPopularRef} type="videos"/>,
        <VideosLatest render= {videoOldest} id="oldestSection" className="content-table-videos" container="latest-container" ref={videosOldestRef} type="videos"/>
    ];
    return (
        <>
        <Container className="video-main-content">
        <ContainerButton tabs={tabvs} activeTabIndex={activeTab} onTabClick={setActiveTab} buttonClass="nav-btn-videos" ></ContainerButton>
        
        <div className="tab-content-container">
                        {tabContents[activeTab]}
        </div>
        </Container>
        </>
    );
}

export default VideosTab;
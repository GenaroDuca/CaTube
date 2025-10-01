import VideosLatest from "./VideosLatest";
import Container from "../hooks/Container";
import ContainerButton from "./ContainerButton";
import { useState } from "react";
import { useRef } from "react";
import { shortsLatest, shortsPopular, shortsOldest } from "../../../assets/data/Data";

function ShortsTab (){
    const tabs = ['Latest', 'Popular', 'Oldest'];
    const [activeTab, setActiveTab] = useState(0);
    const shortsLatestRef = useRef(null);
    const shortsPopularRef = useRef(null);
    const shortsOldestRef = useRef(null);
    
    const tabContents = [
        <VideosLatest render= {shortsLatest} id="shortsLatest" className="content-table-shorts" container="shorts-container" ref={shortsLatestRef} type="shorts"/>,
        <VideosLatest render= {shortsPopular} id="shortsPopular" className="content-table-shorts" container="shorts-container" ref={shortsPopularRef} type="shorts"/>,
        <VideosLatest render= {shortsOldest} id="shortsOldest" className="content-table-shorts" container="shorts-container" ref={shortsOldestRef} type="shorts"/>
    ];
    return (
        <>
        <Container className="video-main-content">
        <ContainerButton tabs={tabs} activeTabIndex={activeTab} onTabClick={setActiveTab} buttonClass="nav-btn-shorts" ></ContainerButton>
        
        <div className="tab-content-container">
                        {tabContents[activeTab]}
        </div>
        </Container>
        </>
    );
}

export default ShortsTab;
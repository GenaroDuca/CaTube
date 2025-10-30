import "../YourChannelPage/YourChannelPage.css";
import "../HomePage/HomePage.css";
import "../../styles/Global_components.css"
import Sidebar from "../../components/common/Sidebar";
import Banner from "../../components/yourChannelPageComponents/Banner.jsx";
import Profile from "../../components/yourChannelPageComponents/Profile";
import ContainerButton from "../../components/yourChannelPageComponents/ContainerButton";
import HomeTab from "../../components/yourChannelPageComponents/HomeTab";
import VideosTab from "../../components/yourChannelPageComponents/VideosTab";
import { useState } from "react";
import ShortsTab from "../../components/yourChannelPageComponents/ShortsTab";
import Playlists from "../../components/yourChannelPageComponents/Playlists";
import PostsTab from "../../components/yourChannelPageComponents/PostsTab";
import Footer from "../../components/common/Footer.jsx";
import Header from "../../components/common/header/Header.jsx";

function YourChannel() {
    const tabLabels = ['Home', 'Videos', 'Shorts', 'Playlists', 'Posts'];
    const [activeTab, setActiveTab] = useState(0);
    const tabContents = [
        <HomeTab />,
        <VideosTab />,
        <ShortsTab />,
        <Playlists />,
        <PostsTab />
    ];
    return (

        <>
                <Header></Header>
                <Sidebar>
                </Sidebar>
                <main className="main-content">
                    <Banner></Banner>
                    <Profile></Profile>
                    <ContainerButton containerName="container-button" tabs={tabLabels} activeTabIndex={activeTab} onTabClick={setActiveTab} buttonClass="nav-btn" ></ContainerButton>

                    <div className="tab-content-container">
                        {tabContents[activeTab]}
                    </div>
                    <Footer footer="footer"></Footer>
                </main>
        </>
    );
}

export default YourChannel;

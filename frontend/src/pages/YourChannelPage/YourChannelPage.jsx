import "../YourChannelPage/YourChannelPage.css";
import "../HomePage/HomePage.css";
import "../../styles/Global_components.css"
import Sidebar from "../../components/common/Sidebar";
import Banner from "../../components/yourChannelPageComponents/Banner.jsx";
import Profile from "../../components/yourChannelPageComponents/Profile";
import ContainerButton from "../../components/yourChannelPageComponents/ContainerButton";
import HomeTab from "../../components/yourChannelPageComponents/HomeTab";
import VideosTab from "../../components/yourChannelPageComponents/VideosTab";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ShortsTab from "../../components/yourChannelPageComponents/ShortsTab";
import PostsTab from "../../components/yourChannelPageComponents/PostsTab";
import Footer from "../../components/common/Footer.jsx";
import Header from "../../components/common/header/Header.jsx";
import { VITE_API_URL } from '../../../config';
import StoreChannel from "../../components/yourChannelPageComponents/StoreChannel.jsx";

function YourChannel() {
    const { url } = useParams();
    const tabLabels = ['Home', 'Videos', 'Shorts', 'Posts', 'Store'];
    const [activeTab, setActiveTab] = useState(0);
    const [channelId, setChannelId] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const tabContents = [
        <HomeTab key={`home-${channelId}`} channelId={channelId} />,
        <VideosTab key={`videos-${channelId}`} />,
        <ShortsTab key={`shorts-${channelId}`} />,
        <PostsTab key={`posts-${channelId}`} isOwner={isOwner} channelId={channelId} />,
        <StoreChannel key={`store-${channelId}`} isOwner={isOwner} channelId={channelId} />
    ];

    useEffect(() => {
        setChannelId(null); // Reset to prevent showing old data
        async function loadChannel() {
            const accessToken = localStorage.getItem('accessToken');

            if (url && url !== 'yourchannel') {
                // URL like /yourchannel/genad, treat as channel URL
                const headers = {};
                if (accessToken) {
                    headers['Authorization'] = `Bearer ${accessToken}`;
                }

                const response = await fetch(`${VITE_API_URL}/channels/url/${url}`, {
                    headers: headers,
                });
                if (response.ok) {
                    const channel = await response.json();
                    localStorage.setItem('channelId', channel.channel_id);
                    setChannelId(channel.channel_id); // Update state to force re-render
                    setActiveTab(0); // Reset to first tab
                } else {
                    console.error('Channel not found for URL:', url);
                }
            } else {
                // Load user's own channel for /yourchannel or no url
                if (accessToken) {
                    const response = await fetch(`${VITE_API_URL}/users/me`, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                        },
                    });
                    if (response.ok) {
                        const userData = await response.json();
                        if (userData.channel) {
                            localStorage.setItem('channelId', userData.channel.channel_id);
                            setChannelId(userData.channel.channel_id); // Update state to force re-render
                            setActiveTab(0); // Reset to first tab
                        }
                    } else {
                        console.error('User not authenticated');
                    }
                } else {
                    console.error('No access token');
                }
            }
        }
        loadChannel();
    }, [url]);

    useEffect(() => {
        async function checkOwnership() {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken || !channelId) {
                setIsOwner(false);
                return;
            }

            try {
                const response = await fetch(`${VITE_API_URL}/users/me`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });
                if (response.ok) {
                    const userData = await response.json();
                    setIsOwner(userData.channel && userData.channel.channel_id === channelId);
                } else {
                    setIsOwner(false);
                }
            } catch (error) {
                console.error('Error checking ownership:', error);
                setIsOwner(false);
            }
        }
        checkOwnership();

    }, [channelId]);

    return (

        <>
            <Header></Header>
            <Sidebar>
            </Sidebar>
            <main className="main-content">
                <Banner channelId={channelId}></Banner>
                <Profile channelId={channelId} key={channelId}></Profile>
                <ContainerButton containerName="container-button" tabs={tabLabels} activeTabIndex={activeTab} onTabClick={setActiveTab} buttonClass="nav-btn" ></ContainerButton>

                <div className="tab-content-container">
                    {tabContents[activeTab]}
                </div>
                {/* <Footer footer="footer"></Footer> */}
            </main>
        </>
    );
}

export default YourChannel;

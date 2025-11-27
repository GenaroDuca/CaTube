import "../YourChannelPage/YourChannelPage.css";
import "../HomePage/HomePage.css";
import "../../styles/Global_components.css";
import "../StudioPage/StudioPage.css";
import SidebarStudio from "../../components/studioPageComponents/SidebarStudio.jsx";
import Footer from "../../components/common/Footer.jsx";
import Dashboard from "../../components/studioPageComponents/dashboard/Dashboard.jsx";
import Content from "../../components/studioPageComponents/content/Content.jsx";
// import Analytics from "../../components/studioPageComponents/analytics/Analytics.jsx";
import Community from "../../components/studioPageComponents/community/Community.jsx";
import Store from "../../components/studioPageComponents/store/Store.jsx";
// import Earn from "../../components/studioPageComponents/earn/earn.jsx";
import Customization from "../../components/studioPageComponents/customization/Customization.jsx";
import RightMenu from "../../components/studioPageComponents/RightMenu.jsx";
import Header from "../../components/common/header/Header.jsx";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import React from "react";
import { VITE_API_URL } from '../../../config';

function Studio() {
    const [searchParams, setSearchParams] = useSearchParams();
    const section = searchParams.get('section') || 'dashboard';
    const accessToken = localStorage.getItem('accessToken');
    const [userChannelId, setUserChannelId] = useState(null);
    const componentKey = `${section}-${accessToken}-${userChannelId}`;

    useEffect(() => {
        async function loadUserChannel() {
            if (!accessToken) {
                setUserChannelId(null);
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
                    if (userData.channel) {
                        const channelId = userData.channel.channel_id;
                        localStorage.setItem('channelId', channelId);
                        setUserChannelId(channelId);
                    }
                }
            } catch (error) {
                console.error('Error loading user channel:', error);
            }
        }
        loadUserChannel();
    }, [accessToken]);

    const tabs = useMemo(() => [
        { name: 'dashboard', component: <Dashboard channelId={userChannelId} /> },
        { name: 'content', component: <Content /> },
        // { name: 'analytics', component: <Analytics /> },
        { name: 'community', component: <Community channelId={userChannelId} /> },
        { name: 'store', component: <Store /> },
        // { name: 'earn', component: <Earn /> },
        { name: 'customization', component: <Customization channelId={userChannelId} /> }
    ], [userChannelId]);

    // Find the index of the section in the URL, default to 0
    const activeTabIndex = useMemo(() => {
        const index = tabs.findIndex(tab => tab.name === section);
        return index > -1 ? index : 0;
    }, [section, tabs]);

    const handleTabClick = (index) => {
        const newSection = tabs[index].name;
        setSearchParams({ section: newSection });
    };

    const ActiveComponent = tabs[activeTabIndex].component;

    if (!accessToken) {
        return (
            <div>
                <Header></Header>
                <SidebarStudio activeTabIndex={0} onTabClick={() => { }}></SidebarStudio>
                <div className="container-studio">
                    <h1>Access Denied</h1>
                    <p>You must be logged in to access the studio.</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <main>
                <Header></Header>
                <SidebarStudio activeTabIndex={activeTabIndex} onTabClick={handleTabClick}></SidebarStudio>
                <div className="container-studio">
                    {React.cloneElement(ActiveComponent, { key: componentKey })}
                    {/* <Footer footer="footer-studio"></Footer> */}
                </div>
                <RightMenu channelId={userChannelId}></RightMenu>
            </main>
            {/* <Footer footer="footer-studio"></Footer> */}
        </>
    );
}

export default Studio;
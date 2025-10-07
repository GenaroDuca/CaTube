import "../YourChannelPage/YourChannelPage.css";
import "../HomePage/HomePage.css";
import "../../styles/Global_components.css";
import "../StudioPage/StudioPage.css";
import SidebarStudio from "../../components/studioPageComponents/SidebarStudio.jsx";
import Footer from "../../hooks/Footer.jsx";
import Dashboard from "../../components/studioPageComponents/dashboard/Dashboard.jsx";
import Content from "../../components/studioPageComponents/content/Content.jsx";
import Analytics from "../../components/studioPageComponents/analytics/Analytics.jsx";
import Community from "../../components/studioPageComponents/community/Community.jsx";
import Store from "../../components/studioPageComponents/store/Store.jsx";
import Earn from "../../components/studioPageComponents/earn/earn.jsx";
import Customization from "../../components/studioPageComponents/customization/Customization.jsx";
import RightMenu from "../../components/studioPageComponents/RightMenu.jsx";
import { useState } from "react";
import Header from "../../components/common/header/Header.jsx";
import { useSearchParams } from "react-router-dom";


function Studio() {
    const [searchParams] = useSearchParams();
    const section = searchParams.get('section');
    const tabs = [
        { name: 'dashboard', component: <Dashboard /> },
        { name: 'content', component: <Content /> },
        { name: 'analytics', component: <Analytics /> },
        { name: 'community', component: <Community /> },
        { name: 'store', component: <Store /> },
        { name: 'earn', component: <Earn /> },
        { name: 'customization', component: <Customization /> }
    ];

    // Encuentra el índice de la sección que está en la URL, si no, usa el 0
    const initialTabIndex = tabs.findIndex(tab => tab.name === section) > -1 ? tabs.findIndex(tab => tab.name === section) : 0;
    const [activeTab, setActiveTab] = useState(initialTabIndex);

    return (
        <>
            <>
                <main>
                    <Header></Header>
                    <SidebarStudio activeTabIndex={activeTab} onTabClick={setActiveTab}></SidebarStudio>
                    <div className="container-studio">
                        {tabs[activeTab].component}
                        <Footer footer="footer-studio"></Footer>
                    </div>
                    <RightMenu></RightMenu>
                </main>
            </>
        </>
    );
}

export default Studio;
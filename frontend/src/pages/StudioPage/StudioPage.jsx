import "../YourChannelPage/YourChannelPage.css";
import "../HomePage/HomePage.css";
import "../../styles/Global_components.css";
import "../StudioPage/StudioPage.css";
import SidebarStudio from "../../components/studioPageComponents/SidebarStudio.jsx";
import Footer from "../../components/common/Footer.jsx";
import Dashboard from "../../components/studioPageComponents/dashboard/Dashboard.jsx";
import Content from "../../components/studioPageComponents/content/Content.jsx";
import Analytics from "../../components/studioPageComponents/analytics/Analytics.jsx";
import Community from "../../components/studioPageComponents/community/Community.jsx";
import Store from "../../components/studioPageComponents/store/Store.jsx";
import Earn from "../../components/studioPageComponents/earn/earn.jsx";
import Customization from "../../components/studioPageComponents/customization/Customization.jsx";
import RightMenu from "../../components/studioPageComponents/RightMenu.jsx";
import { useMemo } from "react";
import Header from "../../components/common/header/Header.jsx";
import { useSearchParams } from "react-router-dom";


function Studio() {
    const [searchParams, setSearchParams] = useSearchParams();
    const section = searchParams.get('section') || 'dashboard';
    const tabs = useMemo(() => [
        { name: 'dashboard', component: <Dashboard /> },
        { name: 'content', component: <Content /> },
        { name: 'analytics', component: <Analytics /> },
        { name: 'community', component: <Community /> },
        { name: 'store', component: <Store /> },
        { name: 'earn', component: <Earn /> },
        { name: 'customization', component: <Customization /> }
    ], []);

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

    return (
        <>
            <>
                <main>
                    <Header></Header>
                    <SidebarStudio activeTabIndex={activeTabIndex} onTabClick={handleTabClick}></SidebarStudio>
                    <div className="container-studio">
                        {ActiveComponent}
                        <Footer footer="footer-studio"></Footer>
                    </div>
                    <RightMenu></RightMenu>
                </main>
            </>
        </>
    );
}

export default Studio;
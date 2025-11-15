import Sidebar from "../../components/common/Sidebar.jsx";
import Youprofile from "../../components/youPageComponents/Youprofile.jsx";
import SectionsCarousel from "../../components/homePageComponents/SectionsCarousel.jsx";
import Footer from "../../components/common/Footer.jsx";
import Sectionyou from "../../components/youPageComponents/Sectionyou.jsx";
import deleted from "../../assets/images/yourChannel_media/Delete.png"
import ViewMoreAllSection from "../../components/youPageComponents/ViewMoreAllSection";
import Header from "../../components/common/header/Header.jsx";
import { historyvideo, playlistvideo, viewlatervideo, likedvideo, ViewLaterData, myPlaylistsData } from "../../assets/data/Data.jsx";
import { useRef } from "react";
import '../../styles/Global_components.css'
import '../HomePage/HomePage.css'
import '../YourChannelPage/YourChannelPage.css'
import '../YouPage/YouPage.css'


function You() {
    const HistoryRef = useRef(null);
    const PlaylistRef = useRef(null);
    const ViewLaterRef = useRef(null);
    const LikedRef = useRef(null);

    return (
        <>
                <Header></Header>
                <Sidebar>
                </Sidebar>

                <main className="main-content">
                    <Youprofile></Youprofile>
                    <Sectionyou btnclass="btn-trash" section="trending" subtitle="History" ref={HistoryRef} render={historyvideo} startExpanded={true} cts="carousel-ctsvideos" ><img src={deleted} alt="Delete history"/> </Sectionyou>
                    <Sectionyou btnclass="btn-viewall-playlists" btntitle="View more" section="trending" subtitle="Playlists" ref={PlaylistRef} render={playlistvideo} expandedContent={<ViewMoreAllSection render={myPlaylistsData}/>} cts="carousel-ctsvideos" >   </Sectionyou>
                    <Sectionyou btnclass="btn-viewall-playlists" btntitle="View all" section="trending" subtitle="View Later" ref={ViewLaterRef} render={viewlatervideo} expandedContent={<ViewMoreAllSection render={ViewLaterData} />} cts="carousel-ctsvideos" > </Sectionyou>
                    <SectionsCarousel section="trending" subtitle="Liked" ref={LikedRef} render={likedvideo} type="video" cts="carousel-ctsvideos" ></SectionsCarousel>
                    <Footer footer="footer"></Footer>
                </main>
        </>
    );
}

export default You;
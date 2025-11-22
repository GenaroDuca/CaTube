import Sidebar from "../../components/common/Sidebar.jsx";
import Youprofile from "../../components/youPageComponents/Youprofile.jsx";
import SectionsCarousel from "../../components/homePageComponents/SectionsCarousel.jsx";
import Footer from "../../components/common/Footer.jsx";
import Sectionyou from "../../components/youPageComponents/Sectionyou.jsx";
import deleted from "../../assets/images/yourChannel_media/Delete.png";
import Header from "../../components/common/header/Header.jsx";
import { useRef, useState } from "react";

// Importaciones de estilos
import '../../styles/Global_components.css';
import '../HomePage/HomePage.css';
import '../YourChannelPage/YourChannelPage.css';
import '../YouPage/YouPage.css';

function You() {
    const HistoryRef = useRef(null);
    const PlaylistRef = useRef(null);
    const ViewLaterRef = useRef(null);
    const LikedRef = useRef(null);

    return (
        <>
            <Header />
            <Sidebar />

            <main className="main-content">
                <Youprofile />

                {/* --- History (MODIFICADO para usar datos de backend) --- */}
                {/* <Sectionyou
                    btnclass="btn-trash"
                    section="trending"
                    subtitle="History"
                    ref={HistoryRef}
                    startExpanded={true}
                    cts="carousel-ctsvideos"
                >
                    <img src={deleted} alt="Delete history" />
                </Sectionyou> */}

                {/* --- View Later (MODIFICADO para usar datos de backend) --- */}
                {/* <Sectionyou
                    btnclass="btn-viewall-playlists"
                    btntitle="View all"
                    section="trending"
                    subtitle="View Later"
                    ref={ViewLaterRef}
                    cts="carousel-ctsvideos"
                /> */}

                {/* --- Liked (MODIFICADO para usar datos de backend) --- */}
                {/* <SectionsCarousel
                    section="trending"
                    subtitle="Liked"
                    ref={LikedRef}
                    type="video"
                    cts="carousel-ctsvideos" >
                </SectionsCarousel> */}

                <Footer footer="footer" />
            </main >

        </>
    );
}

export default You;
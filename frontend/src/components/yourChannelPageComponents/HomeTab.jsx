import Container from "../common/Container";
import ContainerChannel from "../../components/yourChannelPageComponents/ContainerChannel";
import Sections from "../../components/homePageComponents/Sections"
import { useRef } from "react";
import { foryouvideos, shortsyc, videosyc } from "../../assets/data/Data";

function HomeTab() {
    const foryouRef = useRef(null);
    const videosRef = useRef(null);
    const shortsRef = useRef(null);
    return (
            <>
            <Container className="content-table">
            <ContainerChannel>
            </ContainerChannel>
            </Container>
            <Sections section="subscriptions" subtitle="For you" ref={foryouRef} render={foryouvideos} type="video" cts="carousel-ctsvideos" ></Sections>
            <Sections section="subscriptions" subtitle="Videos" ref={videosRef} render={videosyc} type="video" cts="carousel-ctsvideos" ></Sections>
            <Sections section="subscriptions" subtitle="Shorts" ref={shortsRef} render={shortsyc} type="short" cts="carousel-ctshorts" ></Sections>
        </>
    );
}

export default HomeTab
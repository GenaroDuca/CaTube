import Container from "../../../hooks/Container";
import Title from "../../trendingPageComponents/Title";
import VideoCommunity from "./VideoCommunity";

function Community() {
    return (
        <>
            <Title title="Community"></Title>
            <hr></hr>
            <Container className="content">
                    <VideoCommunity></VideoCommunity>
            </Container>
        </>
    );
}

export default Community;
import Container from "../../common/Container";
import Title from "../../trendingPageComponents/Title";
import VideoCommunity from "./VideoCommunity";

function Community({ channelId }) {
    return (
        <>
            <Title title="Community"></Title>
            <Container className="content">
                <VideoCommunity channelId={channelId}></VideoCommunity>
            </Container>
        </>
    );
}

export default Community;

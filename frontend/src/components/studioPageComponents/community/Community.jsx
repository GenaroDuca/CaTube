import Container from "../../common/Container";
import Title from "../../trendingPageComponents/Title";
import VideoCommunity from "./VideoCommunity";

    function Community() {
    return (
        <>
            <Title title="Community"></Title>
            <Container className="content">
                    <VideoCommunity></VideoCommunity>
            </Container>
        </>
    );
}

export default Community;

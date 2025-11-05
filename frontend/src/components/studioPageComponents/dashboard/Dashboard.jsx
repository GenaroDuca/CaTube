import LatestComments from "./LatestComments";
import RecentCatscribers from "./RecentsCatscribers";
import Title from "../../TrendingPageComponents/Title"
import Container from "../../common/Container";
import LatestVideo from "./LatestVideo";

function Dashboard({ channelId }) {
    return (
        <>
            <Title title="Dashboard"></Title>
            <hr></hr>
            <Container className="content">
                <Container className="cards-container">
                    <Container className="three-cards">
                        <LatestVideo></LatestVideo>
                        <LatestComments></LatestComments>
                        <RecentCatscribers channelId={channelId}></RecentCatscribers>
                    </Container>
                </Container>
            </Container>
        </>
    );
}

export default Dashboard;
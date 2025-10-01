import LatestComments from "./LatestComments";
import RecentCatscribers from "./RecentsCatscribers";
import Title from "../../Trending/Title"
import Container from "../../hooks/Container";
import LatestVideo from "./LatestVideo";

function Dashboard() {
    return (
        <>
            <Title title="Dashboard"></Title>
            <hr></hr>
            <Container className="content">
                <Container className="cards-container">
                    <Container className="three-cards">
                        <LatestVideo></LatestVideo>
                        <LatestComments></LatestComments>
                        <RecentCatscribers totalsubs="105.000"></RecentCatscribers>
                    </Container>
                </Container>
            </Container>
        </>
    );
}

export default Dashboard;
import { recentSubscribers } from "../../../../assets/data/Data";
import Subtitle from "../../home/Subtitle";
import Container from "../../hooks/Container";

function RecentCatscribers(props) {
    return (
        <Container className="dashboard-card">
            <Subtitle subtitle="Recent Catscribers"></Subtitle>
            <Container className="recent-cats-container">
                {recentSubscribers.map(subscriber => (
                    <Container key={subscriber.id} className="recent-cats">
                        <img className="userphoto-recent-cats" src={subscriber.photo} alt={subscriber.username} />
                        <Container>
                            <p>{subscriber.username}</p>
                            <p>{subscriber.subscriberCount}</p>
                        </Container>
                    </Container>
                ))}
            </Container>
            <Subtitle subtitle="Currents Catscribers"></Subtitle>
            <p className="sub-number">{props.totalsubs}</p>
        </Container>
    );
}

export default RecentCatscribers;
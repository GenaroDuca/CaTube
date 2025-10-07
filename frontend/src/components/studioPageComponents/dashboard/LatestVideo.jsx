import { latesVideoIcons } from "../../../assets/data/Data";
import duki from "../../../assets/images/yourChannel_media/thumbnails/duki.jpeg"
import Container from "../../../hooks/Container";
import Subtitle from "../../homePageComponents/Subtitle";

function LatestVideo() {
    return (
        <>
            <Container className="dashboard-card">
                <Subtitle subtitle="Latest Video performance"></Subtitle>
                <img className="latest-video" src={duki}
                    alt="video"></img>
                <Container className="lca-dashboard">
                    {latesVideoIcons.map((item) => (
                        <Container key={item.id}>
                            <img src={item.icon} alt={item.alt}></img>
                            <div id="likeCount">{item.count}</div>
                        </Container>
                    ))
                    }
                </Container>
            </Container >
        </>
    );
}

export default LatestVideo;
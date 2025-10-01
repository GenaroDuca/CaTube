import Container from "../../hooks/Container";
import LcaCommunity from "./LcaCommunity"
import { videoCommunityData } from "../../../../assets/data/Data";

function VideoCommunity() {
    return (
        <>
            {videoCommunityData.map((item, index) => (
                <Container className="video-community" key={index}>
                    <Container className="user-container">
                        <img className="userphoto-community" src={item.userPhoto} alt={item.username}></img>
                        <Container className="use-info-container">
                            <p className="username">{item.username}</p>
                            <p className="user-message-community">{item.message}</p>
                            <LcaCommunity></LcaCommunity>
                        </Container>
                    </Container>
                    <Container className="video">
                        <img className="video-commented-community" src={item.thumbnail} alt={item.alt}></img>
                        <p>{item.description}</p>
                    </Container>
                </Container>
            ))}
        </>
    );
}

export default VideoCommunity;
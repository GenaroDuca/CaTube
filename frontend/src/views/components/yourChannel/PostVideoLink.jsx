import Container from "../hooks/Container";

function PostVideoLink(props) {
    return (
        <Container className="container-row-posts">
            <Container className="video-channel-posts">
                <Container className="video-thumbnail">
                    <img src={props.thumbnailSrc} alt={props.description} />
                    <Container className="video-titles">{props.videoTitle}</Container>
                </Container>
                <Container className="video-footer"></Container>
            </Container>
            <p>{props.description}</p>
        </Container>
    );
}

export default PostVideoLink;
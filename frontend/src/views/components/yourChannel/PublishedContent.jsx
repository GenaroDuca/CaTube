import RowButtons from "./RowButtons";
import deleted from "../../../assets/media/yourChannel_media/Delete.png"
import Container from "../hooks/Container";
import PostVideoLink from "./PostVideoLink";
import { unpublishedVideos } from "../../../assets/data/Data";

function PublishedContent() {
    return (
        <Container id="publishedSection" className="content-table-posts">
            <Container className="postsOptions">
                <p>Visibility: Private</p>
                <p className="space">NEW MASIVE VIDEOOOOOOS!! GO GO GO!!</p>
                <Container className="container-column">
                    <Container className="container-row">
                        {unpublishedVideos.map(video => (
                            <PostVideoLink
                                key={video.id}
                                thumbnailSrc={video.thumbnail}
                                videoTitle={video.title}
                            />
                        ))}
                    </Container>
                </Container>
                <RowButtons btntitle="Archive post" name="delete" src={deleted} ></RowButtons>
            </Container>
        </Container>
    );
}

export default PublishedContent;
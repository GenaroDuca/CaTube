import Container from "../hooks/Container";
import RowButtons from "./RowButtons";
import PostVideoLink from "./PostVideoLink";
import { postVideos} from "../../../assets/data/Data";
import deleted from "../../../assets/media/yourChannel_media/Delete.png"

function ArchivedContent() {
    return (
        <Container id="archivedSection" className="content-table-posts">
            <Container className="postsOptions">
                <p> What series do you want to see first?</p>
                {postVideos.map(video => (
                    <PostVideoLink
                        key={video.id} 
                        thumbnailSrc={video.thumbnail}
                        videoTitle={video.title}
                        description={video.description}
                    />
                ))}
                <RowButtons btntitle="Unarchive" name="delete" src={deleted} ></RowButtons>
            </Container>
        </Container>
    );
}

export default ArchivedContent;
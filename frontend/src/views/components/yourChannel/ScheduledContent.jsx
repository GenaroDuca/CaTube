import Container from "../hooks/Container";
import RowButtons from "./RowButtons";
import deleted from "../../../assets/media/yourChannel_media/Delete.png"

function ScheduledContent() {
    return (
        <Container id="scheduledSection" className="content-table-posts">
            <Container className="postsOptions">
                <p>Will be published in: 3 days</p>
                <p className="space">Would you like a new Roleyplay series in Ark: Survival Evolved?</p>
                <Container className="options">
                    <p>I would like it a lot</p>
                </Container>
                <Container className="options">
                    <p>MEH</p>
                </Container>
                <RowButtons btntitle="Post now" name="delete" src={deleted} ></RowButtons>
            </Container>
        </Container>
    );
}

export default ScheduledContent;
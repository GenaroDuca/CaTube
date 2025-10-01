import Subtitle from "../home/Subtitle";
import Container from "../hooks/Container";
import RowIcons from "./RowIcons";
import ContainerButton from "./ContainerButton";
import PublishedContent from "./PublishedContent";
import ScheduledContent from "./ScheduledContent";
import ArchivedContent from "./ArchivedContent";
import { useState } from 'react';

function PostsTab() {
    const postTabLabels = ['Published', 'Scheduled', 'Archived'];
    const postTabContents = [
        <PublishedContent />,
        <ScheduledContent />,
        <ArchivedContent />
    ];
    const [activePostTabIndex, setActivePostTabIndex] = useState(0);

    return (
        <>
            <Container className="content-table">
                <Container className="main-content-posts">
                    <Container className="postsOptions">
                        <Subtitle subtitle="Visibility: Public" > </Subtitle>
                        <input type="text" className="input-posts" placeholder="Share a sneak peek of your next video" />
                        <RowIcons>
                        </RowIcons>
                    </Container>
                    <ContainerButton containerName="container-button" buttonClass="nav-btn-posts" tabs={postTabLabels} activeTabIndex={activePostTabIndex} onTabClick={setActivePostTabIndex}></ContainerButton>
                    <div className="post-content-container">
                        {postTabContents[activePostTabIndex]}
                    </div>
                </Container>
            </Container>
        </>
    );
}

export default PostsTab;
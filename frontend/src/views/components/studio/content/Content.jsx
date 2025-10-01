import Title from "../../Trending/Title"
import Container from "../../hooks/Container"
import FilterBar from "./FilterBar"
import VideoContent from "./VideoContent";
import { videosContent } from "../../../../assets/data/Data";
import { shortsContent } from "../../../../assets/data/Data";
import { playlistsContent } from "../../../../assets/data/Data";
import { useState } from "react";

function Content() {
const [activeContent, setActiveContent] = useState('Videos');
    return( 
    <>
            <Title title="Content"></Title>
            <hr></hr>
            <Container className="content">
            <FilterBar activeFilter={activeContent} onFilterChange={setActiveContent} ></FilterBar>
            {activeContent === 'Videos' && <VideoContent content={videosContent} contentType={activeContent}/>}
            {activeContent === 'Shorts' && <VideoContent content={shortsContent} contentType={activeContent} />}
            {activeContent === 'Playlists' && <VideoContent content={playlistsContent} contentType={activeContent} />}
            </Container>
    </>
    );
}

export default Content;
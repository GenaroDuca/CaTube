import Container from "../hooks/Container";
import Item from "./Item";

function ViewMoreAllSection(props) {
    return (
        <Container className="playlistSection">
            <div className="playlistContent">
                {props.render.map(playlist => (
                    <Item
                        key={playlist.id}
                        thumbnail={playlist.thumbnail}
                        videoCount={playlist.videoCount}
                        name={playlist.name}
                        visibility={playlist.visibility}
                        url={playlist.url}
                    />
                ))}
            </div>
        </Container>
    );
}

export default ViewMoreAllSection;
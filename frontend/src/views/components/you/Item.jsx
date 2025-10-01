function Item(props) {
    return (
        <div className="playlist">
            <div className="thumbPlaylistContainer">
                <img src={props.thumbnail} alt={`Thumbnail for ${props.name}`} className="playlistThumb" />
                <span className="playlistVideosCount">{props.videoCount} videos</span>
            </div>
            <h3>{props.name}</h3>
            <select name="visibility" defaultValue={props.visibility}>
                <option value="public">Public</option>
                <option value="private">Private</option>
            </select>
            <a href="">View full playlist</a>
        </div>
    );
}

export default Item;
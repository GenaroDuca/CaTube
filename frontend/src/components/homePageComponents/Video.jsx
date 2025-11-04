function Video(props){
return (
        <div className="video-card">
        <img className="video-thumbnail" src={`http://localhost:3000${props.thumbnail}`} alt={props.namevideo} />
        <p className="name-channel">{props.namevideo}</p>
        <p className="subs-channel">{props.videoviews}</p>
        </div>
);
}
export default Video;
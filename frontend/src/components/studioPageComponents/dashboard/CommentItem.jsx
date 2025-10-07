function CommentItem(props) {
    return (
        <div className="video-dashboard">
            <img className="userphoto-dashboard" src={props.userPhoto} alt={props.username} />
            <div className="user">
                <p className="username-dashboard">{props.username}</p>
                <p className="user-message-dashboard">{props.message}</p>
            </div>
            <img className="video-commented-dashboard" src={props.videoThumbnail} alt="Video thumbnail" />
        </div>
    );
}

export default CommentItem;
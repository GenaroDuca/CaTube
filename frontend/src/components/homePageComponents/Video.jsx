import './Video.css';

function getTimeAgo(dateInput) {
        const date = new Date(dateInput); // Ensure dateInput is parsed into a Date object
        const seconds = Math.floor((new Date() - date) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";

        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";

        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";

        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";

        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";

        return Math.floor(seconds) + " seconds ago";
}



function Video(props) {
        // Handle thumbnail URL properly
        let thumbnailSrc = props.thumbnail || props.photo || '';

        return (
                <div className="video-card">
                        <img className="video-thumbnail" src={thumbnailSrc} alt={props.namevideo} />
                        <p className="name-channel">{props.namevideo}</p>
                        <div>
                                <p className="video-views">{props.videoviews}</p>
                                <p className="video-upload-date" style={{ color: '#90b484' }}>{getTimeAgo(props.createdAt)}</p>
                        </div>
                </div>
        );
}
export default Video;

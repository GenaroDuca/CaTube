import './Video.css';

function getTimeAgo(dateInput) {
    const date = new Date(dateInput);
    
    const msDifference = Math.abs(new Date() - date);
    const seconds = Math.floor(msDifference / 1000);

    let interval = seconds / 31536000;
    if (interval >= 1) {
        const time = Math.floor(interval);
        const unit = time === 1 ? "year" : "years";
        return `${time} ${unit} ago`;
    }

    interval = seconds / 2592000;
    if (interval >= 1) {
        const time = Math.floor(interval);
        const unit = time === 1 ? "month" : "months";
        return `${time} ${unit} ago`;
    }

    interval = seconds / 86400;
    if (interval >= 1) {
        const time = Math.floor(interval);
        const unit = time === 1 ? "day" : "days";
        return `${time} ${unit} ago`;
    }

    interval = seconds / 3600;
    if (interval >= 1) {
        const time = Math.floor(interval);
        const unit = time === 1 ? "hour" : "hours";
        return `${time} ${unit} ago`;
    }

    interval = seconds / 60;
    if (interval >= 1) {
        const time = Math.floor(interval);
        const unit = time === 1 ? "minute" : "minutes";
        return `${time} ${unit} ago`;
    }

    // If less than 60 seconds
    const time = Math.floor(seconds);
    // Note: It's common to use "just now" for very small time differences (e.g., < 5s)
    if (time < 5) {
        return "just now";
    }
    const unit = time === 1 ? "second" : "seconds";
    return `${time} ${unit} ago`;
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

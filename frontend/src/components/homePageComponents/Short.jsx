import { VITE_API_URL } from '../../../config';

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

function Short(props) {
        // Handle photo URL properly
        let photoSrc = props.thumbnail || '';

        return (
                <div className="short-card">
                        <img className="short" src={photoSrc} alt={props.nameshort} />
                        <p className="name-channel">{props.nameshort}</p>
                        <div>
                                <p className="subs-channel">{props.shortviews}</p>
                                <p className="subs-channel" style={{ color: '#90b484' }}>{getTimeAgo(props.createdAt)}</p>
                        </div>
                </div>
        );
}
export default Short;
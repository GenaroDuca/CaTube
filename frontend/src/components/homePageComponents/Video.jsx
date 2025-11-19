import './Video.css';
import { API_URL } from '../../../config';

function Video(props) {
        // Handle thumbnail URL properly
        let thumbnailSrc = props.thumbnail || props.photo || '';
        if (thumbnailSrc && !thumbnailSrc.startsWith('http')) {
                thumbnailSrc = `${API_URL}${thumbnailSrc}`;
        }

        return (
                <div className="video-card">
                        <img className="video-thumbnail" src={thumbnailSrc} alt={props.namevideo} />
                        <p className="name-channel">{props.namevideo}</p>
                        <p className="subs-channel">{props.videoviews}</p>
                </div>
        );
}
export default Video;

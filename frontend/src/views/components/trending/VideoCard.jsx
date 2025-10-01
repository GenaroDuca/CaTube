import {trending} from "../../../assets/data/Data.jsx";
import duki from '../../../assets/media/yourChannel_media/thumbnails/duki.jpeg'

function VideoCard() {
    return (
        <>
            {trending.map((video, idx) => (
                <a className="trending-video-card" href="/watch_videos/watch_videos.html" key={idx}>
                    <img src={duki} alt="Video Thumbnail" />
                    <div className="trending-video-info">
                        <h4>{video.title}</h4>
                        <p>{video.nombre}</p>
                        <div>
                            <p>{video.vistas}</p>
                            <p>{video.ano}</p>
                        </div>
                        <p>{video.description}</p>
                    </div>
                </a>
            ))}
        </>
    );
}

export default VideoCard;
//react
import { useMemo } from "react"
import { useRef } from "react";

//components
import { CatubeSubsCard } from "../../components/user/CatubeSubsCard.jsx"
import { useVideoControl } from "../../hooks/useVideoControl.jsx";
import { VolumeControl } from "../../components/videoPageComponents/volumeControl.jsx";

//styles
import './WatchVideo.css'
import '../user/CatubeSubsCard.css'
import { FaCirclePlay } from "react-icons/fa6";
import { FaCirclePause } from "react-icons/fa6";
import { FaHeart } from "react-icons/fa";
import { IoHeartDislike } from "react-icons/io5";
import { FaShare } from "react-icons/fa";
import { FiMinimize2 } from "react-icons/fi";
import { FiMaximize2 } from "react-icons/fi";
import { SlOptionsVertical } from "react-icons/sl";
import { BsSkipStartFill } from "react-icons/bs";
import { BsSkipEndFill } from "react-icons/bs";
import { TbLayoutSidebarRightCollapseFilled } from "react-icons/tb";
import { TbLayoutSidebarRightExpandFilled } from "react-icons/tb";

//assets
import Angel from '../../assets/images/profile/angel.jpg'
import Gena from '../../assets/images/profile/gena.jpg'
import Jere from '../../assets/images/profile/jere.jpg'
import Yukki from '../../assets/images/profile/yukki.jpg'
import video from "../../assets/videos/channel-video-proof.mp4"

export function WatchVideo({ url, title, avatar, userName, description, subscriptions, channelId, onTheaterToggle }) {
    const videoRef = useRef(null);
    const {
        isPlaying,
        volume,
        isMuted,
        isTheaterMode,
        isFullScreen,
        togglePlayPause,
        changeVolume,
        skipTime,
        toggleTheaterMode,
        toggleFullScreen
    } = useVideoControl(videoRef, onTheaterToggle);

    const comments = useMemo(
        () => [
            { id: 1, avatar: Angel, userName: "Colithoxz", content: "Muy buen video" },
            { id: 2, avatar: Gena, userName: "Sheni", content: "Primeroooooo!" },
            { id: 3, avatar: Jere, userName: "Gazzard", content: "Mandame un saludo plssss" },
            { id: 4, avatar: Yukki, userName: "Yukki", content: "Goddddd" },
        ],
        []
    );

    return (
        <article className={`vv-displayVideo-container ${isTheaterMode ? 'theater-active' : ''}`}>
            <header className={`vv-displayVideo-header ${isTheaterMode ? 'theater-mode' : ''} ${isFullScreen ? 'full-screen' : ''}`}>
                <video className='vv-displayVideo' src={video} ref={videoRef} onClick={togglePlayPause} />
                <div className="vv-video-controls">
                    <div className="vv-video-leftControls">
                        <button onClick={() => skipTime(-10)}>
                            <BsSkipStartFill color=' rgb(144, 180, 132' size={25} />
                        </button>
                        <button onClick={togglePlayPause}>
                            {isPlaying ? <FaCirclePause color=' rgb(144, 180, 132' size={25} /> : <FaCirclePlay color=' rgb(144, 180, 132' size={25} />}
                        </button>
                        <button onClick={() => skipTime(10)}>
                            <BsSkipEndFill color=' rgb(144, 180, 132' size={25} />
                        </button>
                    </div>
                    <div className="vv-video-rightControls">
                        <VolumeControl volume={volume} isMuted={isMuted} changeVolume={changeVolume} />

                        <button onClick={toggleTheaterMode}>
                            {isTheaterMode ? <TbLayoutSidebarRightExpandFilled color=' rgb(144, 180, 132' size={25} />

                                : < TbLayoutSidebarRightCollapseFilled color=' rgb(144, 180, 132' size={25} />
                            }
                        </button>
                        <button onClick={toggleFullScreen}>
                            {isFullScreen ? <FiMinimize2 color=' rgb(144, 180, 132' size={25} /> : <FiMaximize2 color=' rgb(144, 180, 132' size={25} />}
                        </button>
                    </div>
                </div>
            </header>
            <div>
                <h3 className='vv-displayVideo-title'>{title}</h3>
                <div className="vv-displayVideo-userActions">
                    <CatubeSubsCard avatar={avatar} userName={userName} subscriptions={subscriptions} channelId={channelId} />
                    <section>
                        <button className="like-btn"><FaHeart  color='#777878' size={22}  /></button>
                        <button className="dislike-btn"><IoHeartDislike color=' #777878' size={25} /></button>
                        <button className="share-btn"> <FaShare color=' #777878' size={25} /> </button>
                        <button className="options-btn"><SlOptionsVertical color=' #777878' size={20} /> </button>
                    </section>
                </div>
            </div>
            <div className="vv-displayVideo-description">
                <h3> Video Description</h3>
                <p>{description}</p>
            </div>
            <div className="vv-displayVideo-comments">
                <h2>Comments</h2>
                {comments.map(comment => (
                    <div key={comment.id} className="comment">
                        <div className="comment-header">
                            <img className="comment-avatar" src={comment.avatar} alt={`${comment.userName} avatar`} />
                            <h3 className="comment-username">{comment.userName}</h3>
                        </div>
                        <div>
                            <p className="comment-content">{comment.content}</p>
                            <input className='comment-input' type="text" placeholder="reply comment" />
                        </div>
                    </div>
                ))}
            </div>
        </article>
    )
}

export default WatchVideo;
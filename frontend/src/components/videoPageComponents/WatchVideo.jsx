//react
import { useMemo } from "react"
import { useRef } from "react";

//components
import { CatubeSubsCard } from "../user/CatubeSubsCard.jsx"
import { useVideoControl } from "../../hooks/useVideoControl.jsx";
import { VolumeControl } from "./volumeControl.jsx";

//styles
import './WatchVideo.css'
import '../user/CatubeSubsCard.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faThumbsUp, faThumbsDown, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { TbRectangleFilled, TbRectangle } from "react-icons/tb";
import { RiFullscreenLine, RiFullscreenExitLine } from "react-icons/ri";
import { IoPlaySkipForward, IoPlaySkipBack } from "react-icons/io5";
import { FaPlay, FaPause } from "react-icons/fa";

//assets
import Angel from '../../assets/images/profile/angel.jpg'
import Gena from '../../assets/images/profile/gena.jpg'
import Jere from '../../assets/images/profile/jere.jpg'
import Yukki from '../../assets/images/profile/yukki.jpg'

export function WatchVideo ({url, title, avatar, userName, description, subscriptions, channelId, onTheaterToggle}) {
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
                <video className='vv-displayVideo' src={url} ref={videoRef} onClick={togglePlayPause} />
                <div className="vv-video-controls">
                    <div className="vv-video-leftControls">
                        <button onClick={() => skipTime(-10)}>
                            <IoPlaySkipBack />
                        </button>
                        <button onClick={togglePlayPause}>
                            {isPlaying ? <FaPause /> : <FaPlay />}
                        </button>
                        <button onClick={() => skipTime(10)}>
                            <IoPlaySkipForward />
                        </button>
                    </div>
                    <div className="vv-video-rightControls">
                        <VolumeControl volume={volume} isMuted={isMuted} changeVolume={changeVolume} />
                        <button onClick={toggleTheaterMode}>
                            {isTheaterMode ? <TbRectangle /> : <TbRectangleFilled />}
                        </button>
                        <button onClick={toggleFullScreen}>
                            {isFullScreen ? <RiFullscreenExitLine /> : <RiFullscreenLine />}
                        </button>
                    </div>
                </div>
            </header>
            <div>
                <h1 className='vv-displayVideo-title'>{title}</h1>
                <div className="vv-displayVideo-userActions">
                    <CatubeSubsCard avatar={avatar} userName={userName} subscriptions={subscriptions} channelId={channelId} />
                    <section>
                        <button className="like-btn"><FontAwesomeIcon className="like-btn-icon" icon={faThumbsUp}></FontAwesomeIcon></button>
                        <button className="dislike-btn"><FontAwesomeIcon className="dislike-btn-icon" icon={faThumbsDown}></FontAwesomeIcon></button>
                        <button className="options-btn"><FontAwesomeIcon className="options-btn-icon" icon={faEllipsisV}></FontAwesomeIcon></button>
                    </section>
                </div>
            </div>
            <div className="vv-displayVideo-description">
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
                            <input className='comment-input' type="text" placeholder="reply comment"/>
                        </div>
                    </div>
                ))}
            </div>
        </article>
    )
}

export default WatchVideo;
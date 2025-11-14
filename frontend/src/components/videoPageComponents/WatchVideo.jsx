import { useMemo, useRef } from "react";
import { CatubeSubsCard } from "../../components/user/CatubeSubsCard.jsx";
import { useVideoControl } from "../../hooks/useVideoControl.jsx";
import { VolumeControl } from "../../components/videoPageComponents/volumeControl.jsx";
import './WatchVideo.css';
import '../user/CatubeSubsCard.css';
import { FaCirclePlay, FaCirclePause, FaHeart, FaShare } from "react-icons/fa6";
import { IoHeartDislike } from "react-icons/io5";
import { FiMinimize2, FiMaximize2 } from "react-icons/fi";
import { SlOptionsVertical } from "react-icons/sl";
import { BsSkipStartFill, BsSkipEndFill } from "react-icons/bs";
import { TbLayoutSidebarRightCollapseFilled, TbLayoutSidebarRightExpandFilled } from "react-icons/tb";
import Angel from '../../assets/images/profile/angel.jpg';
import Gena from '../../assets/images/profile/gena.jpg';
import Jere from '../../assets/images/profile/jere.jpg';
import Yukki from '../../assets/images/profile/yukki.jpg';

export function WatchVideo({ url, title, avatar, userName, description, subscriptions, channelId, channelUrl, onTheaterToggle, tags }) {
    const videoRef = useRef(null);
    const {
        isPlaying,
        volume,
        isMuted,
        isTheaterMode,
        isFullScreen,
        progress,
        duration,
        togglePlayPause,
        changeVolume,
        skipTime,
        toggleTheaterMode,
        toggleFullScreen,
        handleSeek
    } = useVideoControl(videoRef, onTheaterToggle);

    const comments = useMemo(() => [
        { id: 1, avatar: Angel, userName: "Colithoxz", content: "Muy buen video" },
        { id: 2, avatar: Gena, userName: "Sheni", content: "Primeroooooo!" },
        { id: 3, avatar: Jere, userName: "Gazzard", content: "Mandame un saludo plssss" },
        { id: 4, avatar: Yukki, userName: "Yukki", content: "Goddddd" },
    ], []);

    // 🔹 Formatear tiempo (segundos → mm:ss)
    const formatTime = (seconds) => {
        if (isNaN(seconds)) return "0:00";
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <article className={`vv-displayVideo-container ${isTheaterMode ? 'theater-active' : ''}`}>
            <header className={`vv-displayVideo-header ${isTheaterMode ? 'theater-mode' : ''} ${isFullScreen ? 'full-screen' : ''}`}>
                <video
                    className='vv-displayVideo'
                    src={url}
                    ref={videoRef}
                    onClick={togglePlayPause}
                />

                {/* Barra de progreso */}
                <input
                    type="range"
                    className="vv-progress-bar"
                    min="0"
                    max={duration}
                    value={progress}
                    onChange={handleSeek}
                    style={{ "--progress": `${(progress / duration) * 100}%` }}
                />

                <div className="vv-video-controls">
                    <div className="vv-video-leftControls">
                        <button onClick={() => skipTime(-10)}>
                            <BsSkipStartFill color='rgb(144, 180, 132)' size={25} />
                        </button>
                        <button onClick={togglePlayPause}>
                            {isPlaying
                                ? <FaCirclePause color='rgb(144, 180, 132)' size={25} />
                                : <FaCirclePlay color='rgb(144, 180, 132)' size={25} />}
                        </button>
                        <button onClick={() => skipTime(10)}>
                            <BsSkipEndFill color='rgb(144, 180, 132)' size={25} />
                        </button>

                        {/* 🔹 Tiempo actual y duración */}
                        <span className="vv-time-display">
                            {formatTime(progress)} / {formatTime(duration)}
                        </span>
                    </div>

                    <div className="vv-video-rightControls">
                        <VolumeControl volume={volume} isMuted={isMuted} changeVolume={changeVolume} />
                        <button onClick={toggleTheaterMode}>
                            {isTheaterMode
                                ? <TbLayoutSidebarRightExpandFilled color='rgb(144, 180, 132)' size={25} />
                                : <TbLayoutSidebarRightCollapseFilled color='rgb(144, 180, 132)' size={25} />}
                        </button>
                        <button onClick={toggleFullScreen}>
                            {isFullScreen
                                ? <FiMinimize2 color='rgb(144, 180, 132)' size={25} />
                                : <FiMaximize2 color='rgb(144, 180, 132)' size={25} />}
                        </button>
                    </div>
                </div>
            </header>

            <div>
                <h3 className='vv-displayVideo-title'>{title}</h3>
                <div className="vv-displayVideo-userActions">
                    <CatubeSubsCard
                        avatar={avatar}
                        userName={userName}
                        subscriptions={subscriptions}
                        channelId={channelId}
                        channelUrl={channelUrl ? `/yourchannel/${channelUrl}` : undefined}
                    />
                    <section>
                        <button className="like-btn"><FaHeart color='#777878' size={22} /></button>
                        <button className="dislike-btn"><IoHeartDislike color='#777878' size={25} /></button>
                        <button className="share-btn"><FaShare color='#777878' size={25} /></button>
                        <button className="options-btn"><SlOptionsVertical color='#777878' size={20} /></button>
                    </section>
                </div>
            </div>

            <div className="vv-displayVideo-description">
                <div>
                    <h3>Video Description</h3>
                    <p>{description}</p>
                </div>

                <div className="vv-displayVideo-description-tags">
                    <h4>Video Tags</h4>
                    <div>
                        {tags.map(tags => (
                            <p>#{tags.name}</p>
                        ))}
                    </div>
                </div>
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
    );
}

export default WatchVideo;

import { useMemo, useRef, useEffect, useState } from "react";
import { CatubeSubsCard } from "../../components/user/CatubeSubsCard.jsx";
import { useAuth } from "../../../public/auth/AuthContext.jsx";
import { useVideoControl } from "../../hooks/useVideoControl.jsx";
import { VolumeControl } from "../../components/videoPageComponents/volumeControl.jsx";
import './WatchVideo.css';
import '../user/CatubeSubsCard.css';
import { FaCirclePlay, FaCirclePause, FaHeart, FaShare } from "react-icons/fa6";
import { IoHeartDislike } from "react-icons/io5";
import { FiMinimize2, FiMaximize2 } from "react-icons/fi";
import { BiSkipPrevious, BiSkipNext } from "react-icons/bi";
import { TbLayoutSidebarRightCollapseFilled, TbLayoutSidebarRightExpandFilled } from "react-icons/tb";
import { SlOptionsVertical } from "react-icons/sl";
import { Link } from "react-router-dom";
import ShareMenu from '../../components/videoPageComponents/ShareMenu.jsx'
import { CommentSection } from "../common/CommentSection.jsx";
import { useReaction } from "../../hooks/useReaction.jsx";
import VideoOptionsMenu from "./VideoOptionsMenu.jsx";

export function WatchVideo({ videoId, url, title, avatar, userName, description, subscriptions, channelId, channelUrl, onTheaterToggle, tags, views, onNext, onPrev, hasNext, hasPrev, ownerId, thumbnail }) {
    const videoRef = useRef(null);

    const { user } = useAuth();
    const currentUserId = user?.userId;

    const isOwner = useMemo(() => {
        if (!currentUserId || !ownerId) return false;

        const normalizedCurrentId = String(currentUserId).trim();
        const normalizedOwnerId = String(ownerId).trim();

        return normalizedCurrentId === normalizedOwnerId;
    }, [currentUserId, ownerId]);


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
    } = useVideoControl(videoRef, onTheaterToggle, onNext);

    const [showControls, setShowControls] = useState(true);
    const controlsTimeoutRef = useRef(null);

    useEffect(() => {
        const handleMouseMove = () => {
            setShowControls(true);
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
            if (isFullScreen) {
                controlsTimeoutRef.current = setTimeout(() => {
                    setShowControls(false);
                }, 3000); // 3 seconds
            }
        };

        if (isFullScreen) {
            handleMouseMove(); // Iniciar timer al entrar a fullscreen
            window.addEventListener('mousemove', handleMouseMove);
        } else {
            setShowControls(true);
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, [isFullScreen]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(error => {
                console.warn("Autoplay prevented:", error);
            });
        }
    }, [url]);

    // Formatear tiempo (segundos -> mm:ss)
    const formatTime = (seconds) => {
        if (isNaN(seconds)) return "0:00";
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const {
        likes,
        dislikes,
        userReaction,
        react,
        removeReaction
    } = useReaction(videoId);

    return (
        <article className={`vv-displayVideo-container ${isTheaterMode ? 'theater-active' : ''}`}>
            <header className={`vv-displayVideo-header ${isTheaterMode ? 'theater-mode' : ''} ${isFullScreen ? 'full-screen' : ''} ${!showControls && isFullScreen ? 'controls-hidden' : ''}`}>
                <video
                    className='vv-displayVideo'
                    src={url}
                    ref={videoRef}
                    onClick={togglePlayPause}
                    autoPlay
                />

                {/* Barra de progreso */}
                <input
                    type="range"
                    className="vv-progress-bar"
                    min="0"
                    max={duration}
                    value={progress}
                    onChange={handleSeek}
                    style={{ "--progress": `${duration ? (progress / duration) * 100 : 0}%` }}
                />

                <div className="vv-video-controls">
                    <div className="vv-video-leftControls">
                        <button className="vv-video-leftControls-button" onClick={onPrev} disabled={!hasPrev} style={{ opacity: hasPrev ? 1 : 0.5 }}>
                            <BiSkipPrevious color='rgb(144, 180, 132)' size={30} />
                        </button>
                        <button onClick={togglePlayPause}>
                            {isPlaying
                                ? <FaCirclePause color='rgb(144, 180, 132)' size={25} />
                                : <FaCirclePlay color='rgb(144, 180, 132)' size={25} />}
                        </button>
                        <button className="vv-video-leftControls-button" onClick={onNext} disabled={!hasNext} style={{ opacity: hasNext ? 1 : 0.5 }}>
                            <BiSkipNext color='rgb(144, 180, 132)' size={30} />
                        </button>

                        {/* Tiempo actual y duración */}
                        <span className="vv-time-display">
                            {formatTime(progress)} / {formatTime(duration)}
                        </span>
                    </div>

                    <div className="vv-video-rightControls">
                        <VolumeControl volume={volume} isMuted={isMuted} changeVolume={changeVolume} />
                        {/* <button className="vv-video-rightControls-theaterMode" onClick={toggleTheaterMode}>
                            {isTheaterMode
                                ? <TbLayoutSidebarRightExpandFilled color='rgb(144, 180, 132)' size={25} />
                                : <TbLayoutSidebarRightCollapseFilled color='rgb(144, 180, 132)' size={25} />}
                        </button> */}
                        <button className="vv-video-rightControls-button" onClick={toggleFullScreen}>
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

                    {/* LÓGICA DE OCULTAR BOTÓN DE SUSCRIPCIÓN*/}
                    <CatubeSubsCard
                        avatar={avatar}
                        userName={userName}
                        subscriptions={subscriptions}
                        channelId={channelId}
                        channelUrl={channelUrl ? `/yourchannel/${channelUrl}` : undefined}
                        isOwner={isOwner}
                    />
                    {/* ------------------------------------------- */}

                    <section>
                        {/* LIKE */}
                        <span>
                            {likes}
                        </span>
                        <button
                            className="like-btn"
                            onClick={() => userReaction === "like" ? removeReaction() : react(true)}
                        >
                            <FaHeart
                                size={22}
                                color={userReaction === "like" ? "#90B484" : "#777878"}
                            />

                        </button>


                        {/* DISLIKE */}
                        <span >
                            {dislikes}
                        </span>
                        <button
                            className="dislike-btn"
                            onClick={() => userReaction === "dislike" ? removeReaction() : react(false)}
                        >
                            <IoHeartDislike
                                size={25}
                                color={userReaction === "dislike" ? "#e96765" : "#777878"}
                            />
                        </button>

                        <ShareMenu videoUrl={url} videoTitle={title} />
                        <VideoOptionsMenu
                            videoId={videoId}
                            title={title}
                            description={description}
                            thumbnail={thumbnail}
                            tags={tags}
                            contentType="Videos"
                            ownerId={ownerId}
                        />
                    </section>
                </div>
            </div>

            <div className="vv-displayVideo-description">
                <div>
                    <span style={{ color: "var(--btn)" }}>{views} views</span>
                </div>

                <div>
                    <h3>Video Description</h3>
                    <p>{description}</p>
                </div>

                <div className="vv-displayVideo-description-tags">
                    <h4>Video Tags</h4>
                    <div>
                        {tags.map(tag => (
                            <Link
                                key={tag.name}
                                to={`/discover?tag=${encodeURIComponent(tag.name)}`}
                                className="tag-link"
                            >
                                #{tag.name}
                            </Link>
                        ))}

                    </div>
                </div>
            </div>

            <div className="vv-displayVideo-comments">
                <h3>Comments</h3>
                <CommentSection videoId={videoId} />
            </div>
        </article>
    );
}

export default WatchVideo;
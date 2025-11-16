import React, { useRef, useState, useEffect, useMemo } from 'react'
import { FaCirclePlay } from "react-icons/fa6";
import { FaCirclePause } from "react-icons/fa6";
import { FaHeart } from "react-icons/fa";
import { IoHeartDislike } from "react-icons/io5";
import { FaShare } from "react-icons/fa";
import { FiMinimize2 } from "react-icons/fi";
import { FiMaximize2 } from "react-icons/fi";
import { ImVolumeMedium } from "react-icons/im";
import { ImVolumeMute2 } from "react-icons/im";
import { SlOptionsVertical } from "react-icons/sl";

//components
import { CatubeSubsCard } from "../../components/user/CatubeSubsCard.jsx"

//styles
import '../../components/user/CatubeSubsCard.css'

export function WatchShort({ url, title, avatar, userName, description, subscriptions, channelId }) {
    const videoRef = useRef(null)
    const [paused, setPaused] = useState(false)
    const [muted, setMuted] = useState(true)
    const [volume, setVolume] = useState(1)
    const [sliderVisible, setSliderVisible] = useState(false)
    const [isMaximized, setIsMaximized] = useState(false)

    useEffect(() => {
        const v = videoRef.current
        if (v) {
            v.muted = muted
            v.volume = volume
        }
    }, [])

    function togglePlay() {
        const v = videoRef.current
        if (!v) return
        if (v.paused) {
            v.play().catch((e) => console.error(e))
        } else {
            v.pause()
        }
    }

    function handlePlayPauseChange() {
        const v = videoRef.current
        if (!v) return
        setPaused(v.paused)
    }

    function toggleMute() {
        const v = videoRef.current
        if (!v) return
        v.muted = !v.muted
        setMuted(v.muted)
    }

    function onVolumeChange(e) {
        const v = videoRef.current
        const val = Number(e.target.value)
        setVolume(val)
        if (v) {
            v.volume = val
            if (val > 0 && v.muted) {
                v.muted = false
                setMuted(false)
            }
        }

        const slider = e.target
        const percent = val * 100
        slider.style.background = `linear-gradient(to right, rgb(144, 180, 132) ${percent}%, #1a1a1b ${percent}%)`
    }

    function onVideoClick(e) {
        const target = e.target
        if (target.tagName.toLowerCase() === 'video' || target.classList.contains('video-placeholder')) {
            togglePlay()
        }
    }

    function toggleMaximize() {
        setIsMaximized(!isMaximized)
    }

    const comments = useMemo(
        () => [
            { id: 1, avatar: '/assets/images/profile/default.png', userName: "Usuario1", content: "Muy buen short!" },
            { id: 2, avatar: '/assets/images/profile/default.png', userName: "Usuario2", content: "Genial!" },
        ],
        []
    );

    return (
        <article className={`ws-displayShort-container ${isMaximized ? 'maximized' : ''}`}>
            <header className={`ws-displayShort-header ${isMaximized ? 'maximized' : ''}`}>
                <div className="video-placeholder" onClick={onVideoClick}>
                    <video
                        id="shortVideo"
                        ref={videoRef}
                        src={url}
                        autoPlay
                        muted={muted}
                        loop
                        onPlay={handlePlayPauseChange}
                        onPause={handlePlayPauseChange}
                        onVolumeChange={handlePlayPauseChange}
                        style={{ width: '100%', height: '100%', objectFit: isMaximized ? 'contain' : 'cover' }}
                    />
                </div>
                <div className="ws-video-controls">
                    <div className="ws-video-leftControls">
                        <button onClick={togglePlay}>
                            {paused ? <FaCirclePlay color=' rgb(144, 180, 132' size={25} /> : <FaCirclePause color=' rgb(144, 180, 132' size={25} />}
                        </button>
                    </div>
                    <div className="ws-video-rightControls">
                        <div className="volume-control-container">
                            <button type="button" id="soundMuteBtn" className="action-button btn-sound" onClick={toggleMute}>
                                {muted ? <ImVolumeMute2 color=' rgb(144, 180, 132' size={25} /> : <ImVolumeMedium color=' rgb(144, 180, 132' size={25} />}
                            </button>
                            <input
                                type="range"
                                id="volumeSlider"
                                className={`volume-slider ${sliderVisible ? 'visible' : ''}`}
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={onVolumeChange}
                                aria-label="Volume"
                            />
                        </div>
                        <button onClick={toggleMaximize}>
                            {isMaximized ? <FiMinimize2 color=' rgb(144, 180, 132' size={25} /> : <FiMaximize2 color=' rgb(144, 180, 132' size={25} />}
                        </button>
                    </div>
                </div>
            </header>
            <div className="ws-short-info">
                <h3 className='ws-displayShort-title'>{title}</h3>
                <div className="ws-displayShort-userActions">
                    <CatubeSubsCard avatar={avatar} userName={userName} subscriptions={subscriptions} channelId={channelId} />
                    <section>
                        <button className="like-btn"><FaHeart color='#777878' size={22} /></button>
                        <button className="dislike-btn"><IoHeartDislike color=' #777878' size={25} /></button>
                        <button className="share-btn"> <FaShare color=' #777878' size={25} /> </button>
                        <button className="options-btn"><SlOptionsVertical color=' #777878' size={20} /> </button>
                    </section>
                </div>
            </div>
            <div className="ws-displayShort-description">
                <h3> Short Description</h3>
                <p>{description}</p>
            </div>
            <div className="ws-displayShort-comments">
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

export default WatchShort;

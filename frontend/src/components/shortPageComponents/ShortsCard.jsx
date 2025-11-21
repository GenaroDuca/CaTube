import React, { useEffect, useRef, useState } from 'react'
import { FaCirclePlay } from "react-icons/fa6";
import { FaCirclePause } from "react-icons/fa6";
import { FaHeart } from "react-icons/fa";
import { FaComments } from "react-icons/fa6";
import { IoHeartDislike } from "react-icons/io5";
import { FaShare } from "react-icons/fa";
import { RiSettings2Fill } from "react-icons/ri";
import { ImVolumeMedium } from "react-icons/im";
import { ImVolumeMute2 } from "react-icons/im";
import { FiMinimize2 } from "react-icons/fi";
import { FiMaximize2 } from "react-icons/fi";
import { Link } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import ShareMenu from '../../components/videoPageComponents/ShareMenu.jsx'
import { CommentSection } from '../common/CommentSection.jsx';
import { VITE_API_URL } from "../../../config"
import { useReaction } from "../../hooks/useReaction.jsx";

export default function ShortCard({ short, isMaximized, onToggleMaximize }) {
  const videoRef = useRef(null)
  const [paused, setPaused] = useState(false)
  const [muted, setMuted] = useState(true)
  const [volume, setVolume] = useState(1)
  const [sliderVisible, setSliderVisible] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const { showSuccess, showError } = useToast()
  const [commentCount, setCommentCount] = useState(short.comments || 0);

  useEffect(() => {
    const v = videoRef.current
    if (v) {
      v.muted = muted
      v.volume = volume
    }
  }, [])


  useEffect(() => {
    const checkSubscription = async () => {
      const token = localStorage.getItem('accessToken');
      const userId = localStorage.getItem('userId');
      if (!token || !userId || !short.channelId) return;

      try {
        const res = await fetch(`${VITE_API_URL}/subscriptions/user/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) return;
        const channels = await res.json();
        const subscribed = channels.some(c => c.channel_id === short.channelId || c.channel_id === String(short.channelId));
        setIsSubscribed(subscribed);
      } catch (err) {
        console.error('Error checking subscription:', err);
      }
    };

    checkSubscription();
  }, [short.channelId])

  async function handleSubscribe(short) {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      alert('Please Log In to subscribe to channel');
      return;
    }

    if (isSubscribed) {
      // Unsubscribe
      const response = await fetch(`${VITE_API_URL}/subscriptions`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ channelId: short.channelId })
      });

      if (response.ok) {
        setIsSubscribed(false);
        showSuccess('Unsubscribed successfully');
      } else {
        const error = await response.json();
        showError(`Error: ${error.message}`);
      }
    } else {
      // Subscribe
      try {
        const response = await fetch(`${VITE_API_URL}/subscriptions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ channelId: short.channelId })
        });

        if (response.ok) {
          setIsSubscribed(true);
          showSuccess('Subscribed successfully');
        } else {
          const error = await response.json();
          showError(`Error: ${error.message}`);
        }
      } catch (error) {
        console.error('Subscription error:', error);
        alert('An error occurred while processing your subscription');
      }
    }
  }

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

    // Actualiza el color del slider
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

  // Reaction hook
  const {
    likes,
    dislikes,
    userReaction,
    react,
    removeReaction
  } = useReaction(short.id);

  return (
    <>
      <div className={`fullscreen-short-container ${isMaximized ? 'maximized' : ''}`}>

        <div className="short-channel-info short-container" id="short-actions-container">
          <Link to={short.channelUrl ? `/yourchannel/${short.channelUrl}` : '#'} className="short-channel-avatar">
            <img src={short.channelAvatar} alt={short.channelName} />
          </Link>
          <div className="channel-info">
            <h2>{short.channelName}</h2>
          </div>

          <button
            type="button"
            className="subscribe-button short-action-subscribe"
            style={{ display: short.isOwner ? 'none' : 'inline-block' }}
            onClick={() => handleSubscribe(short)}
          >
            {isSubscribed ? 'Subscribed' : 'Subscribe'}
          </button>

          <button
            type="button"
            className="subscribe-button short-action-promote owner-action"
            style={{ display: short.isOwner ? 'inline-block' : 'none' }}
            onClick={() => alert('Promoting short!')}
          >
            Promote short
          </button>

          <div style={{ width: "100%", textAlign: "justify" }}>
            <h3 style={{ textAlign: "center" }}>{short.title}</h3>
            <h3 style={{ marginTop: "20px" }}>Video Description</h3>
            <p>{short.description}</p>
            <div className="vv-displayVideo-description-tags">
              <h4 style={{ marginTop: "20px" }}>Video Tags</h4>
              <div>
                {short.tags.map(tag => (
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




        </div>

        <div className={`short-video-container short-container ${isMaximized ? 'maximized' : ''}`}>
          <div className={`short-block`} role="region" aria-label={`Short ${short.title || short.id}`}>

            <div className="video-placeholder" onClick={onVideoClick}>
              <video
                id="shortVideo"
                ref={videoRef}
                src={short.videoSrc}
                autoPlay
                muted={muted}
                loop
                onPlay={handlePlayPauseChange}
                onPause={handlePlayPauseChange}
                onVolumeChange={handlePlayPauseChange}
                style={{ width: '100%', objectFit: isMaximized ? 'contain' : 'cover' }}
              />
            </div>
          </div>

          <div className='short-action-buttons-container'>

            <div className="container-play-vol">
              <button type="button" id="maximize" className="action-button btn-maximize" onClick={(e) => { e.stopPropagation(); onToggleMaximize(); }}>
                {isMaximized ? <FiMinimize2 size={25} /> : <FiMaximize2 size={25} />}
              </button>
              <button
                type="button"
                id="playPauseBtn"
                className="action-button btn-play"
                onClick={togglePlay}
                aria-label={paused ? 'Play' : 'Pause'}
              >
                {paused ? <FaCirclePlay size={25} /> : <FaCirclePause size={25} />}
              </button>

              <div className="volume-control-container">
                <button type="button" id="soundMuteBtn" className="action-button btn-sound" onClick={toggleMute}>
                  {muted ? <ImVolumeMute2 size={25} /> : <ImVolumeMedium size={25} />}
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

            </div>
            <div className="action-buttons">
              {/* LIKE */}
              <button
                type="button"
                className={`action-button ${userReaction === "like" ? "reacted-like" : ""}`} // Add class for selected state
                onClick={() => {
                  if (userReaction === "like") removeReaction();
                  else react(true);
                }}
              >
                {/* Remove the 'color' prop */}
                <FaHeart size={25} />
              </button>
              <span>{likes}</span>

              {/* DISLIKE */}
              <button
                type="button"
                className={`action-button ${userReaction === "dislike" ? "reacted-dislike" : ""}`} // Add class for selected state
                onClick={() => {
                  if (userReaction === "dislike") removeReaction();
                  else react(false);
                }}
              >
                {/* Remove the 'color' prop */}
                <IoHeartDislike size={25} />
              </button>
              <span>{dislikes}</span>

              <button type="button" className="action-button comment-short-btn"><FaComments size={25} /></button>
              <span className="comment-short-btn">{commentCount}</span>

              <button type="button" className="action-button"><ShareMenu videoUrl={short.url} videoTitle={short.title} /></button>

              <button type="button" className="action-button"><RiSettings2Fill size={25} /></button>

            </div>
          </div>
        </div>
        <div className='short-comments-container short-container'>
          <CommentSection videoId={short.id} onCountChange={setCommentCount} />
        </div>
      </div >

    </>
  )
}
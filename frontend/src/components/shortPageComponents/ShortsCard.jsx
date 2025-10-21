import React, { useEffect, useRef, useState } from 'react'
import { FaCirclePlay } from "react-icons/fa6";
import { FaCirclePause } from "react-icons/fa6";
import { FcLike } from "react-icons/fc";
import { FaComments } from "react-icons/fa6";
import { IoHeartDislike } from "react-icons/io5";
import { FaShare } from "react-icons/fa";
import { RiSettings2Fill } from "react-icons/ri";
import {ImVolumeMute} from "react-icons/im";
import {ImVolumeMute2} from "react-icons/im";
import { FiMinimize2 } from "react-icons/fi";
import { FiMaximize2 } from "react-icons/fi";

export default function ShortCard({ short, isMaximized, onToggleMaximize }) {
  const videoRef = useRef(null)
  const [paused, setPaused] = useState(false)
  const [muted, setMuted] = useState(true)
  const [volume, setVolume] = useState(1)
  const [sliderVisible, setSliderVisible] = useState(false)

  useEffect(() => {
    const v = videoRef.current
    if (v) {
      v.muted = muted
      v.volume = volume
    }
  }, [])

  useEffect(() => {
    if (isMaximized) {
      document.body.classList.add('short-maximized-active')
    } else {
      document.body.classList.remove('short-maximized-active')
    }
  }, [isMaximized])

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
    setSliderVisible((s) => !s)
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
  }

  function onVideoClick(e) {
    const target = e.target
    if (target.tagName.toLowerCase() === 'video' || target.classList.contains('video-placeholder')) {
      togglePlay()
    }
  }

  return (
    <>
      <div className={`short-block ${isMaximized ? 'maximized' : ''}`} role="region" aria-label={`Short ${short.title || short.id}`}>
        <div className="short-header" id="short-actions-container">
          <div className="short-channel-avatar">
            <img src={short.channelAvatar} alt={short.channelName} />
          </div>
          <div className="channel-info">
            <p>{short.channelName}</p>
            <p>{short.description}</p>
          </div>

          <a
            href={short.isOwner ? '#' : '/register/register.html'}
            type="button"
            className="subscribe-button short-action-subscribe"
            style={{ display: short.isOwner ? 'none' : 'inline-block' }}
          >
            {short.isSubscribed ? 'Unsubscribe' : short.channelName ? 'Subscribe' : 'Log in to Subscribe'}
          </a>

          <button
            type="button"
            className="subscribe-button short-action-promote owner-action"
            style={{ display: short.isOwner ? 'inline-block' : 'none' }}
            onClick={() => alert('Promoting short!')}
          >
            Promote short
          </button>

          <button type="button" id="maximize" className="action-button" onClick={(e) => { e.stopPropagation(); onToggleMaximize(); }}>
            {isMaximized ? <FiMinimize2 color=' rgb(144, 180, 132' size={25} /> : <FiMaximize2 color=' rgb(144, 180, 132' size={25}/> }
          </button>
        </div>

        <div className="container-play-vol">
          <button
            type="button"
            id="playPauseBtn"
            className="action-button btn-play"
            onClick={togglePlay}
            aria-label={paused ? 'Play' : 'Pause'}
          >
            {paused ? <FaCirclePlay color=' rgb(144, 180, 132' size={25}/> : <FaCirclePause color=' rgb(144, 180, 132' size={25}/>}
          </button>

          <div className="volume-control-container">
            <button type="button" id="soundMuteBtn" className="action-button btn-sound" onClick={toggleMute}>
              {muted ? <ImVolumeMute2 color=' rgb(144, 180, 132' size={25}/> : <ImVolumeMute color=' rgb(144, 180, 132' size={25} />}
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
            style={{ width: '100%', height: '100%', objectFit: isMaximized ? 'contain' : 'cover' }}
          />
        </div>

        <div className="action-buttons">
          <button type="button" className="action-button"><FcLike size={25}/></button>
          <button type="button" className="action-button"><IoHeartDislike color=' rgb(144, 180, 132' size={25}/></button>
          <button type="button" className="action-button"><FaComments color=' rgb(144, 180, 132' size={25}/></button>
          <button type="button" className="action-button"><FaShare color=' rgb(144, 180, 132' size={25}/></button>
          <button type="button" className="action-button"><RiSettings2Fill color=' rgb(144, 180, 132' size={25}/></button>
        </div>

        <div className="title-bar-short">
          <p>{short.title}</p>
        </div>
        <div className="short-footer"></div>
      </div>
    </>
  )
}
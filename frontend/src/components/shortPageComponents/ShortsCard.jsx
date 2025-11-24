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
import VideoOptionsMenu from '../videoPageComponents/VideoOptionsMenu.jsx';

// Acepta los props isActive y onVideoActive
export default function ShortCard({ short, isMaximized, onToggleMaximize, isActive, onVideoActive }) {
  const videoRef = useRef(null)
  const [paused, setPaused] = useState(true)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [sliderVisible, setSliderVisible] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const { showSuccess, showError } = useToast()
  const [commentCount, setCommentCount] = useState(short.comments || 0);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    // Función auxiliar para intentar la reproducción
    const attemptPlay = () => {
      // 1. Intentar reproducir con el estado actual de muteo (idealmente sin muteo)
      v.play().then(() => {
        setPaused(false);
        setMuted(v.muted); // Sincroniza el estado de muteo
      }).catch(e => {
        // 2. Si falla por Autoplay Policy (permisos)
        console.error("Autoplay bloqueado. Intentando mutear y reintentar.", e);

        v.muted = true;

        v.play().then(() => {
          setPaused(false);
          setMuted(true); // Se muteó forzadamente y sincroniza
        }).catch(error => {
          // 3. Si falla incluso muteado (video no cargado o error grave)
          console.error("Fallo la reproducción incluso muteado.", error);
          setPaused(true);
        });
      });
    };

    if (isActive) {
      // Verificar si los metadatos ya están cargados (readyState 1: metadata is available)
      if (v.readyState >= 1) {
        attemptPlay();
      } else {
        // Si el video aún está cargando, usa el evento 'loadedmetadata'
        const onLoaded = () => {
          attemptPlay();
          v.removeEventListener('loadedmetadata', onLoaded);
        };
        v.addEventListener('loadedmetadata', onLoaded);

        return () => v.removeEventListener('loadedmetadata', onLoaded);
      }
    } else {
      // Si NO es el video activo, páusalo
      v.pause();
      setPaused(true);
    }
  }, [isActive]);

  // --- LÓGICA DE SUBSCRIPCIÓN (Se mantiene igual) ---
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
  // --- FIN DE LÓGICA DE SUBSCRIPCIÓN ---


  // --- MANEJO DE CONTROLES (Modificado: handlePlayPauseChange ahora solo se usa en togglePlay si es necesario) ---
  function togglePlay() {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      // Al hacer clic para reproducir, intentamos desmutear (si el usuario no lo ha hecho)
      if (v.muted) {
        v.muted = false;
        setMuted(false);
      }

      v.play().then(() => setPaused(false)).catch((e) => console.error(e))
    } else {
      v.pause()
      setPaused(true)
    }
  }

  /*
  // La función handlePlayPauseChange ha sido reemplazada en togglePlay 
  // y eliminada de los eventos del <video> para evitar el bucle.
  function handlePlayPauseChange() {
    const v = videoRef.current
    if (!v) return
    setPaused(v.paused) // ESTO CAUSABA EL BUCLE AL DISPARARSE POR ONPLAY/ONPAUSE DEL VIDEO
  }
  */

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
  // --- FIN DE MANEJO DE CONTROLES ---

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

        <div className={`short-video-container short-container ${isMaximized ? 'maximized' : ''}`}>
          <div className={`short-block`} role="region" aria-label={`Short ${short.title || short.id}`}>

            <div className="video-placeholder" onClick={onVideoClick}>
              <video
                id="shortVideo"
                ref={videoRef}
                src={short.videoSrc}
                preload="metadata" // Ayuda a que loadedmetadata se dispare rápido
                muted={muted}
                loop
              // SE ELIMINARON onPlay, onPause y onVolumeChange para evitar el bucle de estado
              />
            </div>

            {/* User Info Overlay */}
            <div className="short-info-overlay">

              {/* ... (Detalles y tags) ... */}
              <div className="short-details">
                <h3 className="short-title">{short.title}</h3>
                <p className="short-desc">{short.description}</p>
                <div className="short-tags">
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
              <div className="short-user-header">
                <Link to={`/yourchannel/${short.channelUrl}`} className="overlay-avatar">
                  <img src={short.channelAvatar} alt={short.channelName} />
                </Link>
                <div className="overlay-text-info">
                  <Link to={`/yourchannel/${short.channelUrl}`}>
                    <h4 className="overlay-username">{short.channelName}</h4>
                  </Link>
                  <button
                    type="button"
                    className="subscribe-button overlay-subscribe"
                    style={{ display: short.isOwner ? 'none' : 'inline-block' }}
                    onClick={() => handleSubscribe(short)}
                  >
                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
                  </button>
                </div>
              </div>
            </div>


            {/* Comments Drawer (se mantiene igual) */}
            <div className={`comments-drawer ${showComments ? 'open' : ''}`}>
              <div className="comments-drawer-header">
                <h3>Comments</h3>
                <button onClick={() => setShowComments(false)} className="close-drawer-btn">✕</button>
              </div>
              <div className="comments-drawer-content">
                <CommentSection videoId={short.id} onCountChange={setCommentCount} />
              </div>
            </div>

          </div>

          <div className='short-action-buttons-container'>

            <div className="container-play-vol">
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
                className={`action-button ${userReaction === "like" ? "reacted-like" : ""}`}
                onClick={() => {
                  if (userReaction === "like") removeReaction();
                  else react(true);
                }}
              >
                <FaHeart size={25} />
              </button>
              <span>{likes}</span>

              {/* DISLIKE */}
              <button
                type="button"
                className={`action-button ${userReaction === "dislike" ? "reacted-dislike" : ""} dislike-btn`}
                onClick={() => {
                  if (userReaction === "dislike") removeReaction();
                  else react(false);
                }}
              >
                <IoHeartDislike size={25} />
              </button>
              <span>{dislikes}</span>

              <button type="button" className="action-button comment-short-btn" onClick={() => setShowComments(!showComments)}>
                <FaComments size={25} />
              </button>
              <span className="comment-short-btn">{commentCount}</span>

              <button type="button" className="action-button"><ShareMenu videoUrl={short.url} videoTitle={short.title} /></button>

              {short.ownerId === localStorage.getItem('userId') && (
                <div className="action-button">
                  <VideoOptionsMenu
                    videoId={short.id}
                    title={short.title}
                    description={short.description}
                    thumbnail={short.thumbnail}
                    tags={short.tags}
                    contentType="Shorts"
                    ownerId={short.ownerId}
                  />
                </div>
              )}

            </div>
          </div>

        </div>
      </div >

    </>
  )
}
import React, { useEffect, useRef, useState, useMemo } from 'react'
import { FaCirclePlay, FaCirclePause, FaHeart, FaComments, FaShare } from "react-icons/fa6";
import { IoHeartDislike } from "react-icons/io5";
import { ImVolumeMedium, ImVolumeMute2 } from "react-icons/im";
import { Link } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import ShareMenu from '../../components/videoPageComponents/ShareMenu.jsx'
import { CommentSection } from '../common/CommentSection.jsx';
import { VITE_API_URL } from "../../../config"
import { useReaction } from "../../hooks/useReaction.jsx";
import VideoOptionsMenu from '../videoPageComponents/VideoOptionsMenu.jsx';

import Loader from '../../components/common/Loader.jsx';

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
  const [showSlider, setShowSlider] = useState(false);

  // ESTADO DE CARGA
  const [isLoading, setIsLoading] = useState(true);

  const isOwner = useMemo(() => {
    const currentUserId = localStorage.getItem('userId');
    const ownerId = short.ownerId;

    if (!currentUserId || !ownerId) return false;

    const normalizedCurrentId = String(currentUserId).trim();
    const normalizedOwnerId = String(ownerId).trim();

    return normalizedCurrentId === normalizedOwnerId;
  }, [short.ownerId]);

  
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    // FUNCIONES PARA MANEJAR EVENTOS DE CARGA
    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleWaiting = () => {
      if (!v.paused) {
        setIsLoading(true); // Se detiene por buffering
      }
    };

    // Añadir listeners
    v.addEventListener('canplay', handleCanPlay);
    v.addEventListener('waiting', handleWaiting);

    // Función auxiliar para intentar la reproducción
    const attemptPlay = () => {
      // Establecer cargando si el video no tiene suficientes datos aún
      if (v.readyState < 3) {
        setIsLoading(true);
      } else {
        setIsLoading(false);
      }

      // 1. Intentar reproducir
      v.play().then(() => {
        setPaused(false);
        setMuted(v.muted);
        setIsLoading(false);
      }).catch(e => {
        // 2. Si falla por Autoplay Policy, intentar mutear
        console.error("Autoplay bloqueado. Intentando mutear y reintentar.", e);

        v.muted = true;

        v.play().then(() => {
          setPaused(false);
          setMuted(true);
          setIsLoading(false);
        }).catch(error => {
          // 3. Fallo total
          console.error("Fallo la reproducción incluso muteado.", error);
          setPaused(true);
          setIsLoading(false);
        });
      });
    };

    if (isActive) {
      // Comprobar el estado inicial
      if (v.readyState >= 1) {
        attemptPlay();
      } else {
        // Muestra el spinner si el video no tiene metadata
        setIsLoading(true);
        const onLoaded = () => {
          attemptPlay();
          v.removeEventListener('loadedmetadata', onLoaded);
        };
        v.addEventListener('loadedmetadata', onLoaded);

        return () => {
          v.removeEventListener('loadedmetadata', onLoaded);
          v.removeEventListener('canplay', handleCanPlay);
          v.removeEventListener('waiting', handleWaiting);
        };
      }
    } else {
      // Si NO es el video activo, páusalo
      v.pause();
      setPaused(true);
      setIsLoading(false);
    }

    // Limpieza de listeners
    return () => {
      v.removeEventListener('canplay', handleCanPlay);
      v.removeEventListener('waiting', handleWaiting);
    };

  }, [isActive]);

  // --- Lógica de Suscripción (se mantiene igual) ---
  useEffect(() => {
    const checkSubscription = async () => {
      const token = localStorage.getItem('accessToken');
      const userId = localStorage.getItem('userId');
      if (isOwner || !token || !userId || !short.channelId) return;
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
  }, [short.channelId, isOwner])

  async function handleSubscribe(short) {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      alert('Please Log In to subscribe to channel');
      return;
    }

    if (isSubscribed) {
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
              {/* 💡 TU LOADER IMPLEMENTADO */}
              {isLoading && (
                // Usamos Loader sin el prop isOverlay=true para que use la clase 'loader-local'
                // y se posicione localmente sobre el video sin tapar la pantalla completa.
                <Loader isOverlay={false} />
              )}

              <video
                id="shortVideo"
                ref={videoRef}
                src={short.videoSrc}
                preload="metadata"
                muted={muted}
                loop
                // Asegura que el video sea transparente cuando se está cargando
                style={{ opacity: isLoading ? 0 : 1 }}
              />
            </div>

            {/* User Info Overlay (Ocultar si está cargando) */}
            {!isLoading && (
              <div className="short-info-overlay">

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

                    {!isOwner && (
                      <button
                        type="button"
                        className={`subscribe-button overlay-subscribe ${isSubscribed ? 'subscribed' : ''}`}
                        onClick={() => handleSubscribe(short)}
                      >
                        {isSubscribed ? 'Subscribed' : 'Subscribe'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}


            {/* Comments Drawer */}
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

          {/* Controles y botones de acción (Ocultar si está cargando) */}
          {!isLoading && (
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
                  <button type="button" id="soundMuteBtn" className="action-button btn-sound" onClick={() => setShowSlider((prev) => !prev)}>
                    {muted ? <ImVolumeMute2 size={25} /> : <ImVolumeMedium size={25} />}
                  </button>
                  {showSlider && (
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
                  )}
                </div>

              </div>

              <div className="action-buttons">
                {!isOwner && (
                  <>
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
                  </>
                )}


                <button type="button" className="action-button comment-short-btn" onClick={() => setShowComments(!showComments)}>
                  <FaComments size={25} />
                </button>
                <span className="comment-short-btn">{commentCount}</span>

                <button type="button" className="action-button"><ShareMenu videoUrl={short.url} videoTitle={short.title} /></button>

                {isOwner && (
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
          )}

        </div>
      </div >

    </>
  )
}
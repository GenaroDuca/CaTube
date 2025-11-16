import { useState, useCallback, useEffect, useRef } from 'react';

export function useVideoControl(videoRef, onTheaterToggle) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isTheaterMode, setIsTheaterMode] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const isSeekingRef = useRef(false);

    // ▶Alternar play/pause (sin AbortError)
    const togglePlayPause = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused || video.ended) {
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch((err) => {
                    if (err.name !== 'AbortError') console.warn('Play error:', err);
                });
            }
        } else {
            video.pause();
        }
    }, [videoRef]);

    // Cambiar volumen
    const changeVolume = useCallback((newVolume) => {
        const video = videoRef.current;
        if (!video) return;
        const value = Math.min(Math.max(newVolume, 0), 1);
        video.volume = value;
        setVolume(value);
        setIsMuted(value === 0);
    }, [videoRef]);

    // Mute / unmute
    const toggleMute = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        video.muted = !video.muted;
        setIsMuted(video.muted);
    }, [videoRef]);

    // Adelantar / retroceder
    const skipTime = useCallback((seconds) => {
        const video = videoRef.current;
        if (!video) return;
        const newTime = Math.min(Math.max(video.currentTime + seconds, 0), video.duration);
        video.currentTime = newTime;
    }, [videoRef]);

    // 🎭 Modo teatro
    const toggleTheaterMode = useCallback(() => {
        setIsTheaterMode(prev => {
            const newMode = !prev;
            if (onTheaterToggle) onTheaterToggle(newMode);
            return newMode;
        });
    }, [onTheaterToggle]);

    // Pantalla completa
    const toggleFullScreen = useCallback(() => {
        const container = videoRef.current?.parentElement;
        if (!container) return;
        if (!document.fullscreenElement) container.requestFullscreen();
        else document.exitFullscreen();
    }, [videoRef]);

    // Sincronizar estados del video
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onEnded = () => setIsPlaying(false);
        const onTimeUpdate = () => {
            if (!isSeekingRef.current) {
                setProgress(video.currentTime);
            }
        };
        const onLoadedMetadata = () => setDuration(video.duration);

        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);
        video.addEventListener('ended', onEnded);
        video.addEventListener('timeupdate', onTimeUpdate);
        video.addEventListener('loadedmetadata', onLoadedMetadata);

        return () => {
            video.removeEventListener('play', onPlay);
            video.removeEventListener('pause', onPause);
            video.removeEventListener('ended', onEnded);
            video.removeEventListener('timeupdate', onTimeUpdate);
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
        };
    }, [videoRef]);

    // Controlar avance manual sin trabar reproducción
    const handleSeek = useCallback((event) => {
        const video = videoRef.current;
        if (!video || !duration) return;

        const newTime = parseFloat(event.target.value);
        if (isNaN(newTime)) return;

        isSeekingRef.current = true; // 👈 evita que timeupdate dispare conflictos
        const wasPlaying = !video.paused;

        video.currentTime = newTime;

        // Esperar un frame antes de soltar el seek
        setTimeout(() => {
            isSeekingRef.current = false;
            if (wasPlaying) {
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch((err) => {
                        if (err.name !== 'AbortError') console.warn('Play error after seek:', err);
                    });
                }
            }
        }, 100);
    }, [videoRef, duration]);

    //Detectar cambios de fullscreen
    useEffect(() => {
        const handler = () => setIsFullScreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handler);
        return () => document.removeEventListener('fullscreenchange', handler);
    }, []);

    // Atajos de teclado
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            switch (e.key.toLowerCase()) {
                case ' ':
                    e.preventDefault();
                    togglePlayPause();
                    break;
                case 'f':
                    toggleFullScreen();
                    break;
                case 'm':
                    toggleMute();
                    break;
                case 'arrowright':
                    skipTime(5);
                    break;
                case 'arrowleft':
                    skipTime(-5);
                    break;
                default:
                    break;
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [togglePlayPause, toggleFullScreen, toggleMute, skipTime]);

    return {
        isPlaying,
        volume,
        isMuted,
        isTheaterMode,
        isFullScreen,
        progress,
        duration,
        togglePlayPause,
        changeVolume,
        toggleMute,
        skipTime,
        toggleTheaterMode,
        toggleFullScreen,
        handleSeek,
    };
}

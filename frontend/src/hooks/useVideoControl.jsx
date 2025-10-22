import { useState, useCallback} from 'react';

export function useVideoControl(videoRef, onTheaterToggle) {
    const [isPlaying, setIsPlaying] = useState(false); // Video play/pause state
    const [volume, setVolume] = useState(1); // Volume range from 0 to 1
    const [isMuted, setIsMuted] = useState(false); // Mute state
    const [isTheaterMode, setIsTheaterMode] = useState(false); // Theater mode state
    const [isFullScreen, setIsFullScreen] = useState(false); // Fullscreen state

    const togglePlayPause = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        isPlaying ? video.pause() : video.play();
        setIsPlaying(!isPlaying);
    } , [isPlaying, videoRef]);

    const changeVolume = useCallback((newVolume) => {
        const video = videoRef.current;
        if (!video) return;
        video.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    }, [videoRef]);

    const skipTime = useCallback((seconds) => {
        const video = videoRef.current;
        if (!video) return;
        video.currentTime += seconds;
    }, [videoRef]);

    const toggleTheaterMode = useCallback(() => {
        setIsTheaterMode((prev) => {
            const newMode = !prev;
            if (onTheaterToggle) onTheaterToggle(newMode);
            return newMode;
        });
    }, []);

    const toggleFullScreen = useCallback(() => {
        const videoContainer = videoRef.current?.parentElement;
        if (!videoContainer) return;

        if (!document.fullscreenElement) {
            videoContainer.requestFullscreen();
            setIsFullScreen(true);
        } else {
            document.exitFullscreen();
            setIsFullScreen(false);
        }}, [videoRef]);

    return {
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
    };
}
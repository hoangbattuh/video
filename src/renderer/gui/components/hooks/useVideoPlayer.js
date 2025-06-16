import { useRef, useState, useCallback } from 'react';

const useVideoPlayer = () => {
  const videoRef = useRef(null);
  const [videoState, setVideoState] = useState({
    duration: 0,
    currentTime: 0,
    isPlaying: false,
    volume: 1,
    muted: false,
    playbackRate: 1,
    isFullscreen: false
  });

  const updateVideoState = useCallback((updates) => {
    setVideoState(prev => ({ ...prev, ...updates }));
  }, []);

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      updateVideoState({ isPlaying: true });
    } else {
      video.pause();
      updateVideoState({ isPlaying: false });
    }
  }, [updateVideoState]);

  const seekTo = useCallback((time) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = time;
      updateVideoState({ currentTime: time });
    }
  }, [updateVideoState]);

  const setVolume = useCallback((volume) => {
    const video = videoRef.current;
    if (video) {
      video.volume = volume;
      updateVideoState({ volume, muted: volume === 0 });
    }
  }, [updateVideoState]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      updateVideoState({ muted: video.muted });
    }
  }, [updateVideoState]);

  const setPlaybackRate = useCallback((rate) => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = rate;
      updateVideoState({ playbackRate: rate });
    }
  }, [updateVideoState]);

  return {
    videoRef,
    videoState,
    updateVideoState,
    togglePlayPause,
    seekTo,
    setVolume,
    toggleMute,
    setPlaybackRate
  };
};

export default useVideoPlayer;

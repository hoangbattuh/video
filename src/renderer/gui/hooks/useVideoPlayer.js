import { useState, useRef, useCallback, useEffect } from 'react';

const useVideoPlayer = () => {
  const videoRef = useRef(null);
  const [videoState, setVideoState] = useState({
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    volume: 1,
    isMuted: false,
    playbackRate: 1,
    videoWidth: 0,
    videoHeight: 0,
    isLoaded: false
  });

  // Cập nhật trạng thái video
  const updateVideoState = useCallback((newState) => {
    setVideoState(prev => ({ ...prev, ...newState }));
  }, []);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => {
        updateVideoState({ isPlaying: true });
      }).catch(err => {
        console.error('Error playing video:', err);
      });
    } else {
      video.pause();
      updateVideoState({ isPlaying: false });
    }
  }, [updateVideoState]);

  // Seek to specific time
  const seekTo = useCallback((time) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, Math.min(time, video.duration || 0));
    updateVideoState({ currentTime: video.currentTime });
  }, [updateVideoState]);

  // Set volume
  const setVolume = useCallback((volume) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = Math.max(0, Math.min(1, volume));
    video.volume = newVolume;
    updateVideoState({ volume: newVolume, isMuted: newVolume === 0 });
  }, [updateVideoState]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    updateVideoState({ isMuted: video.muted });
  }, [updateVideoState]);

  // Set playback rate
  const setPlaybackRate = useCallback((rate) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    updateVideoState({ playbackRate: rate });
  }, [updateVideoState]);

  // Event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      updateVideoState({ currentTime: video.currentTime });
    };

    const handleLoadedMetadata = () => {
      updateVideoState({
        duration: video.duration,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        isLoaded: true
      });
    };

    const handleLoadedData = () => {
      updateVideoState({ isLoaded: true });
    };

    const handlePlay = () => {
      updateVideoState({ isPlaying: true });
    };

    const handlePause = () => {
      updateVideoState({ isPlaying: false });
    };

    const handleEnded = () => {
      updateVideoState({ isPlaying: false, currentTime: 0 });
    };

    const handleVolumeChange = () => {
      updateVideoState({ 
        volume: video.volume, 
        isMuted: video.muted 
      });
    };

    const handleRateChange = () => {
      updateVideoState({ playbackRate: video.playbackRate });
    };

    // Add event listeners
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('ratechange', handleRateChange);

    // Cleanup
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('ratechange', handleRateChange);
    };
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
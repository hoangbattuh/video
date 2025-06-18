import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Slider,
  Button,
  Typography,
  Tooltip,
  Dropdown,
  Menu,
  Progress,
} from "antd";
import PropTypes from "prop-types";
import {
  StepBackwardOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StepForwardOutlined,
  SoundOutlined,
  MutedOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  SettingOutlined,
  ReloadOutlined,
  FastForwardOutlined,
  FastBackwardOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const VideoPlayer = ({
  videoRef,
  videoState,
  togglePlayPause,
  seekTo,
  setVolume,
  toggleMute,
  setPlaybackRate,
  formatTime,
  handleFullscreen,
  canvasRef,
  theme,
  showTooltips,
  videoInfo,
}) => {
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [volume, setVolumeState] = useState(videoState.volume);
  const controlsTimeoutRef = useRef();
  const containerRef = useRef();

  // Playback speeds
  const playbackSpeeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  // Auto-hide controls
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);

    if (videoState.isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [videoState.isPlaying]);

  const handleMouseLeave = useCallback(() => {
    if (videoState.isPlaying) {
      setShowControls(false);
    }
  }, [videoState.isPlaying]);

  // Update buffered progress
  const updateBuffered = useCallback(() => {
    const video = videoRef.current;
    if (video && video.buffered.length > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const duration = video.duration;
      setBuffered((bufferedEnd / duration) * 100);
    }
  }, [videoRef]);

  // Fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Update buffered on video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleProgress = () => updateBuffered();
    const handleLoadStart = () => updateBuffered();

    video.addEventListener("progress", handleProgress);
    video.addEventListener("loadstart", handleLoadStart);

    return () => {
      video.removeEventListener("progress", handleProgress);
      video.removeEventListener("loadstart", handleLoadStart);
    };
  }, [updateBuffered]);

  // Keyboard shortcuts for video player
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!containerRef.current?.contains(e.target)) return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlayPause();
          break;
        case "ArrowLeft":
          e.preventDefault();
          seekTo(Math.max(0, videoState.currentTime - (e.shiftKey ? 1 : 10)));
          break;
        case "ArrowRight":
          e.preventDefault();
          seekTo(
            Math.min(
              videoState.duration,
              videoState.currentTime + (e.shiftKey ? 1 : 10)
            )
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          const newVolumeUp = Math.min(1, videoState.volume + 0.1);
          setVolume(newVolumeUp);
          setVolumeState(newVolumeUp);
          break;
        case "ArrowDown":
          e.preventDefault();
          const newVolumeDown = Math.max(0, videoState.volume - 0.1);
          setVolume(newVolumeDown);
          setVolumeState(newVolumeDown);
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "f":
          e.preventDefault();
          handleFullscreen();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    togglePlayPause,
    seekTo,
    setVolume,
    toggleMute,
    handleFullscreen,
    videoState,
  ]);

  // Speed menu
  const speedItems = playbackSpeeds.map((speed) => ({
    key: speed.toString(),
    label: (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "4px 8px",
        }}
      >
        <span>{speed}x</span>
        {speed === 1 && (
          <Text type="secondary" style={{ fontSize: "0.8em" }}>
            (Normal)
          </Text>
        )}
      </div>
    ),
    style: {
      backgroundColor:
        videoState.playbackRate === speed ? "#f0f0f0" : "transparent",
    },
  }));

  const handleSpeedChange = ({ key }) => {
    const speed = parseFloat(key);
    setPlaybackRate(speed);
  };

  const speedMenu = (
    <Dropdown
      trigger={["click"]}
      menu={{ items: speedItems, onClick: handleSpeedChange }}
    >
      <a onClick={(e) => e.preventDefault()}>Tốc độ phát</a>
    </Dropdown>
  );
  const handleSeekStart = useCallback(() => {
    setSeeking(true);
  }, []);

  const handleSeekEnd = useCallback(() => {
    setSeeking(false);
  }, []);

  const handleVolumeChange = useCallback(
    (value) => {
      setVolumeState(value);
      setVolume(value);
    },
    [setVolume]
  );

  if (!videoState.duration) {
    return (
      <div
        className={`relative rounded-xl overflow-hidden mb-4 ${
          theme === "dark" ? "bg-gray-900" : "bg-black"
        }`}
        style={{ aspectRatio: "16/9", minHeight: "400px" }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-200 dark:bg-gray-800">
          <div className="text-center p-8">
            <div className="text-6xl text-gray-400 mb-4">🎬</div>
            <Text className="text-lg block mb-2 text-gray-500 dark:text-gray-300">
              Video sẵn sàng để phát
            </Text>
            <Text className="text-sm text-gray-400">
              Click vào video để bắt đầu phát
            </Text>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative rounded-xl overflow-hidden mb-4 group cursor-pointer ${
        theme === "dark" ? "bg-gray-900" : "bg-black"
      }`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={togglePlayPause}
      onDoubleClick={handleFullscreen}
      style={{
        aspectRatio:
          `${videoState.videoWidth}/${videoState.videoHeight}` || "16/9",
      }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        preload="metadata"
        playsInline
      />

      {/* Buffering Indicator */}
      {seeking && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="bg-black/70 text-white px-4 py-2 rounded-lg">
            <Progress
              type="circle"
              size={60}
              percent={buffered}
              showInfo={false}
              strokeColor="#667eea"
            />
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <AnimatePresence>
        {(showControls || !videoState.isPlaying) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

            {/* Top Controls */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
              <div className="flex items-center space-x-2">
                <Text className="text-white font-medium">
                  {videoInfo?.selectedFile?.name || "Video"}
                </Text>
              </div>

              <div className="flex items-center space-x-2">
                {/* Playback Speed */}
                <Tooltip title={showTooltips ? "Tốc độ phát" : ""}>
                  <Dropdown
                    overlay={speedMenu}
                    trigger={["click"]}
                    placement="bottomRight"
                  >
                    <Button
                      type="text"
                      className="text-white bg-black/50 hover:bg-black/70 border-none"
                      size="small"
                    >
                      {videoState.playbackRate}x
                    </Button>
                  </Dropdown>
                </Tooltip>

                {/* Settings */}
                <Tooltip title={showTooltips ? "Cài đặt video" : ""}>
                  <Button
                    type="text"
                    icon={<SettingOutlined />}
                    className="text-white bg-black/50 hover:bg-black/70 border-none"
                    size="small"
                  />
                </Tooltip>

                {/* Fullscreen */}
                <Tooltip
                  title={
                    showTooltips
                      ? isFullscreen
                        ? "Thoát toàn màn hình"
                        : "Toàn màn hình"
                      : ""
                  }
                >
                  <Button
                    type="text"
                    icon={
                      isFullscreen ? (
                        <FullscreenExitOutlined />
                      ) : (
                        <FullscreenOutlined />
                      )
                    }
                    className="text-white bg-black/50 hover:bg-black/70 border-none"
                    size="small"
                    onClick={handleFullscreen}
                  />
                </Tooltip>
              </div>
            </div>

            {/* Center Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  type="text"
                  icon={
                    videoState.isPlaying ? (
                      <PauseCircleOutlined />
                    ) : (
                      <PlayCircleOutlined />
                    )
                  }
                  onClick={togglePlayPause}
                  className="text-white text-6xl w-20 h-20 flex items-center justify-center bg-black/30 hover:bg-black/50 rounded-full border-none"
                  style={{ fontSize: "3rem" }}
                />
              </motion.div>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-4 left-4 right-4 z-10">
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="relative">
                  {/* Buffered Progress */}
                  <div
                    className="absolute top-0 left-0 h-1 bg-gray-500 rounded"
                    style={{ width: `${buffered}%` }}
                  />

                  {/* Main Progress Slider */}
                  <Slider
                    min={0}
                    max={videoState.duration}
                    value={videoState.currentTime}
                    step={0.1}
                    onChange={(value) => {
                      seekTo(value);
                    }}
                    onAfterChange={handleSeekEnd}
                    tooltip={{
                      formatter: formatTime,
                      placement: "top",
                    }}
                    className="video-progress-slider"
                    trackStyle={{ backgroundColor: "#667eea", height: 4 }}
                    railStyle={{
                      backgroundColor: "rgba(255,255,255,0.3)",
                      height: 4,
                    }}
                    handleStyle={{
                      borderColor: "#667eea",
                      backgroundColor: "#fff",
                      width: 16,
                      height: 16,
                      marginTop: -6,
                    }}
                  />
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Skip Backwards */}
                  <Tooltip title={showTooltips ? "Lùi 10 giây" : ""}>
                    <Button
                      type="text"
                      icon={<FastBackwardOutlined />}
                      onClick={() =>
                        seekTo(Math.max(0, videoState.currentTime - 10))
                      }
                      className="text-white bg-black/50 hover:bg-black/70 border-none"
                      size="small"
                    />
                  </Tooltip>

                  {/* Previous Frame */}
                  <Tooltip title={showTooltips ? "Khung hình trước" : ""}>
                    <Button
                      type="text"
                      icon={<StepBackwardOutlined />}
                      onClick={() =>
                        seekTo(Math.max(0, videoState.currentTime - 1 / 30))
                      }
                      className="text-white bg-black/50 hover:bg-black/70 border-none"
                      size="small"
                    />
                  </Tooltip>

                  {/* Play/Pause */}
                  <Tooltip
                    title={
                      showTooltips
                        ? videoState.isPlaying
                          ? "Tạm dừng"
                          : "Phát"
                        : ""
                    }
                  >
                    <Button
                      type="text"
                      icon={
                        videoState.isPlaying ? (
                          <PauseCircleOutlined />
                        ) : (
                          <PlayCircleOutlined />
                        )
                      }
                      onClick={togglePlayPause}
                      className="text-white bg-black/50 hover:bg-black/70 border-none"
                      size="large"
                    />
                  </Tooltip>

                  {/* Next Frame */}
                  <Tooltip title={showTooltips ? "Khung hình sau" : ""}>
                    <Button
                      type="text"
                      icon={<StepForwardOutlined />}
                      onClick={() =>
                        seekTo(
                          Math.min(
                            videoState.duration,
                            videoState.currentTime + 1 / 30
                          )
                        )
                      }
                      className="text-white bg-black/50 hover:bg-black/70 border-none"
                      size="small"
                    />
                  </Tooltip>

                  {/* Skip Forward */}
                  <Tooltip title={showTooltips ? "Tiến 10 giây" : ""}>
                    <Button
                      type="text"
                      icon={<FastForwardOutlined />}
                      onClick={() =>
                        seekTo(
                          Math.min(
                            videoState.duration,
                            videoState.currentTime + 10
                          )
                        )
                      }
                      className="text-white bg-black/50 hover:bg-black/70 border-none"
                      size="small"
                    />
                  </Tooltip>
                </div>

                {/* Right Side Controls */}
                <div className="flex items-center space-x-3">
                  {/* Volume Control */}
                  <div className="flex items-center space-x-2">
                    <Tooltip
                      title={
                        showTooltips
                          ? videoState.muted
                            ? "Bật tiếng"
                            : "Tắt tiếng"
                          : ""
                      }
                    >
                      <Button
                        type="text"
                        icon={
                          videoState.muted || volume === 0 ? (
                            <MutedOutlined />
                          ) : (
                            <SoundOutlined />
                          )
                        }
                        onClick={toggleMute}
                        className="text-white bg-black/50 hover:bg-black/70 border-none"
                        size="small"
                      />
                    </Tooltip>

                    <div className="w-20">
                      <Slider
                        min={0}
                        max={1}
                        step={0.1}
                        value={volume}
                        onChange={handleVolumeChange}
                        tooltip={{
                          formatter: (value) => `${Math.round(value * 100)}%`,
                          placement: "top",
                        }}
                        trackStyle={{ backgroundColor: "#667eea" }}
                        railStyle={{ backgroundColor: "rgba(255,255,255,0.3)" }}
                        handleStyle={{
                          borderColor: "#667eea",
                          backgroundColor: "#fff",
                          width: 12,
                          height: 12,
                        }}
                      />
                    </div>
                  </div>

                  {/* Time Display */}
                  <div className="text-white text-sm min-w-max bg-black/50 px-3 py-1 rounded">
                    {formatTime(videoState.currentTime)} /{" "}
                    {formatTime(videoState.duration)}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Canvas (Picture-in-Picture) */}
      {videoState.duration > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute bottom-4 right-4 bg-black/80 rounded-lg overflow-hidden border border-white/20"
          style={{ width: "160px", height: "90px" }}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain"
            style={{ filter: "brightness(0.9)" }}
          />
          <div className="absolute inset-0 border border-white/10 rounded-lg pointer-events-none" />
        </motion.div>
      )}

      {/* Loading Spinner */}
      {!videoState.duration && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <ReloadOutlined spin style={{ fontSize: "2rem" }} />
            <div style={{ marginTop: "1rem" }}>Đang tải video...</div>
          </div>
        </div>
      )}
    </div>
  );
};

VideoPlayer.propTypes = {
  videoRef: PropTypes.object.isRequired,
  videoState: PropTypes.object.isRequired,
  togglePlayPause: PropTypes.func.isRequired,
  seekTo: PropTypes.func.isRequired,
  setVolume: PropTypes.func.isRequired,
  toggleMute: PropTypes.func.isRequired,
  setPlaybackRate: PropTypes.func.isRequired,
  formatTime: PropTypes.func.isRequired,
  handleFullscreen: PropTypes.func.isRequired,
  canvasRef: PropTypes.object.isRequired,
  theme: PropTypes.string.isRequired,
  showTooltips: PropTypes.bool,
  videoInfo: PropTypes.object,
};

VideoPlayer.defaultProps = {
  showTooltips: true,
  videoInfo: null,
};

export default VideoPlayer;

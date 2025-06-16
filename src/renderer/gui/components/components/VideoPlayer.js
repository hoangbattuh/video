import React from "react";
import {
  Slider,
  Button,
  Title,
  Text,
  Tooltip,
  Dropdown,
  Typography,
} from "antd";
import PropTypes from "prop-types";
import {
  StepBackwardOutlined,
  PlayCircleOutlined,
  PauseOutlined,
  StepForwardOutlined,
  SoundOutlined,
  MutedOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from "@ant-design/icons";

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
  speedMenu,
  canvasRef,
  theme,
}) => (
  <div
    className={`relative rounded-xl overflow-hidden mb-4 ${
      theme === "dark" ? "bg-gray-900" : "bg-black"
    }`}
  >
    <video
      ref={videoRef}
      className="w-full max-h-[70vh] object-contain"
      onClick={togglePlayPause}
      onDoubleClick={handleFullscreen}
    />
    {!videoState.duration && (
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center ${
          theme === "dark" ? "bg-gray-800" : "bg-gray-200"
        }`}
      >
        <div className="text-center p-8">
          <span className="text-6xl text-gray-400 mb-4">🎬</span>
          <span
            className={`text-lg block mb-2 ${
              theme === "dark" ? "text-gray-300" : "text-gray-500"
            }`}
          >
            Kéo thả video vào đây hoặc click để tải
          </span>
          <span
            className={`text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-400"
            }`}
          >
            Hỗ trợ: MP4, AVI, MOV, MKV, WebM
          </span>
        </div>
      </div>
    )}
    {videoState.duration > 0 && (
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        <div className="absolute top-4 right-4 flex space-x-2">
          <Tooltip title="Tốc độ phát">
            <Dropdown overlay={speedMenu} trigger={["click"]}>
              <Button
                type="text"
                className="text-white bg-black/50 hover:bg-black/70"
                size="small"
              >
                {videoState.playbackRate}x
              </Button>
            </Dropdown>
          </Tooltip>
          <Tooltip title="Toàn màn hình">
            <Button
              type="text"
              icon={
                document.fullscreenElement ? (
                  <FullscreenExitOutlined />
                ) : (
                  <FullscreenOutlined />
                )
              }
              className="text-white bg-black/50 hover:bg-black/70"
              size="small"
              onClick={handleFullscreen}
            />
          </Tooltip>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            type="text"
            icon={
              videoState.isPlaying ? <PauseOutlined /> : <PlayCircleOutlined />
            }
            onClick={togglePlayPause}
            className="text-white text-4xl w-16 h-16 flex items-center justify-center bg-black/50 hover:bg-black/70 rounded-full"
          />
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center space-x-3">
            <Button
              type="text"
              icon={<StepBackwardOutlined />}
              onClick={() => seekTo(Math.max(0, videoState.currentTime - 10))}
              className="text-white bg-black/50 hover:bg-black/70"
              size="small"
            />
            <Button
              type="text"
              icon={
                videoState.isPlaying ? (
                  <PauseOutlined />
                ) : (
                  <PlayCircleOutlined />
                )
              }
              onClick={togglePlayPause}
              className="text-white bg-black/50 hover:bg-black/70"
            />
            <Button
              type="text"
              icon={<StepForwardOutlined />}
              onClick={() =>
                seekTo(
                  Math.min(videoState.duration, videoState.currentTime + 10)
                )
              }
              className="text-white bg-black/50 hover:bg-black/70"
              size="small"
            />
            <div className="flex-1 mx-4">
              <Slider
                min={0}
                max={videoState.duration}
                value={videoState.currentTime}
                step={0.1}
                onChange={seekTo}
                tooltip={{ formatter: formatTime }}
                className="video-progress-slider"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button
                type="text"
                icon={videoState.muted ? <MutedOutlined /> : <SoundOutlined />}
                onClick={toggleMute}
                className="text-white bg-black/50 hover:bg-black/70"
                size="small"
              />
              <div className="w-20">
                <Slider
                  min={0}
                  max={1}
                  step={0.1}
                  value={videoState.volume}
                  onChange={setVolume}
                  tooltip={{
                    formatter: (value) => `${Math.round(value * 100)}%`,
                  }}
                />
              </div>
              <span className="text-white text-xs min-w-max bg-black/50 px-2 py-1 rounded">
                {formatTime(videoState.currentTime)} /{" "}
                {formatTime(videoState.duration || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    )}
    {/* Preview canvas */}
    {videoState.duration > 0 && (
      <div
        className="absolute bottom-2 right-2 bg-black/70 rounded-lg overflow-hidden"
        style={{ width: "160px", height: "90px" }}
      >
        <canvas ref={canvasRef} className="w-full h-full object-contain" />
      </div>
    )}
  </div>
);

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
  speedMenu: PropTypes.object.isRequired,
  canvasRef: PropTypes.object.isRequired,
  theme: PropTypes.string.isRequired,
};

export default VideoPlayer;

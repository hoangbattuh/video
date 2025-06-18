import React, { memo, useState, useCallback } from "react";
import { Card, Typography, Button, Upload, message } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import {
  VideoCameraOutlined,
  CloudUploadOutlined,
  FileAddOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import VideoPlayer from "./VideoPlayer";
import TimelineControls from "./TimelineControls";
import '../CutVideo.css';


const { Title, Text } = Typography;
const { Dragger } = Upload;

const MainContent = memo(
  ({
    videoInfo,
    videoRef,
    videoState,
    canvasRef,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    handleTimelineChange,
    togglePlayPause,
    seekTo,
    setVolume,
    toggleMute,
    setPlaybackRate,
    formatTime,
    setVideoInfo,
    showTooltips,
    theme,
    dragActive,
    handleFullscreen,
  }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const showNoFileNotice = !videoInfo.selectedFile;

    const selectFile = useCallback(() => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "video/*,audio/*";
      input.multiple = false;
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          handleFileSelect(file);
        }
      };
      input.click();
    }, [handleFileSelect]);

    // Enhanced upload props
    const uploadProps = {
      name: "video",
      multiple: false,
      accept: "video/*,audio/*",
      showUploadList: false,
      beforeUpload: (file) => {
        handleFileSelect(file);
        return false; // Prevent automatic upload
      },
      onDrop: (e) => {
        setIsDragOver(false);
        handleDrop(e);
      },
      onDragEnter: () => setIsDragOver(true),
      onDragLeave: () => setIsDragOver(false),
    };

    const recentFormats = [
      { name: "MP4", icon: "🎬", description: "Phổ biến nhất" },
      { name: "AVI", icon: "📹", description: "Chất lượng cao" },
      { name: "MOV", icon: "🎥", description: "Apple format" },
      { name: "MKV", icon: "📺", description: "Container mạnh" },
      { name: "WebM", icon: "🌐", description: "Web optimized" },
      { name: "FLV", icon: "⚡", description: "Flash video" },
    ];

    return (
      <div
        className={`mainContent ${theme === "dark" ? "dark" : ""}`}
      >
        {/* Video Player Area */}
        <div className="videoPlayerContainer">
          <AnimatePresence mode="wait">
            {showNoFileNotice ? (
              <motion.div
                key="no-video"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-4xl"
              >
                <Dragger
                  {...uploadProps}
                  className={`noVideoState ${isDragOver ? "dragOver" : ""}`}
                  style={{
                    border: isDragOver
                      ? "3px dashed #667eea"
                      : "3px dashed rgba(102, 126, 234, 0.3)",
                    background: isDragOver
                      ? "rgba(102, 126, 234, 0.1)"
                      : "rgba(102, 126, 234, 0.05)",
                  }}
                >
                  <motion.div
                    animate={isDragOver ? { scale: 1.05 } : { scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="noVideoIcon">
                      <VideoCameraOutlined />
                    </div>

                    <Title level={2} className="noVideoTitle">
                      {isDragOver
                        ? "Thả file vào đây"
                        : "Chọn video để bắt đầu"}
                    </Title>

                    <Text className="noVideoSubtitle">
                      Kéo thả file video vào đây hoặc click để duyệt
                    </Text>

                    <div style={{ marginTop: "2rem", marginBottom: "2rem" }}>
                      <Button
                        type="primary"
                        icon={<CloudUploadOutlined />}
                        size="large"
                        className="selectVideoButton"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectFile();
                        }}
                      >
                        Chọn Video
                      </Button>
                    </div>

                    {/* Supported Formats */}
                    <div style={{ marginTop: "2rem" }}>
                      <Text
                        style={{
                          display: "block",
                          marginBottom: "1rem",
                          fontWeight: 600,
                          color: "rgba(102, 126, 234, 0.8)",
                        }}
                      >
                        Định dạng được hỗ trợ:
                      </Text>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(120px, 1fr))",
                          gap: "0.5rem",
                          maxWidth: "600px",
                          margin: "0 auto",
                        }}
                      >
                        {recentFormats.map((format) => (
                          <motion.div
                            key={format.name}
                            whileHover={{ scale: 1.05 }}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              padding: "0.5rem",
                              background: "rgba(102, 126, 234, 0.1)",
                              borderRadius: "8px",
                              border: "1px solid rgba(102, 126, 234, 0.2)",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "1.2rem",
                                marginBottom: "0.25rem",
                              }}
                            >
                              {format.icon}
                            </span>
                            <Text
                              style={{
                                fontWeight: 600,
                                fontSize: "0.85rem",
                                color: "rgba(102, 126, 234, 0.9)",
                              }}
                            >
                              {format.name}
                            </Text>
                            <Text
                              style={{
                                fontSize: "0.7rem",
                                opacity: 0.7,
                                color: "rgba(102, 126, 234, 0.7)",
                              }}
                            >
                              {format.description}
                            </Text>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Tips */}
                    <div style={{ marginTop: "2rem" }}>
                      <div
                        style={{
                          background: "rgba(255, 255, 255, 0.8)",
                          padding: "1rem",
                          borderRadius: "12px",
                          border: "1px solid rgba(102, 126, 234, 0.2)",
                          maxWidth: "500px",
                          margin: "0 auto",
                        }}
                      >
                        <Text
                          style={{
                            fontWeight: 600,
                            color: "rgba(102, 126, 234, 0.9)",
                            display: "block",
                            marginBottom: "0.5rem",
                          }}
                        >
                          💡 Mẹo sử dụng:
                        </Text>
                        <ul
                          style={{
                            textAlign: "left",
                            margin: 0,
                            paddingLeft: "1rem",
                            color: "rgba(102, 126, 234, 0.8)",
                            fontSize: "0.85rem",
                          }}
                        >
                          <li>Hỗ trợ file lên đến 5GB</li>
                          <li>Kéo thả trực tiếp từ file explorer</li>
                          <li>
                            Phím tắt: Space = play/pause, I = đặt điểm đầu, O =
                            đặt điểm cuối
                          </li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                </Dragger>
              </motion.div>
            ) : (
              <motion.div
                key="video-player"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-6xl"
              >
                <VideoPlayer
                  videoRef={videoRef}
                  videoState={videoState}
                  canvasRef={canvasRef}
                  togglePlayPause={togglePlayPause}
                  seekTo={seekTo}
                  setVolume={setVolume}
                  toggleMute={toggleMute}
                  setPlaybackRate={setPlaybackRate}
                  formatTime={formatTime}
                  handleFullscreen={handleFullscreen}
                  theme={theme}
                  showTooltips={showTooltips}
                  videoInfo={videoInfo}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Timeline Controls */}
        <AnimatePresence>
          {!showNoFileNotice && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="timelineContainer"
            >
              <TimelineControls
                videoState={videoState}
                videoInfo={videoInfo}
                onTimelineChange={handleTimelineChange}
                formatTime={formatTime}
                setVideoInfo={setVideoInfo}
                seekTo={seekTo}
                theme={theme}
                showTooltips={showTooltips}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Additional Quick Actions for Video Loaded State */}
        <AnimatePresence>
          {!showNoFileNotice && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                display: "flex",
                gap: "8px",
                zIndex: 10,
              }}
            >
              <Button
                icon={<FileAddOutlined />}
                onClick={selectFile}
                type="primary"
                ghost
                size="small"
                style={{
                  background: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(102, 126, 234, 0.3)",
                  color: "#667eea",
                }}
              >
                Chọn video khác
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video Info Overlay */}
        <AnimatePresence>
          {!showNoFileNotice && videoInfo.selectedFile && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              style={{
                position: "absolute",
                bottom: "20px",
                left: "20px",
                background: "rgba(0, 0, 0, 0.7)",
                color: "white",
                padding: "12px 16px",
                borderRadius: "8px",
                backdropFilter: "blur(10px)",
                fontSize: "0.85rem",
                zIndex: 10,
              }}
            >
              <div>
                <strong>{videoInfo.selectedFile.name}</strong>
              </div>
              <div style={{ opacity: 0.8, marginTop: "4px" }}>
                {videoState.videoWidth}×{videoState.videoHeight} •{" "}
                {formatTime(videoState.duration)} •{" "}
                {(videoInfo.selectedFile.size / (1024 * 1024)).toFixed(1)} MB
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

MainContent.displayName = "MainContent";

export default MainContent;

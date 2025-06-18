import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  memo,
  useMemo,
} from "react";
import { message, FloatButton, Affix } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import {
  SaveOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  BugOutlined,
} from "@ant-design/icons";

import ProgressModal from "./Cutvideo-components/ProgressModal";
import Header from "./Cutvideo-components/Header";
import LeftSidebar from "./Cutvideo-components/LeftSidebar";
import MainContent from "./Cutvideo-components/MainContent";
import RightSidebar from "./Cutvideo-components/RightSidebar";
import SettingsModal from "./Cutvideo-components/SettingsModal";
import ShortcutsModal from "./Cutvideo-components/ShortcutsModal";
import useVideoPlayer from "../hooks/useVideoPlayer";
import useVideoProcessor from "../hooks/useVideoProcessor";
import useFileManager from "../hooks/useFileManager";
import useVideoSettings from "./hooks/useVideoSettings";
import "./CutVideo.css"; 

const CutVideo = memo(() => {
  // Custom hooks
  const {
    videoInfo,
    setVideoInfo,
    activeTab,
    setActiveTab,
    theme,
    autoSave,
    setAutoSave,
    showTooltips,
    setShowTooltips,
    showSettings,
    setShowSettings,
    showShortcuts,
    setShowShortcuts,
    selectedPreset,
    platformPresets,
    groupedOptions,
    handleAdvancedOptionChange,
    handleModeChange,
    applyPreset,
    toggleTheme,
    saveSettings,
    resetSettings,
    formatTime,
  } = useVideoSettings();

  const canvasRef = useRef(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [processingStats, setProcessingStats] = useState({
    startTime: null,
    estimatedTime: null,
    speed: null,
  });

  // Enhanced video player hook
  const {
    videoRef,
    videoState,
    updateVideoState,
    togglePlayPause,
    seekTo,
    setVolume,
    toggleMute,
    setPlaybackRate,
  } = useVideoPlayer();

  // Enhanced video processor hook
  const { processing, progress, error, processVideo, initWorker } =
    useVideoProcessor();

  // Enhanced file manager hook
  const {
    files,
    saveDir,
    recentFiles,
    addFile,
    removeFile,
    selectSaveDirectory,
  } = useFileManager();

  // Enhanced file selection with drag and drop support
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
  }, []);

  // Enhanced file handling with validation and metadata extraction
  const handleFileSelect = useCallback(
    (file) => {
      if (typeof file === "object" && file.file) {
        file = file.file;
      }

      // Validate file type
      if (!file.type.startsWith("video/") && !file.type.startsWith("audio/")) {
        message.error("Vui lòng chọn file video hoặc audio hợp lệ!");
        return;
      }

      // Validate file size (max 5GB)
      const maxSize = 5 * 1024 * 1024 * 1024; // 5GB
      if (file.size > maxSize) {
        message.error("File quá lớn! Vui lòng chọn file nhỏ hơn 5GB.");
        return;
      }

      const fileInfo = addFile(file);
      const video = videoRef.current;

      if (!video) return;

      // Show loading state
      message.loading("Đang tải video...", 0);

      video.src = fileInfo.url;

      video.onloadedmetadata = () => {
        message.destroy();

        updateVideoState({
          duration: video.duration,
          currentTime: 0,
          isPlaying: false,
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
        });

        setVideoInfo((prev) => ({
          ...prev,
          cutEnd: Math.min(30, video.duration), // Default to 30 seconds or full duration
          selectedFile: fileInfo,
        }));

        initWorker();
        renderFrame();

        message.success(`Video đã được tải: ${formatTime(video.duration)}`);
      };

      video.onerror = (e) => {
        message.destroy();
        message.error("Không thể tải video. Vui lòng kiểm tra định dạng file.");
        removeFile(fileInfo.id);
        console.error("Video load error:", e);
      };
    },
    [
      addFile,
      updateVideoState,
      initWorker,
      removeFile,
      setVideoInfo,
      formatTime,
    ]
  );

  // Enhanced frame rendering with optimization
  const renderFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (video.videoWidth && video.videoHeight) {
      // Set canvas dimensions with device pixel ratio for crisp rendering
      const devicePixelRatio = window.devicePixelRatio || 1;
      const displayWidth = 160;
      const displayHeight = 90;

      canvas.width = displayWidth * devicePixelRatio;
      canvas.height = displayHeight * devicePixelRatio;
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;

      ctx.scale(devicePixelRatio, devicePixelRatio);
      ctx.drawImage(video, 0, 0, displayWidth, displayHeight);
    }
  }, []);

  // Enhanced video cutting with progress tracking
  const handleCutVideo = useCallback(async () => {
    if (!videoInfo.selectedFile) {
      message.error("Vui lòng chọn video trước");
      return;
    }

    if (videoInfo.cutStart >= videoInfo.cutEnd) {
      message.error("Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc");
      return;
    }

    const duration = videoInfo.cutEnd - videoInfo.cutStart;
    if (duration < 0.1) {
      message.error("Thời lượng cắt quá ngắn (tối thiểu 0.1 giây)");
      return;
    }

    setShowProgressModal(true);
    setProcessingStats({
      startTime: Date.now(),
      estimatedTime: duration * 2, // Rough estimate
      speed: null,
    });

    try {
      const options = {
        startTime: videoInfo.cutStart,
        endTime: videoInfo.cutEnd,
        mode: videoInfo.mode,
        lossless: videoInfo.lossless,
        snapKeyframe: videoInfo.snapKeyframe,
        outputPath: saveDir,
        ...videoInfo.advancedOptions,
      };

      if (videoInfo.mode === "segments") {
        options.multiType = videoInfo.multiType;
        options.segmentTime = videoInfo.segmentTime;
        options.segmentCount = videoInfo.segmentCount;
      }

      await processVideo(videoInfo.selectedFile, options);

      const processingTime = (Date.now() - processingStats.startTime) / 1000;
      message.success(
        `Cắt video thành công! Thời gian xử lý: ${formatTime(processingTime)}`
      );
    } catch (err) {
      console.error("Video processing error:", err);
      message.error(`Lỗi khi cắt video: ${err.message}`);
    } finally {
      setShowProgressModal(false);
      setProcessingStats({
        startTime: null,
        estimatedTime: null,
        speed: null,
      });
    }
  }, [videoInfo, processVideo, saveDir, processingStats.startTime, formatTime]);

  // Enhanced keyboard shortcuts
  const handleKeyPress = useCallback(
    (e) => {
      if (!videoRef.current) return;

      // Don't handle shortcuts when focused on input elements
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.contentEditable === "true"
      )
        return;

      const step = e.shiftKey ? 1 : 10; // Fine control with Shift
      const volumeStep = e.shiftKey ? 0.01 : 0.1;

      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlayPause();
          break;
        case "ArrowLeft":
          e.preventDefault();
          seekTo(Math.max(0, videoState.currentTime - step));
          break;
        case "ArrowRight":
          e.preventDefault();
          seekTo(Math.min(videoState.duration, videoState.currentTime + step));
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume(Math.min(1, videoState.volume + volumeStep));
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume(Math.max(0, videoState.volume - volumeStep));
          break;
        case "m":
        case "M":
          e.preventDefault();
          toggleMute();
          break;
        case "f":
        case "F":
          e.preventDefault();
          handleFullscreen();
          break;
        case "i":
        case "I":
          e.preventDefault();
          setVideoInfo((prev) => ({
            ...prev,
            cutStart: videoState.currentTime,
          }));
          message.success(
            `Đặt điểm bắt đầu: ${formatTime(videoState.currentTime)}`
          );
          break;
        case "o":
        case "O":
          e.preventDefault();
          setVideoInfo((prev) => ({
            ...prev,
            cutEnd: videoState.currentTime,
          }));
          message.success(
            `Đặt điểm kết thúc: ${formatTime(videoState.currentTime)}`
          );
          break;
        case "Enter":
          if (e.ctrlKey) {
            e.preventDefault();
            handleCutVideo();
          }
          break;
        case "Escape":
          e.preventDefault();
          if (showSettings) setShowSettings(false);
          if (showShortcuts) setShowShortcuts(false);
          break;
        default:
          break;
      }
    },
    [
      togglePlayPause,
      seekTo,
      videoState,
      setVolume,
      toggleMute,
      handleCutVideo,
      setVideoInfo,
      formatTime,
      showSettings,
      showShortcuts,
      setShowSettings,
      setShowShortcuts,
    ]
  );

  // Enhanced drag and drop with visual feedback
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragActive(false);

      const files = Array.from(e.dataTransfer.files);
      const videoFile = files.find(
        (file) =>
          file.type.startsWith("video/") || file.type.startsWith("audio/")
      );

      if (videoFile) {
        handleFileSelect(videoFile);
      } else {
        message.warning("Vui lòng chọn file video hoặc audio hợp lệ!");
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragActive(false);
    }
  }, []);

  // Timeline change handler with validation
  const handleTimelineChange = useCallback(
    ([start, end]) => {
      // Validate timeline bounds
      const validStart = Math.max(0, Math.min(start, videoState.duration));
      const validEnd = Math.max(
        validStart + 0.1,
        Math.min(end, videoState.duration)
      );

      setVideoInfo((prev) => ({
        ...prev,
        cutStart: validStart,
        cutEnd: validEnd,
      }));

      seekTo(validStart);
      renderFrame();
    },
    [seekTo, renderFrame, videoState.duration, setVideoInfo]
  );

  // Fullscreen handler with error handling
  const handleFullscreen = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        video.requestFullscreen();
      }
    } catch (e) {
      console.error("Fullscreen error:", e);
      message.error("Trình duyệt không hỗ trợ chế độ toàn màn hình");
    }
  }, []);

  // Auto-save settings with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (autoSave) {
        const settings = {
          mode: videoInfo.mode,
          lossless: videoInfo.lossless,
          snapKeyframe: videoInfo.snapKeyframe,
          segmentTime: videoInfo.segmentTime,
          segmentCount: videoInfo.segmentCount,
          multiType: videoInfo.multiType,
          advancedOptions: videoInfo.advancedOptions,
          theme,
          showTooltips,
        };
        localStorage.setItem("cutVideoSettings", JSON.stringify(settings));
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [videoInfo, theme, showTooltips, autoSave]);

  // Load saved settings on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("cutVideoSettings");
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setVideoInfo((prev) => ({ ...prev, ...settings }));
      }
    } catch (error) {
      console.warn("Failed to load saved settings:", error);
    }
  }, [setVideoInfo]);

  // Enhanced video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      updateVideoState({ currentTime: video.currentTime });
      renderFrame();
    };

    const handleLoadedData = () => {
      updateVideoState({
        duration: video.duration,
        currentTime: video.currentTime,
      });
    };

    const handleEnded = () => {
      updateVideoState({ isPlaying: false });
      message.info("Video đã phát xong");
    };

    const handleError = (e) => {
      console.error("Video playback error:", e);
      message.error("Lỗi phát video");
    };

    // Throttled time update for performance
    let timeUpdateTimeout;
    const throttledUpdateTime = () => {
      clearTimeout(timeUpdateTimeout);
      timeUpdateTimeout = setTimeout(updateTime, 100);
    };

    video.addEventListener("timeupdate", throttledUpdateTime);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);

    return () => {
      clearTimeout(timeUpdateTimeout);
      video.removeEventListener("timeupdate", throttledUpdateTime);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
    };
  }, [updateVideoState, renderFrame]);

  // Keyboard shortcuts
  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  // Processing stats update
  useEffect(() => {
    if (processing && processingStats.startTime) {
      const interval = setInterval(() => {
        const elapsed = (Date.now() - processingStats.startTime) / 1000;
        const speed = progress / elapsed;
        setProcessingStats((prev) => ({
          ...prev,
          speed,
          estimatedTime: speed > 0 ? (100 - progress) / speed : null,
        }));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [processing, progress, processingStats.startTime]);

  // Main component render
  return (
    <div
      tabIndex={0}
      aria-label="Khu vực kéo và thả video"
      className={`cutVideoWrapper ${theme === "dark" ? "dark" : ""}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectFile(); // hoặc thao tác bạn muốn khi nhấn Enter / Space
        }
      }}
    >
      {/* Drag overlay */}
      <AnimatePresence>
        {dragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="dragOverlay"
          >
            <div className="dragContent">
              <div className="dragIcon">📎</div>
              <h3>Thả file video vào đây</h3>
              <p>Hỗ trợ các định dạng: MP4, AVI, MOV, MKV, WebM...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <Header
        theme={theme}
        selectFile={selectFile}
        selectSaveDirectory={selectSaveDirectory}
        setShowSettings={setShowSettings}
        setShowShortcuts={setShowShortcuts}
        toggleTheme={toggleTheme}
        showTooltips={showTooltips}
        videoInfo={videoInfo}
        processingStats={processingStats}
      />

      {/* Main Layout */}
      <motion.div
        className="mainLayout"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Left Sidebar */}
        <LeftSidebar
          theme={theme}
          recentFiles={recentFiles}
          handleFileSelect={handleFileSelect}
          removeFile={removeFile}
          platformPresets={platformPresets}
          selectedPreset={selectedPreset}
          applyPreset={applyPreset}
          showTooltips={showTooltips}
        />

        {/* Main Content */}
        <MainContent
          theme={theme}
          videoInfo={videoInfo}
          videoRef={videoRef}
          canvasRef={canvasRef}
          videoState={videoState}
          handleFileSelect={handleFileSelect}
          handleDrop={handleDrop}
          handleDragOver={handleDragOver}
          togglePlayPause={togglePlayPause}
          seekTo={seekTo}
          setVolume={setVolume}
          toggleMute={toggleMute}
          setPlaybackRate={setPlaybackRate}
          handleFullscreen={handleFullscreen}
          handleTimelineChange={handleTimelineChange}
          setVideoInfo={setVideoInfo}
          formatTime={formatTime}
          showTooltips={showTooltips}
          dragActive={dragActive}
        />

        {/* Right Sidebar */}
        <RightSidebar
          videoInfo={videoInfo}
          setVideoInfo={setVideoInfo}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleModeChange={handleModeChange}
          handleAdvancedOptionChange={handleAdvancedOptionChange}
          handleCutVideo={handleCutVideo}
          groupedOptions={groupedOptions}
          formatTime={formatTime}
          showTooltips={showTooltips}
          videoState={videoState}
          theme={theme}
          processing={processing}
        />
      </motion.div>

      {/* Floating Action Buttons */}
      <Affix offsetBottom={24} style={{ position: "absolute", right: 24 }}>
        <FloatButton.Group
          trigger="hover"
          type="primary"
          style={{ right: 24 }}
          icon={<SettingOutlined />}
        >
          <FloatButton
            icon={<SaveOutlined />}
            tooltip="Lưu cài đặt"
            onClick={saveSettings}
          />
          <FloatButton
            icon={<ReloadOutlined />}
            tooltip="Đặt lại cài đặt"
            onClick={resetSettings}
          />
          <FloatButton
            icon={<QuestionCircleOutlined />}
            tooltip="Phím tắt"
            onClick={() => setShowShortcuts(true)}
          />
          {process.env.NODE_ENV === "development" && (
            <FloatButton
              icon={<BugOutlined />}
              tooltip="Debug"
              onClick={() => console.log({ videoInfo, videoState, processing })}
            />
          )}
        </FloatButton.Group>
      </Affix>

      {/* Modals */}
      <SettingsModal
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        theme={theme}
        autoSave={autoSave}
        setAutoSave={setAutoSave}
        showTooltips={showTooltips}
        setShowTooltips={setShowTooltips}
        saveSettings={saveSettings}
        resetSettings={resetSettings}
      />

      <ShortcutsModal
        showShortcuts={showShortcuts}
        setShowShortcuts={setShowShortcuts}
        theme={theme}
      />

      <ProgressModal
        showProgressModal={showProgressModal}
        theme={theme}
        progress={progress}
        processing={processing}
        videoInfo={videoInfo}
        processingStats={processingStats}
        formatTime={formatTime}
      />

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="errorNotification"
          >
            <div className="errorContent">
              <span className="errorIcon">⚠️</span>
              <span>{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

CutVideo.displayName = "CutVideo";

export default CutVideo;

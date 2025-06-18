import React, { useState, useEffect, useCallback } from "react";
import { Layout, message, FloatButton, Affix } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import {
  SaveOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  BugOutlined,
  ExportOutlined,
} from "@ant-design/icons";

import MergeVideoHeader from "./MergeVideo-components/MergeVideoHeader";
import MediaLibrary from "./MergeVideo-components/MediaLibrary";
import Timeline from "./MergeVideo-components/Timeline";
import PreviewPanel from "./MergeVideo-components/PreviewPanel";
import SettingsPanel from "./MergeVideo-components/SettingsPanel";
import TransitionPanel from "./MergeVideo-components/TransitionPanel";
import ExportProgressModal from "./MergeVideo-components/ExportProgressModal";
import SettingsModal from "./MergeVideo-components/SettingsModal";
import HelpModal from "./MergeVideo-components/HelpModal";
import useMergeVideo from "./hooks/useMergeVideo";
import  './styles/MergeVideo.css';

const { Content } = Layout;

export default function MergeVideo() {
  const {
    // State
    videoFiles,
    timelineClips,
    currentClip,
    isPlaying,
    currentTime,
    totalDuration,
    volume,
    playbackSpeed,
    currentMode,
    theme,
    showTooltips,
    isFullscreen,
    isExporting,
    exportProgress,
    exportSettings,
    showSettings,
    showHelp,

    // Setters
    setCurrentMode,
    setShowSettings,
    setShowHelp,
    setShowTooltips,

    // Handlers
    handleImportFiles,
    handleRemoveFile,
    handlePreviewFile,
    handleDragStart,
    handleTimelineDrop,
    handleClipMove,
    handleClipDelete,
    handleClipSplit,
    handlePlay,
    handlePause,
    handleSeek,
    handleVolumeChange,
    handleSpeedChange,
    handlePrevFrame,
    handleNextFrame,
    handleFullscreen,
    toggleTheme,
    handleSettingsChange,
    handleExportVideo,
    handleSaveProject,
    handlePreviewProject,
    handleRefresh,
    handleSavePreset,
    handleLoadPreset,
    handleResetSettings,
  } = useMergeVideo();

  const [selectedClips, setSelectedClips] = useState([]);
  const [selectedClipIndex, setSelectedClipIndex] = useState(-1);
  const [dragActive, setDragActive] = useState(false);
  const [layoutMode, setLayoutMode] = useState("standard"); // standard, compact, wide

  // Handle clip selection
  const handleClipSelect = useCallback(
    (index) => {
      setSelectedClipIndex(index);
      if (index >= 0 && timelineClips[index]) {
        setSelectedClips([timelineClips[index]]);
      } else {
        setSelectedClips([]);
      }
    },
    [timelineClips],
  );

  // Handle multiple clip selection for transitions
  const handleMultipleClipSelect = useCallback(
    (indices) => {
      const clips = indices
        .map((index) => timelineClips[index])
        .filter(Boolean);
      setSelectedClips(clips);
    },
    [timelineClips],
  );

  // Handle clip property changes
  const handleClipPropertyChange = useCallback((index, properties) => {
    // Update clip properties in timeline
    console.log("Updating clip properties:", index, properties);
  }, []);

  // Handle transition application
  const handleApplyTransition = useCallback(
    (transitionConfig) => {
      if (selectedClips.length < 2) {
        message.warning(
          "Cần chọn ít nhất 2 clip để áp dụng hiệu ứng chuyển cảnh",
        );
        return;
      }

      console.log("Applying transition:", transitionConfig);
      message.success("Đã áp dụng hiệu ứng chuyển cảnh");
    },
    [selectedClips],
  );

  // Handle transition preview
  const handlePreviewTransition = useCallback(
    (transitionConfig) => {
      if (selectedClips.length < 2) {
        message.warning("Cần chọn ít nhất 2 clip để xem trước hiệu ứng");
        return;
      }

      console.log("Previewing transition:", transitionConfig);
      message.info("Đang xem trước hiệu ứng chuyển cảnh...");
    },
    [selectedClips],
  );

  // Drag and drop handlers
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

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragActive(false);
      handleTimelineDrop(e);
    },
    [handleTimelineDrop],
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  // Layout configuration based on mode and screen size
  const getLayoutConfig = useCallback(() => {
    const baseConfig = {
      beginner: {
        showTransitions: false,
        showAdvancedSettings: false,
        timelineHeight: "200px",
      },
      pro: {
        showTransitions: true,
        showAdvancedSettings: true,
        timelineHeight: "250px",
      },
      expert: {
        showTransitions: true,
        showAdvancedSettings: true,
        timelineHeight: "300px",
      },
    };

    return baseConfig[currentMode] || baseConfig.pro;
  }, [currentMode]);

  const layoutConfig = getLayoutConfig();

  // Responsive layout classes
  const getLayoutClasses = useCallback(() => {
    const baseClasses = `mergeVideoContainer ${theme} ${`mode-${currentMode}`}`;

    if (layoutMode === "compact") {
      return `${baseClasses} compactLayout`;
    }
    if (layoutMode === "wide") {
      return `${baseClasses} wideLayout`;
    }

    return baseClasses;
  }, [theme, currentMode, layoutMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          isPlaying ? handlePause() : handlePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          handleSeek(Math.max(0, currentTime - (e.shiftKey ? 1 : 10)));
          break;
        case "ArrowRight":
          e.preventDefault();
          handleSeek(
            Math.min(totalDuration, currentTime + (e.shiftKey ? 1 : 10)),
          );
          break;
        case "Delete":
          if (selectedClipIndex >= 0) {
            handleClipDelete(selectedClipIndex);
          }
          break;
        case "Escape":
          setSelectedClipIndex(-1);
          setSelectedClips([]);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [
    isPlaying,
    currentTime,
    totalDuration,
    selectedClipIndex,
    handlePlay,
    handlePause,
    handleSeek,
    handleClipDelete,
  ]);

  return (
    <div
      className={getLayoutClasses()}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
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
              <div className="dragIcon">🎥</div>
              <h3>Thả video vào đây để thêm vào timeline</h3>
              <p>Hỗ trợ các định dạng: MP4, AVI, MOV, MKV, WebM...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Layout style={{ height: "100vh", background: "transparent" }}>
        {/* Header */}
        <MergeVideoHeader
          currentMode={currentMode}
          onModeChange={setCurrentMode}
          theme={theme}
          onThemeToggle={toggleTheme}
          showTooltips={showTooltips}
          onTooltipsToggle={() => setShowTooltips(!showTooltips)}
          onImport={handleImportFiles}
          onPreview={handlePreviewProject}
          onExport={handleExportVideo}
          onSave={handleSaveProject}
          onSettings={() => setShowSettings(true)}
          onHelp={() => setShowHelp(true)}
          isExporting={isExporting}
          exportProgress={exportProgress}
          layoutMode={layoutMode}
          onLayoutModeChange={setLayoutMode}
          videoCount={videoFiles.length}
          timelineCount={timelineClips.length}
        />

        <Content className="mainContent">
          {/* Main workspace */}
          <motion.div
            className="workspaceContainer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Top Panel */}
            <div className="topPanel">
              {/* Left Panel - Media Library */}
              <motion.div
                className={`mediaLibraryContainer ${currentMode === "beginner" ? "beginnerMode" : ""}`}
                layout
                transition={{ duration: 0.3 }}
              >
                <MediaLibrary
                  videoFiles={videoFiles}
                  onAddFiles={handleImportFiles}
                  onRemoveFile={handleRemoveFile}
                  onPreviewFile={handlePreviewFile}
                  onDragStart={handleDragStart}
                  theme={theme}
                  currentMode={currentMode}
                  showTooltips={showTooltips}
                />
              </motion.div>

              {/* Center Panel - Preview */}
              <motion.div
                className="previewContainer"
                layout
                transition={{ duration: 0.3 }}
              >
                <PreviewPanel
                  currentClip={currentClip}
                  isPlaying={isPlaying}
                  currentTime={currentTime}
                  totalDuration={totalDuration}
                  volume={volume}
                  playbackSpeed={playbackSpeed}
                  isFullscreen={isFullscreen}
                  onPlay={handlePlay}
                  onPause={handlePause}
                  onSeek={handleSeek}
                  onVolumeChange={handleVolumeChange}
                  onSpeedChange={handleSpeedChange}
                  onPrevFrame={handlePrevFrame}
                  onNextFrame={handleNextFrame}
                  onFullscreen={handleFullscreen}
                  onRefresh={handleRefresh}
                  theme={theme}
                  currentMode={currentMode}
                  showTooltips={showTooltips}
                />
              </motion.div>

              {/* Right Panel - Settings */}
              <motion.div
                className={`settingsContainer ${currentMode === "beginner" ? "beginnerMode" : ""}`}
                layout
                transition={{ duration: 0.3 }}
              >
                <SettingsPanel
                  settings={exportSettings}
                  onChange={handleSettingsChange}
                  onSavePreset={handleSavePreset}
                  onLoadPreset={handleLoadPreset}
                  onReset={handleResetSettings}
                  theme={theme}
                  currentMode={currentMode}
                  showTooltips={showTooltips}
                  totalDuration={totalDuration}
                  clipCount={timelineClips.length}
                  showAdvanced={layoutConfig.showAdvancedSettings}
                />
              </motion.div>

              {/* Transitions Panel (Pro/Expert only) */}
              <AnimatePresence>
                {layoutConfig.showTransitions && (
                  <motion.div
                    className="transitionsContainer"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    layout
                  >
                    <TransitionPanel
                      selectedClips={selectedClips}
                      onApplyTransition={handleApplyTransition}
                      onPreviewTransition={handlePreviewTransition}
                      theme={theme}
                      currentMode={currentMode}
                      showTooltips={showTooltips}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Panel - Timeline */}
            <motion.div
              className="timelineContainer"
              style={{ height: layoutConfig.timelineHeight }}
              layout
              transition={{ duration: 0.3 }}
            >
              <Timeline
                timelineClips={timelineClips}
                currentTime={currentTime}
                totalDuration={totalDuration}
                selectedClipIndex={selectedClipIndex}
                isPlaying={isPlaying}
                onDrop={handleTimelineDrop}
                onClipSelect={handleClipSelect}
                onClipMove={handleClipMove}
                onClipDelete={handleClipDelete}
                onClipSplit={handleClipSplit}
                onClipPropertyChange={handleClipPropertyChange}
                onSeek={handleSeek}
                onPlay={handlePlay}
                onPause={handlePause}
                onMultipleSelect={handleMultipleClipSelect}
                theme={theme}
                currentMode={currentMode}
                showTooltips={showTooltips}
              />
            </motion.div>
          </motion.div>
        </Content>
      </Layout>

      {/* Floating Action Buttons */}
      <Affix offsetBottom={24} style={{ position: "absolute", right: 24 }}>
        <FloatButton.Group
          trigger="hover"
          type="primary"
          style={{ right: 24 }}
          icon={<SettingOutlined />}
        >
          <FloatButton
            icon={<ExportOutlined />}
            tooltip="Xuất video"
            onClick={handleExportVideo}
            disabled={timelineClips.length === 0}
          />
          <FloatButton
            icon={<SaveOutlined />}
            tooltip="Lưu dự án"
            onClick={handleSaveProject}
          />
          <FloatButton
            icon={<ReloadOutlined />}
            tooltip="Đặt lại cài đặt"
            onClick={handleResetSettings}
          />
          <FloatButton
            icon={<QuestionCircleOutlined />}
            tooltip="Trợ giúp"
            onClick={() => setShowHelp(true)}
          />
          {process.env.NODE_ENV === "development" && (
            <FloatButton
              icon={<BugOutlined />}
              tooltip="Debug"
              onClick={() =>
                console.log({
                  videoFiles,
                  timelineClips,
                  currentMode,
                  exportSettings,
                })
              }
            />
          )}
        </FloatButton.Group>
      </Affix>

      {/* Modals */}
      <ExportProgressModal
        visible={isExporting}
        progress={exportProgress}
        theme={theme}
        exportSettings={exportSettings}
        onCancel={() => {
          /* Handle cancel export */
        }}
      />

      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        theme={theme}
        settings={exportSettings}
        onChange={handleSettingsChange}
        onSave={handleSavePreset}
        onLoad={handleLoadPreset}
        onReset={handleResetSettings}
        currentMode={currentMode}
      />

      <HelpModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
        theme={theme}
        currentMode={currentMode}
      />

      {/* Toast notifications area */}
      <div id="toast-container" className="toastContainer" />
    </div>
  );
}

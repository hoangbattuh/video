import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Spin, message } from 'antd';
import MergeVideoHeader from './MergeVideo-components/MergeVideoHeader';
import MediaLibrary from './MergeVideo-components/MediaLibrary';
import Timeline from './MergeVideo-components/Timeline';
import PreviewPanel from './MergeVideo-components/PreviewPanel';
import SettingsPanel from './MergeVideo-components/SettingsPanel';
import TransitionPanel from './MergeVideo-components/TransitionPanel';
import useMergeVideo from './hooks/useMergeVideo';
import './styles/MergeVideo.css';

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
    handleResetSettings
  } = useMergeVideo();
  
  const [selectedClips, setSelectedClips] = useState([]);
  const [selectedClipIndex, setSelectedClipIndex] = useState(-1);
  
  // Handle clip selection
  const handleClipSelect = (index) => {
    setSelectedClipIndex(index);
    if (index >= 0 && timelineClips[index]) {
      setSelectedClips([timelineClips[index]]);
    } else {
      setSelectedClips([]);
    }
  };
  
  // Handle multiple clip selection for transitions
  const handleMultipleClipSelect = (indices) => {
    const clips = indices.map(index => timelineClips[index]).filter(Boolean);
    setSelectedClips(clips);
  };
  
  // Handle clip property changes
  const handleClipPropertyChange = (index, properties) => {
    // Update clip properties in timeline
    // This would be implemented in the hook
    console.log('Updating clip properties:', index, properties);
  };
  
  // Handle transition application
  const handleApplyTransition = (transitionConfig) => {
    if (selectedClips.length < 2) {
      message.warning('Cần chọn ít nhất 2 clip để áp dụng hiệu ứng chuyển cảnh');
      return;
    }
    
    console.log('Applying transition:', transitionConfig);
    message.success('Đã áp dụng hiệu ứng chuyển cảnh');
  };
  
  // Handle transition preview
  const handlePreviewTransition = (transitionConfig) => {
    if (selectedClips.length < 2) {
      message.warning('Cần chọn ít nhất 2 clip để xem trước hiệu ứng');
      return;
    }
    
    console.log('Previewing transition:', transitionConfig);
    message.info('Đang xem trước hiệu ứng chuyển cảnh...');
  };
  
  // Layout configuration based on mode
  const getLayoutConfig = () => {
    switch (currentMode) {
      case 'beginner':
        return {
          mediaLibrary: { span: 24 },
          preview: { span: 16 },
          settings: { span: 8 },
          timeline: { span: 24 },
          showTransitions: false
        };
      case 'pro':
        return {
          mediaLibrary: { span: 8 },
          preview: { span: 12 },
          settings: { span: 4 },
          timeline: { span: 20 },
          transitions: { span: 4 },
          showTransitions: true
        };
      case 'expert':
        return {
          mediaLibrary: { span: 6 },
          preview: { span: 12 },
          settings: { span: 6 },
          timeline: { span: 18 },
          transitions: { span: 6 },
          showTransitions: true
        };
      default:
        return {
          mediaLibrary: { span: 8 },
          preview: { span: 12 },
          settings: { span: 4 },
          timeline: { span: 20 },
          transitions: { span: 4 },
          showTransitions: true
        };
    }
  };
  
  const layoutConfig = getLayoutConfig();
  
  return (
    <div className={`merge-video-container ${theme} mode-${currentMode}`}>
      <Layout style={{ height: '100vh', background: 'transparent' }}>
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
        />
        
        <Content style={{ padding: '8px', overflow: 'hidden' }}>
          {/* Main workspace */}
          <Row gutter={[8, 8]} style={{ height: '100%' }}>
            {/* Left Panel - Media Library */}
            <Col {...layoutConfig.mediaLibrary} style={{ height: currentMode === 'beginner' ? '30%' : '100%' }}>
              <MediaLibrary
                files={videoFiles}
                onImport={handleImportFiles}
                onRemove={handleRemoveFile}
                onPreview={handlePreviewFile}
                onDragStart={handleDragStart}
                theme={theme}
                mode={currentMode}
                showTooltips={showTooltips}
              />
            </Col>
            
            {/* Center Panel - Preview */}
            <Col {...layoutConfig.preview} style={{ height: currentMode === 'beginner' ? '70%' : '100%' }}>
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
                mode={currentMode}
                showTooltips={showTooltips}
              />
            </Col>
            
            {/* Right Panel - Settings */}
            <Col {...layoutConfig.settings} style={{ height: '100%' }}>
              <SettingsPanel
                settings={exportSettings}
                onChange={handleSettingsChange}
                onSavePreset={handleSavePreset}
                onLoadPreset={handleLoadPreset}
                onReset={handleResetSettings}
                theme={theme}
                mode={currentMode}
                showTooltips={showTooltips}
                totalDuration={totalDuration}
                clipCount={timelineClips.length}
              />
            </Col>
            
            {/* Transitions Panel (Pro/Expert only) */}
            {layoutConfig.showTransitions && (
              <Col {...layoutConfig.transitions} style={{ height: '100%' }}>
                <TransitionPanel
                  selectedClips={selectedClips}
                  onApplyTransition={handleApplyTransition}
                  onPreviewTransition={handlePreviewTransition}
                  theme={theme}
                  mode={currentMode}
                  showTooltips={showTooltips}
                />
              </Col>
            )}
          </Row>
          
          {/* Bottom Panel - Timeline */}
          <div style={{ 
            position: 'absolute',
            bottom: 8,
            left: 8,
            right: 8,
            height: currentMode === 'beginner' ? '200px' : '250px'
          }}>
            <Timeline
              clips={timelineClips}
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
              mode={currentMode}
              showTooltips={showTooltips}
            />
          </div>
        </Content>
      </Layout>
      
      {/* Loading overlay during export */}
      {isExporting && (
        <div className="export-overlay">
          <Spin size="large" tip={`Đang xuất video... ${Math.round(exportProgress)}%`} />
        </div>
      )}
    </div>
  );
}
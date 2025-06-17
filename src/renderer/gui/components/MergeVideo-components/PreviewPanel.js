import React, { memo, useRef, useEffect, useState } from 'react';
import { Card, Button, Space, Slider, Select, Tooltip, Progress } from 'antd';
import {
  PlayCircleOutlined,
  PauseOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
  SoundOutlined,
  FullscreenOutlined,
  ExpandOutlined,
  CompressOutlined,
  ReloadOutlined
} from '@ant-design/icons';

const { Option } = Select;

const PreviewPanel = memo(({
  currentClip,
  currentTime,
  totalDuration,
  isPlaying,
  volume,
  playbackSpeed,
  isFullscreen,
  onPlay,
  onPause,
  onSeek,
  onVolumeChange,
  onSpeedChange,
  onFullscreen,
  onPrevFrame,
  onNextFrame,
  onRefresh,
  currentMode,
  theme,
  showTooltips,
  previewQuality = 'medium'
}) => {
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      
      const handleLoadStart = () => setIsLoading(true);
      const handleLoadedData = () => {
        setIsLoading(false);
        setError(null);
        setVideoSize({
          width: video.videoWidth,
          height: video.videoHeight
        });
      };
      const handleError = () => {
        setIsLoading(false);
        setError('Không thể tải video');
      };
      
      video.addEventListener('loadstart', handleLoadStart);
      video.addEventListener('loadeddata', handleLoadedData);
      video.addEventListener('error', handleError);
      
      return () => {
        video.removeEventListener('loadstart', handleLoadStart);
        video.removeEventListener('loadeddata', handleLoadedData);
        video.removeEventListener('error', handleError);
      };
    }
  }, [currentClip]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getQualityLabel = (quality) => {
    switch (quality) {
      case 'low': return '360p';
      case 'medium': return '720p';
      case 'high': return '1080p';
      case 'ultra': return '4K';
      default: return '720p';
    }
  };

  const handleVideoClick = () => {
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && !isNaN(videoRef.current.currentTime)) {
      onSeek(videoRef.current.currentTime);
    }
  };

  return (
    <div className={`w-96 border-l p-4 flex flex-col ${
      theme === 'dark' 
        ? 'bg-gray-900 border-gray-700' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      <Card 
        title="🎥 Xem trước" 
        size="small"
        className="flex-1 flex flex-col"
        extra={
          <Space>
            {currentMode !== 'beginner' && (
              <Select
                value={previewQuality}
                size="small"
                style={{ width: 80 }}
                onChange={(value) => {
                  // Handle quality change
                }}
              >
                <Option value="low">360p</Option>
                <Option value="medium">720p</Option>
                <Option value="high">1080p</Option>
                {currentMode === 'expert' && (
                  <Option value="ultra">4K</Option>
                )}
              </Select>
            )}
            
            <Tooltip title={showTooltips ? "Làm mới" : ""}>
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={onRefresh}
              />
            </Tooltip>
            
            <Tooltip title={showTooltips ? "Toàn màn hình" : ""}>
              <Button
                size="small"
                icon={isFullscreen ? <CompressOutlined /> : <ExpandOutlined />}
                onClick={onFullscreen}
              />
            </Tooltip>
          </Space>
        }
      >
        {/* Video Player */}
        <div className="relative bg-black rounded overflow-hidden mb-4" style={{ aspectRatio: '16/9' }}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <Progress type="circle" percent={50} size={60} />
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
              <div className="text-center">
                <div className="text-red-500 mb-2">⚠️</div>
                <div>{error}</div>
                <Button 
                  type="primary" 
                  size="small" 
                  className="mt-2"
                  onClick={onRefresh}
                >
                  Thử lại
                </Button>
              </div>
            </div>
          )}
          
          {currentClip ? (
            <video
              ref={videoRef}
              className="w-full h-full object-contain cursor-pointer"
              onClick={handleVideoClick}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = currentTime;
                }
              }}
              preload="metadata"
            >
              <source src={currentClip.url || currentClip.path} type={currentClip.type} />
              Trình duyệt không hỗ trợ video.
            </video>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">🎬</div>
                <div>Chọn video để xem trước</div>
              </div>
            </div>
          )}
          
          {/* Play/Pause Overlay */}
          {currentClip && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-30">
              <Button
                type="primary"
                shape="circle"
                size="large"
                icon={isPlaying ? <PauseOutlined /> : <PlayCircleOutlined />}
                onClick={handleVideoClick}
                className="bg-white bg-opacity-20 border-white"
              />
            </div>
          )}
        </div>
        
        {/* Video Controls */}
        {currentClip && (
          <div className="space-y-3">
            {/* Progress Bar */}
            <Slider
              min={0}
              max={totalDuration}
              step={0.1}
              value={currentTime}
              onChange={onSeek}
              tooltip={{
                formatter: (value) => formatTime(value),
                placement: 'top'
              }}
            />
            
            {/* Main Controls */}
            <div className="flex items-center justify-between">
              <Space>
                {currentMode !== 'beginner' && (
                  <>
                    <Tooltip title={showTooltips ? "Frame trước" : ""}>
                      <Button
                        size="small"
                        icon={<StepBackwardOutlined />}
                        onClick={onPrevFrame}
                      />
                    </Tooltip>
                  </>
                )}
                
                <Button
                  type="primary"
                  icon={isPlaying ? <PauseOutlined /> : <PlayCircleOutlined />}
                  onClick={isPlaying ? onPause : onPlay}
                >
                  {isPlaying ? 'Dừng' : 'Phát'}
                </Button>
                
                {currentMode !== 'beginner' && (
                  <Tooltip title={showTooltips ? "Frame sau" : ""}>
                    <Button
                      size="small"
                      icon={<StepForwardOutlined />}
                      onClick={onNextFrame}
                    />
                  </Tooltip>
                )}
              </Space>
              
              <div className="text-sm font-mono text-gray-500">
                {formatTime(currentTime)} / {formatTime(totalDuration)}
              </div>
            </div>
            
            {/* Volume and Speed Controls */}
            {currentMode !== 'beginner' && (
              <div className="space-y-2">
                {/* Volume */}
                <div className="flex items-center space-x-2">
                  <SoundOutlined className="text-gray-500" />
                  <Slider
                    min={0}
                    max={100}
                    value={volume}
                    onChange={onVolumeChange}
                    className="flex-1"
                    tooltip={{
                      formatter: (value) => `${value}%`,
                      placement: 'top'
                    }}
                  />
                  <span className="text-xs text-gray-500 w-8">{volume}%</span>
                </div>
                
                {/* Playback Speed */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Tốc độ:</span>
                  <Select
                    value={playbackSpeed}
                    onChange={onSpeedChange}
                    size="small"
                    style={{ width: 80 }}
                  >
                    <Option value={0.25}>0.25x</Option>
                    <Option value={0.5}>0.5x</Option>
                    <Option value={0.75}>0.75x</Option>
                    <Option value={1}>1x</Option>
                    <Option value={1.25}>1.25x</Option>
                    <Option value={1.5}>1.5x</Option>
                    <Option value={2}>2x</Option>
                  </Select>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Video Info */}
        {currentClip && currentMode !== 'beginner' && (
          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm">
            <div className="font-medium mb-2">Thông tin Video</div>
            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <div>Tên: {currentClip.name}</div>
              <div>Độ phân giải: {videoSize.width}x{videoSize.height}</div>
              <div>Thời lượng: {formatTime(currentClip.duration || 0)}</div>
              <div>Định dạng: {currentClip.type}</div>
              {currentMode === 'expert' && (
                <>
                  <div>Bitrate: {currentClip.bitrate || 'N/A'}</div>
                  <div>FPS: {currentClip.fps || 'N/A'}</div>
                  <div>Codec: {currentClip.codec || 'N/A'}</div>
                </>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
});

export default PreviewPanel;
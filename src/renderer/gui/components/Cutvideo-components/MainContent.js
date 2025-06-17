import React, { memo } from 'react';
import { Card, Typography, Button } from 'antd';
import { VideoCameraOutlined } from '@ant-design/icons';
import VideoPlayer from './VideoPlayer';
import TimelineControls from './TimelineControls';

const { Title, Text } = Typography;

const MainContent = memo(({ 
  videoInfo,
  videoRef,
  videoState,
  canvasRef,
  selectFile,
  handleDrop,
  handleDragOver,
  handleTimelineChange,
  togglePlayPause,
  seekTo,
  setVolume,
  toggleMute,
  setPlaybackRate,
  formatTime
}) => {
  const showNoFileNotice = !videoInfo.selectedFile;

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
      {/* Video Player Area */}
      <div className="flex-1 flex items-center justify-center p-6">
        {showNoFileNotice ? (
          <Card
            className="w-full max-w-2xl"
            styles={{
              body: { padding: 0 }, // Không cần padding vì bên trong div đã xử lý
            }}
          >
            <div 
              className="text-center py-16 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-400 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={selectFile}
            >
              <VideoCameraOutlined className="text-6xl text-gray-400 mb-4" />
              <Title level={3} className="text-gray-600 dark:text-gray-300 mb-2">
                Chưa có video nào được chọn
              </Title>
              <Text className="text-gray-500 dark:text-gray-400 mb-4 block">
                Kéo thả file video vào đây hoặc click để chọn
              </Text>
              <Button 
                type="primary" 
                icon={<VideoCameraOutlined />} 
                size="large"
                onClick={(e) => {
                  e.stopPropagation();
                  selectFile();
                }}
              >
                Chọn Video
              </Button>
            </div>
          </Card>
        ) : (
          <div className="w-full max-w-4xl">
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
            />
          </div>
        )}
      </div>

      {/* Timeline Controls */}
      {!showNoFileNotice && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <TimelineControls
            videoState={videoState}
            videoInfo={videoInfo}
            onTimelineChange={handleTimelineChange}
            formatTime={formatTime}
          />
        </div>
      )}
    </div>
  );
});

export default MainContent;

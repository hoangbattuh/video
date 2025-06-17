console.log('Timeline component loaded');
import React, { memo, useState, useRef, useEffect } from 'react';
import { Card, Button, Space, Slider, Tooltip, Popover, Input, Select } from 'antd';
import {
  PlayCircleOutlined,
  PauseOutlined,
  DeleteOutlined,
  ScissorOutlined,
  SwapOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined
} from '@ant-design/icons';
import { formatTime } from '../../utils/formatTime';
const { Option } = Select;

const Timeline = memo(({
  timelineClips,
  currentTime,
  totalDuration,
  isPlaying,
  onPlay,
  onPause,
  onSeek,
  onClipMove,
  onClipDelete,
  onClipSplit,
  onClipTrim,
  onDrop,
  currentMode,
  theme,
  showTooltips
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedClip, setSelectedClip] = useState(null);
  const [draggedClip, setDraggedClip] = useState(null);
  const timelineRef = useRef(null);
  const [timelineWidth, setTimelineWidth] = useState(800);

  useEffect(() => {
    const updateWidth = () => {
      if (timelineRef.current) {
        setTimelineWidth(timelineRef.current.offsetWidth);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const getClipPosition = (startTime) => {
    if (totalDuration === 0) return 0;
    return (startTime / totalDuration) * timelineWidth * zoomLevel;
  };

  const getClipWidth = (duration) => {
    if (totalDuration === 0) return 0;
    return (duration / totalDuration) * timelineWidth * zoomLevel;
  };

  const handleTimelineClick = (e) => {
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = totalDuration === 0 ? 0 : (clickX / (timelineWidth * zoomLevel)) * totalDuration;
    onSeek(Math.max(0, Math.min(newTime, totalDuration)));
  };

  const handleClipDragStart = (e, clip, index) => {
    setDraggedClip({ clip, index });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleClipDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedClip && draggedClip.index !== targetIndex) {
      onClipMove(draggedClip.index, targetIndex);
    }
    setDraggedClip(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const renderTimelineRuler = () => {
    const intervals = Math.ceil(totalDuration / 10);
    const marks = [];
    
    for (let i = 0; i <= intervals; i++) {
      const time = (i * totalDuration) / intervals;
      const position = getClipPosition(time);
      
      marks.push(
        <div
          key={i}
          className="absolute top-0 h-4 border-l border-gray-400 text-xs"
          style={{ left: position }}
        >
          <span className="ml-1 text-gray-600">{formatTime(time)}</span>
        </div>
      );
    }
    
    return marks;
  };

  const renderPlayhead = () => {
    const position = getClipPosition(currentTime);
    
    return (
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
        style={{ left: position }}
      >
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-full" />
      </div>
    );
  };

  const renderClip = (clip, index) => {
    const position = getClipPosition(clip.startTime);
    const width = getClipWidth(clip.duration);
    const isSelected = selectedClip === index;
    
    return (
      <div
        key={`${clip.id}-${index}`}
        className={`absolute top-8 h-16 rounded cursor-move border-2 overflow-hidden ${
          isSelected 
            ? 'border-blue-500 shadow-lg' 
            : 'border-gray-300 hover:border-blue-300'
        } ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-blue-100'
        }`}
        style={{ left: position, width: Math.max(width, 60) }}
        draggable
        onDragStart={(e) => handleClipDragStart(e, clip, index)}
        onDrop={(e) => handleClipDrop(e, index)}
        onDragOver={handleDragOver}
        onClick={() => setSelectedClip(index)}
      >
        <div className="p-2 h-full flex flex-col justify-between">
          <div className="text-xs font-medium truncate" title={clip.name}>
            {clip.name}
          </div>
          <div className="text-xs text-gray-500">
            {formatTime(clip.duration)}
          </div>
        </div>
        
        {isSelected && currentMode !== 'beginner' && (
          <div className="absolute top-1 right-1 flex space-x-1">
            <Tooltip title="Cắt clip">
              <Button
                size="small"
                icon={<ScissorOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  onClipSplit(index, currentTime - clip.startTime);
                }}
              />
            </Tooltip>
            <Tooltip title="Xóa clip">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  onClipDelete(index);
                }}
              />
            </Tooltip>
          </div>
        )}
        
        {isSelected && currentMode === 'expert' && (
          <>
            <div 
              className="absolute left-0 top-0 bottom-0 w-2 bg-blue-500 cursor-ew-resize opacity-75"
              onMouseDown={(e) => e.stopPropagation()}
            />
            <div 
              className="absolute right-0 top-0 bottom-0 w-2 bg-blue-500 cursor-ew-resize opacity-75"
              onMouseDown={(e) => e.stopPropagation()}
            />
          </>
        )}
      </div>
    );
  };

  return (
    <div className={`flex-1 p-4 ${
      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
    }`}>
      <Card 
        title="🎬 Timeline Ghép Video" 
        className="h-full"
        styles={{
          body: { padding: 16 } // Using styles.body instead of deprecated bodyStyle
        }}
        extra={
          <Space>
            <Space>
              <Tooltip title={showTooltips ? "Thu nhỏ" : ""}>
                <Button
                  size="small"
                  icon={<ZoomOutOutlined />}
                  onClick={() => setZoomLevel(Math.max(0.1, zoomLevel - 0.1))}
                  disabled={zoomLevel <= 0.1}
                />
              </Tooltip>
              <span className="text-sm">{Math.round(zoomLevel * 100)}%</span>
              <Tooltip title={showTooltips ? "Phóng to" : ""}>
                <Button
                  size="small"
                  icon={<ZoomInOutlined />}
                  onClick={() => setZoomLevel(Math.min(5, zoomLevel + 0.1))}
                  disabled={zoomLevel >= 5}
                />
              </Tooltip>
            </Space>
            
            <Space>
              <Tooltip title={showTooltips ? (isPlaying ? "Tạm dừng" : "Phát") : ""}>
                <Button
                  type="primary"
                  icon={isPlaying ? <PauseOutlined /> : <PlayCircleOutlined />}
                  onClick={isPlaying ? onPause : onPlay}
                >
                  {isPlaying ? 'Tạm dừng' : 'Phát'}
                </Button>
              </Tooltip>
              
              <span className="text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(totalDuration)}
              </span>
            </Space>
          </Space>
        }
      >
        <div className="h-full flex flex-col">
          <div 
            ref={timelineRef}
            className="relative flex-1 border rounded overflow-x-auto overflow-y-hidden min-h-32"
            style={{ minWidth: timelineWidth * zoomLevel }}
            onClick={handleTimelineClick}
            onDrop={(e) => {
              e.preventDefault();
              const rect = timelineRef.current.getBoundingClientRect();
              const dropX = e.clientX - rect.left;
              const dropTime = (dropX / (timelineWidth * zoomLevel)) * totalDuration;
              onDrop(e, dropTime);
            }}
            onDragOver={handleDragOver}
          >
            <div className="absolute top-0 left-0 right-0 h-6 bg-gray-100 dark:bg-gray-700 border-b">
              {renderTimelineRuler()}
            </div>
            
            {timelineClips && timelineClips.map((clip, index) => renderClip(clip, index))}
            
            {renderPlayhead()}
            
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded flex items-center justify-center">
                {(!timelineClips || timelineClips.length === 0) && (
                  <div className="text-gray-500 text-center">
                    <div className="text-lg mb-2">🎥</div>
                    <div>Kéo video từ thư viện vào đây để bắt đầu ghép</div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-4">
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
          </div>
        </div>
      </Card>
    </div>
  );
});

export default Timeline;
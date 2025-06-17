import React, { useState, useRef, useCallback } from 'react';
import { Card, Button, Tooltip, Popover, Slider, InputNumber, Space, Typography } from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ScissorOutlined,
  DeleteOutlined,
  SettingOutlined,
  DragOutlined,
  EyeOutlined,
  SoundOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const VideoClip = ({
  clip,
  index,
  isSelected,
  isPlaying,
  currentTime,
  onSelect,
  onPlay,
  onPause,
  onDelete,
  onSplit,
  onMove,
  onPropertyChange,
  theme = 'light',
  showTooltips = true,
  mode = 'beginner'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showProperties, setShowProperties] = useState(false);
  const dragRef = useRef(null);
  const startX = useRef(0);
  const startTime = useRef(0);
  
  // Tính toán vị trí và kích thước
  const clipWidth = Math.max(100, clip.duration * 10); // 10px per second
  const clipLeft = clip.startTime * 10;
  
  // Tính progress của clip hiện tại
  const clipProgress = currentTime >= clip.startTime && currentTime <= clip.endTime
    ? ((currentTime - clip.startTime) / clip.duration) * 100
    : 0;
  
  const handleDragStart = useCallback((e) => {
    if (e.target.closest('.clip-controls')) return;
    
    setIsDragging(true);
    startX.current = e.clientX;
    startTime.current = clip.startTime;
    
    const handleDragMove = (e) => {
      const deltaX = e.clientX - startX.current;
      const deltaTime = deltaX / 10; // 10px per second
      const newStartTime = Math.max(0, startTime.current + deltaTime);
      
      onPropertyChange(index, {
        startTime: newStartTime,
        endTime: newStartTime + clip.duration
      });
    };
    
    const handleDragEnd = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };
    
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
  }, [clip, index, onPropertyChange]);
  
  const handleSplit = useCallback(() => {
    if (currentTime >= clip.startTime && currentTime <= clip.endTime) {
      const splitTime = currentTime - clip.startTime;
      onSplit(index, splitTime);
    }
  }, [currentTime, clip, index, onSplit]);
  
  const handlePropertyUpdate = useCallback((property, value) => {
    onPropertyChange(index, { [property]: value });
  }, [index, onPropertyChange]);
  
  const propertiesContent = (
    <div style={{ width: 300, padding: 8 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text strong>Độ mờ</Text>
          <Slider
            min={0}
            max={1}
            step={0.1}
            value={clip.opacity || 1}
            onChange={(value) => handlePropertyUpdate('opacity', value)}
            tooltip={{ formatter: (value) => `${Math.round(value * 100)}%` }}
          />
        </div>
        
        <div>
          <Text strong>Tốc độ</Text>
          <Slider
            min={0.25}
            max={4}
            step={0.25}
            value={clip.speed || 1}
            onChange={(value) => handlePropertyUpdate('speed', value)}
            tooltip={{ formatter: (value) => `${value}x` }}
          />
        </div>
        
        {mode !== 'beginner' && (
          <>
            <div>
              <Text strong>Cắt đầu (s)</Text>
              <InputNumber
                min={0}
                max={clip.duration}
                step={0.1}
                value={clip.trimStart || 0}
                onChange={(value) => handlePropertyUpdate('trimStart', value)}
                style={{ width: '100%' }}
              />
            </div>
            
            <div>
              <Text strong>Cắt cuối (s)</Text>
              <InputNumber
                min={0}
                max={clip.duration}
                step={0.1}
                value={clip.trimEnd || clip.duration}
                onChange={(value) => handlePropertyUpdate('trimEnd', value)}
                style={{ width: '100%' }}
              />
            </div>
          </>
        )}
      </Space>
    </div>
  );
  
  const clipStyle = {
    position: 'absolute',
    left: clipLeft,
    width: clipWidth,
    height: 60,
    cursor: isDragging ? 'grabbing' : 'grab',
    border: isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9',
    borderRadius: 4,
    background: theme === 'dark' ? '#1f1f1f' : '#fff',
    boxShadow: isDragging ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
    transform: isDragging ? 'scale(1.02)' : 'scale(1)',
    transition: isDragging ? 'none' : 'all 0.2s ease',
    zIndex: isDragging ? 1000 : isSelected ? 100 : 1,
    opacity: clip.opacity || 1
  };
  
  const progressStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: `${clipProgress}%`,
    background: 'linear-gradient(90deg, rgba(24,144,255,0.3) 0%, rgba(24,144,255,0.1) 100%)',
    borderRadius: '4px 0 0 4px',
    transition: 'width 0.1s ease'
  };
  
  return (
    <div
      ref={dragRef}
      style={clipStyle}
      onMouseDown={handleDragStart}
      onClick={() => onSelect(index)}
    >
      {/* Progress indicator */}
      {clipProgress > 0 && <div style={progressStyle} />}
      
      {/* Clip content */}
      <div style={{ 
        padding: '4px 8px', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 2
      }}>
        {/* Clip info */}
        <div style={{ 
          fontSize: 12, 
          fontWeight: 'bold',
          color: theme === 'dark' ? '#fff' : '#000',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {clip.name}
        </div>
        
        {/* Duration */}
        <div style={{ 
          fontSize: 10, 
          color: theme === 'dark' ? '#ccc' : '#666',
          marginTop: 2
        }}>
          {Math.round(clip.duration * 100) / 100}s
        </div>
        
        {/* Controls */}
        <div className="clip-controls" style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 4
        }}>
          <Space size={2}>
            {/* Play/Pause */}
            <Tooltip title={isPlaying ? 'Tạm dừng' : 'Phát'} disabled={!showTooltips}>
              <Button
                type="text"
                size="small"
                icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  isPlaying ? onPause() : onPlay();
                }}
                style={{ 
                  color: theme === 'dark' ? '#fff' : '#000',
                  padding: 0,
                  minWidth: 16,
                  height: 16
                }}
              />
            </Tooltip>
            
            {/* Split */}
            {mode !== 'beginner' && (
              <Tooltip title="Cắt clip" disabled={!showTooltips}>
                <Button
                  type="text"
                  size="small"
                  icon={<ScissorOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSplit();
                  }}
                  style={{ 
                    color: theme === 'dark' ? '#fff' : '#000',
                    padding: 0,
                    minWidth: 16,
                    height: 16
                  }}
                />
              </Tooltip>
            )}
            
            {/* Properties */}
            {mode === 'expert' && (
              <Popover
                content={propertiesContent}
                title="Thuộc tính clip"
                trigger="click"
                open={showProperties}
                onOpenChange={setShowProperties}
                placement="topLeft"
              >
                <Tooltip title="Thuộc tính" disabled={!showTooltips}>
                  <Button
                    type="text"
                    size="small"
                    icon={<SettingOutlined />}
                    onClick={(e) => e.stopPropagation()}
                    style={{ 
                      color: theme === 'dark' ? '#fff' : '#000',
                      padding: 0,
                      minWidth: 16,
                      height: 16
                    }}
                  />
                </Tooltip>
              </Popover>
            )}
          </Space>
          
          <Space size={2}>
            {/* Speed indicator */}
            {clip.speed && clip.speed !== 1 && (
              <Tooltip title={`Tốc độ: ${clip.speed}x`} disabled={!showTooltips}>
                <ThunderboltOutlined 
                  style={{ 
                    fontSize: 10,
                    color: '#faad14'
                  }} 
                />
              </Tooltip>
            )}
            
            {/* Opacity indicator */}
            {clip.opacity && clip.opacity < 1 && (
              <Tooltip title={`Độ mờ: ${Math.round(clip.opacity * 100)}%`} disabled={!showTooltips}>
                <EyeOutlined 
                  style={{ 
                    fontSize: 10,
                    color: '#722ed1'
                  }} 
                />
              </Tooltip>
            )}
            
            {/* Delete */}
            <Tooltip title="Xóa clip" disabled={!showTooltips}>
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(index);
                }}
                style={{ 
                  color: '#ff4d4f',
                  padding: 0,
                  minWidth: 16,
                  height: 16
                }}
              />
            </Tooltip>
          </Space>
        </div>
      </div>
      
      {/* Drag handle */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 8,
        height: '100%',
        background: isSelected ? '#1890ff' : 'transparent',
        cursor: 'ew-resize',
        borderRadius: '4px 0 0 4px'
      }} />
      
      {/* Resize handles */}
      {isSelected && mode !== 'beginner' && (
        <>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 8,
            height: '100%',
            background: '#1890ff',
            cursor: 'ew-resize',
            borderRadius: '0 4px 4px 0'
          }} />
        </>
      )}
    </div>
  );
};

export default VideoClip;
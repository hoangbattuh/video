import { useState, useCallback, useRef, useEffect } from 'react';
import { message } from 'antd';

const useMergeVideo = () => {
  // State quản lý video files
  const [videoFiles, setVideoFiles] = useState([]);
  const [timelineClips, setTimelineClips] = useState([]);
  const [currentClip, setCurrentClip] = useState(null);
  
  // State phát video
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  
  // State UI
  const [currentMode, setCurrentMode] = useState('beginner'); // beginner, pro, expert
  const [theme, setTheme] = useState('light');
  const [showTooltips, setShowTooltips] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // State export
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportSettings, setExportSettings] = useState({
    outputFormat: 'mp4',
    quality: 'high',
    resolution: '1920x1080',
    aspectRatio: '16:9',
    videoCodec: 'h264',
    videoBitrate: 8000,
    fps: 30,
    audioCodec: 'aac',
    audioBitrate: 128,
    sampleRate: 44100,
    normalizeAudio: true,
    threads: 4,
    gpuAcceleration: 'none',
    twoPass: false,
    fastStart: true,
    rateControl: 'vbr',
    crfValue: 23
  });
  
  // State modals
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  const videoRef = useRef(null);
  const timelineRef = useRef(null);
  
  // Tính tổng thời lượng timeline
  useEffect(() => {
    const total = timelineClips.reduce((sum, clip) => {
      return sum + (clip.duration || 0);
    }, 0);
    setTotalDuration(total);
    setExportSettings(prev => ({ ...prev, totalDuration: total }));
  }, [timelineClips]);
  
  // Import video files
  const handleImportFiles = useCallback((info) => {
    const { fileList } = info;
    const newFiles = fileList.map((file, index) => {
      const videoFile = {
        id: `video_${Date.now()}_${index}`,
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        url: URL.createObjectURL(file.originFileObj || file),
        path: file.path || '',
        duration: 0, // Sẽ được cập nhật khi load metadata
        width: 0,
        height: 0,
        fps: 0,
        bitrate: 0,
        codec: ''
      };
      
      // Load video metadata
      const video = document.createElement('video');
      video.src = videoFile.url;
      video.onloadedmetadata = () => {
        videoFile.duration = video.duration;
        videoFile.width = video.videoWidth;
        videoFile.height = video.videoHeight;
        setVideoFiles(prev => prev.map(f => f.id === videoFile.id ? videoFile : f));
      };
      
      return videoFile;
    });
    
    setVideoFiles(prev => [...prev, ...newFiles]);
    message.success(`Đã thêm ${newFiles.length} video`);
  }, []);
  
  // Xóa video file
  const handleRemoveFile = useCallback((fileId) => {
    setVideoFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file && file.url) {
        URL.revokeObjectURL(file.url);
      }
      return prev.filter(f => f.id !== fileId);
    });
    
    // Xóa khỏi timeline nếu có
    setTimelineClips(prev => prev.filter(clip => clip.id !== fileId));
    message.success('Đã xóa video');
  }, []);
  
  // Preview file
  const handlePreviewFile = useCallback((file) => {
    setCurrentClip(file);
    setCurrentTime(0);
    setIsPlaying(false);
  }, []);
  
  // Drag start từ media library
  const handleDragStart = useCallback((e, file, index) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'media-file',
      file,
      index
    }));
  }, []);
  
  // Drop vào timeline
  const handleTimelineDrop = useCallback((e, dropTime = null) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      
      if (data.type === 'media-file') {
        const { file } = data;
        
        // Tính startTime dựa vào vị trí drop hoặc cuối timeline
        let startTime = dropTime;
        if (startTime === null) {
          startTime = timelineClips.reduce((max, clip) => {
            return Math.max(max, clip.startTime + clip.duration);
          }, 0);
        }
        
        const newClip = {
          ...file,
          startTime,
          endTime: startTime + file.duration,
          trimStart: 0,
          trimEnd: file.duration,
          opacity: 1,
          speed: 1
        };
        
        setTimelineClips(prev => [...prev, newClip]);
        message.success(`Đã thêm "${file.name}" vào timeline`);
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  }, [timelineClips]);
  
  // Di chuyển clip trong timeline
  const handleClipMove = useCallback((fromIndex, toIndex) => {
    setTimelineClips(prev => {
      const newClips = [...prev];
      const [movedClip] = newClips.splice(fromIndex, 1);
      newClips.splice(toIndex, 0, movedClip);
      
      // Cập nhật lại startTime cho tất cả clips
      let currentTime = 0;
      newClips.forEach(clip => {
        clip.startTime = currentTime;
        clip.endTime = currentTime + clip.duration;
        currentTime += clip.duration;
      });
      
      return newClips;
    });
  }, []);
  
  // Xóa clip khỏi timeline
  const handleClipDelete = useCallback((index) => {
    setTimelineClips(prev => {
      const newClips = prev.filter((_, i) => i !== index);
      
      // Cập nhật lại startTime
      let currentTime = 0;
      newClips.forEach(clip => {
        clip.startTime = currentTime;
        clip.endTime = currentTime + clip.duration;
        currentTime += clip.duration;
      });
      
      return newClips;
    });
    message.success('Đã xóa clip khỏi timeline');
  }, []);
  
  // Cắt clip
  const handleClipSplit = useCallback((index, splitTime) => {
    setTimelineClips(prev => {
      const clip = prev[index];
      if (!clip || splitTime <= 0 || splitTime >= clip.duration) return prev;
      
      const firstPart = {
        ...clip,
        id: `${clip.id}_part1`,
        duration: splitTime,
        endTime: clip.startTime + splitTime,
        trimEnd: clip.trimStart + splitTime
      };
      
      const secondPart = {
        ...clip,
        id: `${clip.id}_part2`,
        duration: clip.duration - splitTime,
        startTime: clip.startTime + splitTime,
        trimStart: clip.trimStart + splitTime
      };
      
      const newClips = [...prev];
      newClips.splice(index, 1, firstPart, secondPart);
      
      return newClips;
    });
    message.success('Đã cắt clip');
  }, []);
  
  // Điều khiển phát
  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);
  
  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);
  
  const handleSeek = useCallback((time) => {
    setCurrentTime(Math.max(0, Math.min(time, totalDuration)));
  }, [totalDuration]);
  
  const handleVolumeChange = useCallback((value) => {
    setVolume(value);
  }, []);
  
  const handleSpeedChange = useCallback((speed) => {
    setPlaybackSpeed(speed);
  }, []);
  
  // Frame navigation
  const handlePrevFrame = useCallback(() => {
    const frameTime = 1 / (exportSettings.fps || 30);
    handleSeek(currentTime - frameTime);
  }, [currentTime, exportSettings.fps, handleSeek]);
  
  const handleNextFrame = useCallback(() => {
    const frameTime = 1 / (exportSettings.fps || 30);
    handleSeek(currentTime + frameTime);
  }, [currentTime, exportSettings.fps, handleSeek]);
  
  // Fullscreen
  const handleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);
  
  // Theme toggle
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);
  
  // Settings
  const handleSettingsChange = useCallback((newSettings) => {
    setExportSettings(prev => ({ ...prev, ...newSettings }));
  }, []);
  
  // Export
  const handleExportVideo = useCallback(async () => {
    if (timelineClips.length === 0) {
      message.error('Vui lòng thêm video vào timeline trước khi xuất');
      return;
    }
    
    setIsExporting(true);
    setExportProgress(0);
    
    try {
      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setIsExporting(false);
            message.success('Xuất video thành công!');
            return 100;
          }
          return prev + Math.random() * 10;
        });
      }, 500);
      
      // TODO: Implement actual video export logic
      // This would involve calling the main process to handle FFmpeg
      
    } catch (error) {
      console.error('Export error:', error);
      message.error('Lỗi khi xuất video: ' + error.message);
      setIsExporting(false);
    }
  }, [timelineClips]);
  
  // Save/Load project
  const handleSaveProject = useCallback(() => {
    const projectData = {
      videoFiles,
      timelineClips,
      exportSettings,
      currentMode,
      theme
    };
    
    // TODO: Implement save to file
    console.log('Saving project:', projectData);
    message.success('Đã lưu dự án');
  }, [videoFiles, timelineClips, exportSettings, currentMode, theme]);
  
  const handlePreviewProject = useCallback(() => {
    if (timelineClips.length === 0) {
      message.warning('Chưa có video nào trong timeline');
      return;
    }
    
    // Set current clip to first clip in timeline
    setCurrentClip(timelineClips[0]);
    setCurrentTime(0);
    setIsPlaying(true);
  }, [timelineClips]);
  
  const handleRefresh = useCallback(() => {
    setCurrentTime(0);
    setIsPlaying(false);
    if (currentClip) {
      // Reload current clip
      setCurrentClip({ ...currentClip });
    }
  }, [currentClip]);
  
  // Preset management
  const handleSavePreset = useCallback(() => {
    // TODO: Implement preset saving
    message.success('Đã lưu preset cài đặt');
  }, []);
  
  const handleLoadPreset = useCallback(() => {
    // TODO: Implement preset loading
    message.success('Đã tải preset cài đặt');
  }, []);
  
  const handleResetSettings = useCallback(() => {
    setExportSettings({
      outputFormat: 'mp4',
      quality: 'high',
      resolution: '1920x1080',
      aspectRatio: '16:9',
      videoCodec: 'h264',
      videoBitrate: 8000,
      fps: 30,
      audioCodec: 'aac',
      audioBitrate: 128,
      sampleRate: 44100,
      normalizeAudio: true,
      threads: 4,
      gpuAcceleration: 'none',
      twoPass: false,
      fastStart: true,
      rateControl: 'vbr',
      crfValue: 23
    });
    message.success('Đã khôi phục cài đặt mặc định');
  }, []);
  
  return {
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
    handleResetSettings
  };
};

export default useMergeVideo;
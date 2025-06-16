import React, { useState, useRef, useCallback, useEffect, useMemo, memo } from 'react';
import { message, Menu } from 'antd';
import './CutVideo.module.css';
import useVideoPlayer from './hooks/useVideoPlayer';
import useVideoProcessor from './hooks/useVideoProcessor';
import useFileManager from './hooks/useFileManager';
import VideoPlayer from './components/VideoPlayer';
import TimelineControls from './components/TimelineControls';
import RecentFilesList from './components/RecentFilesList';
import ProgressModal from './components/ProgressModal';

const CutVideo = memo(() => {
  const [videoInfo, setVideoInfo] = useState({
    cutStart: 0,
    cutEnd: 10,
    mode: 'manual',
    segmentTime: 15,
    segmentCount: 3,
    multiType: 'duration',
    lossless: true,
    snapKeyframe: true,
    advancedOptions: {},
    selectedFile: null
  });

  const [showProgressModal, setShowProgressModal] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [theme, setTheme] = useState('light');
  const [autoSave, setAutoSave] = useState(true);
  const [showTooltips, setShowTooltips] = useState(true);

  const canvasRef = useRef(null);
  
  // Custom hooks
  const { videoRef, videoState, updateVideoState, togglePlayPause, seekTo, setVolume, toggleMute, setPlaybackRate } = useVideoPlayer();
  const { processing, progress, error, processVideo, initWorker } = useVideoProcessor();
  const { files, saveDir, recentFiles, addFile, removeFile, selectSaveDirectory } = useFileManager();

  // Xử lý tải video với tối ưu hóa
  const handleFileSelect = useCallback(({ file }) => {
    const fileInfo = addFile(file);
    const video = videoRef.current;
    
    if (!video) return;
    
    video.src = fileInfo.url;
    
    video.onloadedmetadata = () => {
      updateVideoState({ 
        duration: video.duration,
        currentTime: 0,
        isPlaying: false 
      });
      
      setVideoInfo(prev => ({
        ...prev,
        cutEnd: Math.min(10, video.duration),
        selectedFile: fileInfo
      }));
      
      initWorker();
      renderFrame();
    };

    video.onerror = () => {
      message.error('Không thể tải video. Vui lòng kiểm tra định dạng file.');
      removeFile(fileInfo.id);
    };
  }, [addFile, updateVideoState, initWorker, removeFile]);

  // Render khung hình hiện tại với tối ưu hóa
  const renderFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (video.videoWidth && video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
  }, []);

  // Xử lý thay đổi chế độ cắt
  const handleModeChange = useCallback((mode) => {
    setVideoInfo(prev => ({ ...prev, mode }));
  }, []);

  // Cắt video với validation nâng cao
  const handleCutVideo = useCallback(() => {
    if (!videoRef.current?.src) {
      message.error('Vui lòng tải video trước!');
      return;
    }
    
    if (!saveDir) {
      message.error('Vui lòng chọn thư mục lưu!');
      return;
    }

    if (videoInfo.cutStart >= videoInfo.cutEnd) {
      message.error('Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc!');
      return;
    }

    if (videoInfo.cutEnd > videoState.duration) {
      message.error('Thời gian kết thúc vượt quá độ dài video!');
      return;
    }
    
    setShowProgressModal(true);
    
    const outputFileName = `cut_${videoInfo.mode}_${Date.now()}.mp4`;
    
    processVideo({
      type: 'CUT',
      input: videoRef.current.src,
      start: videoInfo.cutStart,
      end: videoInfo.cutEnd,
      output: `${saveDir}/${outputFileName}`,
      options: {
        lossless: videoInfo.lossless,
        mode: videoInfo.mode,
        snapKeyframe: videoInfo.snapKeyframe,
        advanced: videoInfo.advancedOptions,
        segmentTime: videoInfo.segmentTime,
        segmentCount: videoInfo.segmentCount,
        multiType: videoInfo.multiType
      }
    });
  }, [videoInfo, saveDir, videoState.duration, processVideo]);

  // Xử lý keyboard shortcuts
  const handleKeyPress = useCallback((e) => {
    if (!videoRef.current) return;
    
    switch (e.key) {
      case ' ':
        e.preventDefault();
        togglePlayPause();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        seekTo(Math.max(0, videoState.currentTime - 5));
        break;
      case 'ArrowRight':
        e.preventDefault();
        seekTo(Math.min(videoState.duration, videoState.currentTime + 5));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setVolume(Math.min(1, videoState.volume + 0.1));
        break;
      case 'ArrowDown':
        e.preventDefault();
        setVolume(Math.max(0, videoState.volume - 0.1));
        break;
      case 'm':
      case 'M':
        e.preventDefault();
        toggleMute();
        break;
    }
  }, [togglePlayPause, seekTo, setVolume, toggleMute, videoState]);

  // Xử lý drag & drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find(file => file.type.startsWith('video/'));
    
    if (videoFile) {
      handleFileSelect({ file: videoFile });
    } else {
      message.warning('Vui lòng chọn file video hợp lệ!');
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  // Cập nhật thời gian khi video phát với tối ưu hóa
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
        currentTime: video.currentTime 
      });
    };

    const handleEnded = () => {
      updateVideoState({ isPlaying: false });
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('ended', handleEnded);
    
    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('ended', handleEnded);
    };
  }, [updateVideoState, renderFrame]);

  // Keyboard shortcuts effect
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Auto-save settings
  useEffect(() => {
    const settings = {
      mode: videoInfo.mode,
      lossless: videoInfo.lossless,
      snapKeyframe: videoInfo.snapKeyframe,
      segmentTime: videoInfo.segmentTime,
      segmentCount: videoInfo.segmentCount,
      multiType: videoInfo.multiType,
      advancedOptions: videoInfo.advancedOptions
    };
    localStorage.setItem('videoEditor_settings', JSON.stringify(settings));
  }, [videoInfo]);

  // Load saved settings
  useEffect(() => {
    const savedSettings = localStorage.getItem('videoEditor_settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setVideoInfo(prev => ({ ...prev, ...settings }));
      } catch (error) {
        console.warn('Failed to load saved settings:', error);
      }
    }
  }, []);

  // Tùy chọn nâng cao với mô tả chi tiết
  const advancedOptions = useMemo(() => [
    { 
      label: 'Cắt theo frame chính xác', 
      value: 'frameCut',
      description: 'Cắt chính xác theo frame, tăng độ chính xác nhưng chậm hơn',
      category: 'precision'
    },
    { 
      label: 'Phát hiện thay đổi cảnh', 
      value: 'sceneDetection',
      description: 'Tự động phát hiện và cắt theo thay đổi cảnh',
      category: 'ai'
    },
    { 
      label: 'Phát hiện chuyển động', 
      value: 'motionDetection',
      description: 'Phát hiện vùng có chuyển động để tối ưu cắt',
      category: 'ai'
    },
    { 
      label: 'Phát hiện khuôn mặt', 
      value: 'faceDetection',
      description: 'Ưu tiên giữ lại các đoạn có khuôn mặt',
      category: 'ai'
    },
    { 
      label: 'Phát hiện âm thanh lớn', 
      value: 'audioSpike',
      description: 'Cắt dựa trên mức độ âm thanh',
      category: 'audio'
    },
    { 
      label: 'Phát hiện đoạn im lặng', 
      value: 'silenceDetection',
      description: 'Loại bỏ hoặc rút ngắn các đoạn im lặng',
      category: 'audio'
    },
    { 
      label: 'Tự động căn giữa đối tượng', 
      value: 'autoCenter',
      description: 'Tự động crop và căn giữa đối tượng chính',
      category: 'enhancement'
    },
    { 
      label: 'Loại bỏ logo/watermark', 
      value: 'logoRemoval',
      description: 'Tự động phát hiện và loại bỏ logo',
      category: 'enhancement'
    },
    { 
      label: 'Bảo toàn âm thanh gốc', 
      value: 'preserveAudio',
      description: 'Giữ nguyên chất lượng âm thanh gốc',
      category: 'quality'
    },
    { 
      label: 'Xử lý hàng loạt', 
      value: 'batchProcessing',
      description: 'Cho phép xử lý nhiều video cùng lúc',
      category: 'performance'
    },
    { 
      label: 'Hiệu ứng chuyển tiếp', 
      value: 'transitions',
      description: 'Thêm hiệu ứng mượt mà giữa các đoạn',
      category: 'enhancement'
    },
    { 
      label: 'Giữ metadata gốc', 
      value: 'keepMetadata',
      description: 'Bảo toàn thông tin metadata của video',
      category: 'quality'
    },
  ], []);

  // Nhóm tùy chọn theo category
  const groupedOptions = useMemo(() => {
    return advancedOptions.reduce((groups, option) => {
      const category = option.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(option);
      return groups;
    }, {});
  }, [advancedOptions]);

  // Xử lý thay đổi tùy chọn nâng cao
  const handleAdvancedOptionChange = useCallback((option, checked) => {
    setVideoInfo(prev => ({
      ...prev,
      advancedOptions: {
        ...prev.advancedOptions,
        [option]: checked
      }
    }));
  }, []);

  // Helper functions
  const formatTime = useCallback((seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getOptionDescription = useCallback((option) => {
    const descriptions = {
      frameCut: 'Cắt chính xác theo từng frame',
      sceneDetection: 'Tự động phát hiện thay đổi cảnh',
      motionDetection: 'Phát hiện chuyển động trong video',
      faceDetection: 'Nhận diện khuôn mặt trong video',
      audioSpike: 'Phát hiện âm thanh đột ngột',
      silenceDetection: 'Tìm các đoạn im lặng',
      autoCenter: 'Tự động căn giữa đối tượng chính',
      logoRemoval: 'Loại bỏ logo và watermark',
      preserveAudio: 'Giữ nguyên chất lượng âm thanh',
      batchProcessing: 'Xử lý nhiều file cùng lúc',
      transitions: 'Thêm hiệu ứng chuyển tiếp',
      keepMetadata: 'Giữ thông tin metadata gốc'
    };
    return descriptions[option] || 'Tính năng nâng cao';
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('videoEditor_theme', newTheme);
      return newTheme;
    });
  }, []);

  const saveSettings = useCallback(() => {
    const settings = {
      videoInfo,
      theme,
      autoSave,
      showTooltips,
      saveDir
    };
    localStorage.setItem('videoEditorSettings', JSON.stringify(settings));
    message.success('Đã lưu cài đặt!');
  }, [videoInfo, theme, autoSave, showTooltips, saveDir]);

  const resetSettings = useCallback(() => {
    setVideoInfo({
      cutStart: 0,
      cutEnd: 10,
      mode: 'manual',
      segmentTime: 15,
      segmentCount: 3,
      multiType: 'duration',
      lossless: true,
      snapKeyframe: true,
      advancedOptions: {},
      selectedFile: null
    });
    setTheme('light');
    setAutoSave(true);
    setShowTooltips(true);
    message.info('Đã khôi phục cài đặt mặc định!');
  }, []);

  // Xử lý thay đổi slider timeline
  const handleTimelineChange = useCallback(([start, end]) => {
    setVideoInfo(prev => ({ 
      ...prev, 
      cutStart: start, 
      cutEnd: end 
    }));
    seekTo(start);
    renderFrame();
  }, [seekTo, renderFrame]);

  // Playback rate options
  const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

  // Speed control menu
  const speedMenu = (
    <Menu>
      {playbackRates.map(rate => (
        <Menu.Item 
          key={`speed-${rate}`} 
          onClick={() => setPlaybackRate(rate)}
          className={videoState.playbackRate === rate ? 'ant-menu-item-selected' : ''}
        >
          {rate}x
        </Menu.Item>
      ))}
    </Menu>
  );

  // Xử lý toàn màn hình
  const handleFullscreen = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen().catch(e => {
        console.error('Lỗi toàn màn hình:', e);
        message.error('Trình duyệt không hỗ trợ toàn màn hình');
      });
    }
  }, []);

  // Load theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('videoEditor_theme') || 'light';
    setTheme(savedTheme);
  }, []);

  // Thêm hiệu ứng loading khi đang xử lý video
  useEffect(() => {
    if (processing) {
      document.body.style.cursor = 'wait';
    } else {
      document.body.style.cursor = 'default';
    }
    return () => {
      document.body.style.cursor = 'default';
    };
  }, [processing]);

  // Tối ưu UI: Hiển thị thông báo khi không có file video được chọn
  const showNoFileNotice = !videoInfo.selectedFile;

  // Tự động render frame
  useEffect(() => {
    if (videoState.isPlaying) {
      const frameInterval = setInterval(renderFrame, 100);
      return () => clearInterval(frameInterval);
    } else {
      renderFrame();
    }
  }, [videoState.isPlaying, renderFrame]);

  // Thay thế các phần UI lớn bằng component đã tách
  return (
    <div className={`cut-video-wrapper ${theme}`}> 
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-2/3">
          <VideoPlayer
            videoRef={videoRef}
            videoState={videoState}
            togglePlayPause={togglePlayPause}
            seekTo={seekTo}
            setVolume={setVolume}
            toggleMute={toggleMute}
            setPlaybackRate={setPlaybackRate}
            formatTime={formatTime}
            handleFullscreen={handleFullscreen}
            speedMenu={speedMenu}
            canvasRef={canvasRef}
            theme={theme}
          />
          <TimelineControls
            videoInfo={videoInfo}
            videoState={videoState}
            setVideoInfo={setVideoInfo}
            handleTimelineChange={handleTimelineChange}
            formatTime={formatTime}
            seekTo={seekTo}
            renderFrame={renderFrame}
            theme={theme}
          />
          {showNoFileNotice && (
            <div className="p-6 text-center text-gray-500 bg-gray-100 rounded-xl mt-4">
              <span>Vui lòng chọn một file video để bắt đầu chỉnh sửa.</span>
            </div>
          )}
        </div>
        <div className="w-full md:w-1/3">
          <RecentFilesList recentFiles={recentFiles} handleFileSelect={handleFileSelect} removeFile={removeFile} />
          <button
            className="w-full mt-4 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={selectSaveDirectory}
          >
            Chọn thư mục lưu video
          </button>
        </div>
      </div>
      <ProgressModal showProgressModal={showProgressModal} theme={theme} progress={progress} processing={processing} videoInfo={videoInfo} />
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {error}
        </div>
      )}
    </div>
  );
});

export default CutVideo;
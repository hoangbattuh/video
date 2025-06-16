import React, { useRef, useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  Slider,
  Button,
  Typography,
  Upload,
  Space,
  Card,
  Row,
  Col,
  Radio,
  InputNumber,
  Checkbox,
  message,
  Progress,
  Modal,
  Tabs,
  Tooltip,
  Menu,
  Dropdown,
  Switch,
  Divider,
  Tag,
  Alert,
  List,
  Avatar,
  Badge
} from 'antd';
import {
  ScissorOutlined,
  UploadOutlined,
  FolderOpenOutlined,
  SettingOutlined,
  PlayCircleOutlined,
  PauseOutlined,
  SoundOutlined,
  MutedOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  ForwardOutlined,
  BackwardOutlined,
  StepForwardOutlined,
  StepBackwardOutlined,
  BulbOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  HistoryOutlined,
  ThunderboltOutlined,
  RobotOutlined,
  RocketOutlined,
  AudioOutlined,
  PictureOutlined,
  StarOutlined,
  CheckOutlined,
  CloseOutlined,
  MoonOutlined,
  SunOutlined,
  ReloadOutlined,
  SaveOutlined,
  VideoCameraOutlined // Đã thêm icon bị thiếu
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import './CutVideo.module.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Custom Hook cho Video Player
const useVideoPlayer = () => {
  const videoRef = useRef(null);
  const [videoState, setVideoState] = useState({
    duration: 0,
    currentTime: 0,
    isPlaying: false,
    volume: 1,
    muted: false,
    playbackRate: 1,
    isFullscreen: false
  });

  const updateVideoState = useCallback((updates) => {
    setVideoState(prev => ({ ...prev, ...updates }));
  }, []);

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.paused) {
      video.play();
      updateVideoState({ isPlaying: true });
    } else {
      video.pause();
      updateVideoState({ isPlaying: false });
    }
  }, [updateVideoState]);

  const seekTo = useCallback((time) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = time;
      updateVideoState({ currentTime: time });
    }
  }, [updateVideoState]);

  const setVolume = useCallback((volume) => {
    const video = videoRef.current;
    if (video) {
      video.volume = volume;
      updateVideoState({ volume, muted: volume === 0 });
    }
  }, [updateVideoState]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      updateVideoState({ muted: video.muted });
    }
  }, [updateVideoState]);

  const setPlaybackRate = useCallback((rate) => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = rate;
      updateVideoState({ playbackRate: rate });
    }
  }, [updateVideoState]);

  return {
    videoRef,
    videoState,
    updateVideoState,
    togglePlayPause,
    seekTo,
    setVolume,
    toggleMute,
    setPlaybackRate
  };
};

// Custom Hook cho Video Processing
const useVideoProcessor = () => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const ffmpegWorker = useRef(null);

  const initWorker = useCallback(() => {
    if (!ffmpegWorker.current) {
      // Sửa đường dẫn worker
      ffmpegWorker.current = new Worker('/ffmpeg-worker.js');
      ffmpegWorker.current.onmessage = handleWorkerMessage;
    }
  }, []);

  const handleWorkerMessage = useCallback((e) => {
    const { type, data } = e.data;
    switch (type) {
      case 'progress':
        setProgress(data);
        break;
      case 'done':
        setProcessing(false);
        setProgress(100);
        message.success('Xử lý video thành công!');
        break;
      case 'error':
        setProcessing(false);
        setError(data.message || 'Lỗi không xác định');
        message.error(`Lỗi: ${data.message || 'Không rõ nguyên nhân'}`);
        break;
    }
  }, []);

  const processVideo = useCallback((options) => {
    if (!ffmpegWorker.current) {
      initWorker();
    }
    
    setProcessing(true);
    setProgress(0);
    setError(null);
    
    ffmpegWorker.current.postMessage(options);
  }, [initWorker]);

  return {
    processing,
    progress,
    error,
    processVideo,
    initWorker
  };
};

// Custom Hook cho File Management
const useFileManager = () => {
  const [files, setFiles] = useState([]);
  const [saveDir, setSaveDir] = useState('');
  const [recentFiles, setRecentFiles] = useState([]);

  const addFile = useCallback((file) => {
    const fileInfo = {
      id: Date.now(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      addedAt: new Date()
    };
    
    setFiles(prev => [fileInfo, ...prev]);
    setRecentFiles(prev => [fileInfo, ...prev.slice(0, 4)]);
    
    return fileInfo;
  }, []);

  const removeFile = useCallback((id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const selectSaveDirectory = useCallback(() => {
    const dir = window.prompt('Nhập đường dẫn thư mục lưu:', saveDir || '');
    if (dir) {
      setSaveDir(dir);
      localStorage.setItem('videoEditor_saveDir', dir);
    }
  }, [saveDir]);

  useEffect(() => {
    const savedDir = localStorage.getItem('videoEditor_saveDir');
    if (savedDir) setSaveDir(savedDir);
  }, []);

  return {
    files,
    saveDir,
    recentFiles,
    addFile,
    removeFile,
    selectSaveDirectory
  };
};

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

  // Tự động render frame
  useEffect(() => {
    if (videoState.isPlaying) {
      const frameInterval = setInterval(renderFrame, 100);
      return () => clearInterval(frameInterval);
    } else {
      renderFrame();
    }
  }, [videoState.isPlaying, renderFrame]);

  return (
    <div className={`min-h-screen transition-all duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`} onDrop={handleDrop} onDragOver={handleDragOver}>
      <div className="p-4 max-w-7xl mx-auto">
        <Card className={`rounded-xl shadow-lg mb-6 ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'
        }`}>
          <Row justify="space-between" align="middle" className="mb-4">
            <Col xs={24} sm={12}>
              <Title level={3} className={`mb-0 flex items-center ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                <ScissorOutlined className="mr-2 text-blue-500" />
                Video Editor Pro
                <Badge count={files.length} className="ml-2" />
              </Title>
            </Col>
            
            <Col xs={24} sm={12}>
              <Space wrap className="w-full justify-end">
                <Tooltip title="Chuyển đổi theme">
                  <Button 
                    icon={<BulbOutlined />} 
                    onClick={toggleTheme}
                    type={theme === 'dark' ? 'primary' : 'default'}
                  />
                </Tooltip>
                
                <Upload 
                  accept="video/*" 
                  showUploadList={false} 
                  beforeUpload={() => false} 
                  onChange={handleFileSelect}
                  multiple
                >
                  <Button icon={<UploadOutlined />} type="primary" ghost>
                    Tải video
                  </Button>
                </Upload>
                
                <Button 
                  icon={<FolderOpenOutlined />} 
                  onClick={selectSaveDirectory}
                >
                  {saveDir ? 'Đổi thư mục' : 'Chọn thư mục'}
                </Button>
                
                <Button 
                  type="primary" 
                  icon={<ScissorOutlined />} 
                  onClick={handleCutVideo} 
                  disabled={!videoState.duration || processing}
                  loading={processing}
                  size="large"
                >
                  Cắt video
                </Button>
              </Space>
            </Col>
          </Row>

          {/* Recent Files */}
          {recentFiles.length > 0 && (
            <Alert
              message="Files gần đây"
              description={
                <List
                  size="small"
                  dataSource={recentFiles}
                  renderItem={file => (
                    <List.Item
                      key={file.id} // Thêm key ở đây 
                      actions={[
                        <Button 
                          key={`view-${file.id}`} // Thêm key 
                          size="small" 
                          icon={<EyeOutlined />}
                          onClick={() => {
                            const mockFile = new File([], file.name, { type: file.type });
                            handleFileSelect({ file: mockFile });
                          }}
                        />,
                        <Button 
                          key={`delete-${file.id}`} // Thêm key 
                          size="small" 
                          icon={<DeleteOutlined />}
                          onClick={() => removeFile(file.id)}
                        />
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<VideoCameraOutlined />} />}
                        title={file.name}
                        description={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                      />
                    </List.Item>
                  )}
                />
              }
              type="info"
              showIcon
              className="mb-4"
            />
          )}

          {error && (
            <Alert
              message="Lỗi xử lý"
              description={error}
              type="error"
              showIcon
              closable
              className="mb-4"
            />
          )}

          <Modal
            title={
              <div className="flex items-center">
                <ThunderboltOutlined className="mr-2 text-blue-500" />
                <span className={theme === 'dark' ? 'text-white' : 'text-blue-600'}>
                  Đang xử lý video
                </span>
              </div>
            }
            open={showProgressModal}
            footer={null}
            closable={false}
            centered
            className={theme === 'dark' ? 'dark-modal ant-modal-dark' : ''}
          >
            <div className="text-center">
              <Progress 
                percent={progress} 
                status={processing ? "active" : "success"}
                strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }} 
                className="mb-4"
                format={percent => (
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-800'}>
                    {percent}%
                  </span>
                )}
              />
              <div className="mb-4">
                <Text type="secondary" className="block mb-2">
                  Vui lòng không tắt trình duyệt trong quá trình xử lý...
                </Text>
                <Text type="secondary" className="text-sm">
                  Chế độ: {videoInfo.mode} | 
                  Thời lượng: {(videoInfo.cutEnd - videoInfo.cutStart).toFixed(1)}s
                </Text>
              </div>
              {processing && (
                <div className="flex justify-center space-x-2">
                  <Tag color="processing">Đang xử lý</Tag>
                  <Tag color="blue">{videoInfo.mode}</Tag>
                  {videoInfo.lossless && <Tag color="green">Lossless</Tag>}
                </div>
              )}
            </div>
          </Modal>

          <Row gutter={[24, 16]}>
            {/* Cột video và timeline */}
            <Col xs={24} lg={16}>
              <div className={`relative rounded-xl overflow-hidden mb-4 ${
                theme === 'dark' ? 'bg-gray-900' : 'bg-black'
              }`}>
                <video
                  ref={videoRef}
                  className="w-full max-h-[70vh] object-contain"
                  onClick={togglePlayPause}
                  onDoubleClick={handleFullscreen}
                />
                
                {!videoState.duration && (
                  <div className={`absolute inset-0 flex flex-col items-center justify-center ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
                  }`}>
                    <div className="text-center p-8">
                      <UploadOutlined className="text-6xl text-gray-400 mb-4" />
                      <Text className={`text-lg block mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Kéo thả video vào đây hoặc click để tải
                      </Text>
                      <Text className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                      }`}>
                        Hỗ trợ: MP4, AVI, MOV, MKV, WebM
                      </Text>
                    </div>
                  </div>
                )}
                
                {/* Video Controls Overlay */}
                {videoState.duration > 0 && (
                  <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
                    
                    {/* Top Controls */}
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <Tooltip title="Tốc độ phát">
                        <Dropdown overlay={speedMenu} trigger={['click']}>
                          <Button 
                            type="text" 
                            className="text-white bg-black/50 hover:bg-black/70"
                            size="small"
                          >
                            {videoState.playbackRate}x
                          </Button>
                        </Dropdown>
                      </Tooltip>
                      
                      <Tooltip title="Toàn màn hình">
                        <Button 
                          type="text" 
                          icon={document.fullscreenElement ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                          className="text-white bg-black/50 hover:bg-black/70"
                          size="small"
                          onClick={handleFullscreen}
                        />
                      </Tooltip>
                    </div>
                    
                    {/* Center Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button 
                        type="text" 
                        icon={videoState.isPlaying ? <PauseOutlined /> : <PlayCircleOutlined />} 
                        onClick={togglePlayPause}
                        className="text-white text-4xl w-16 h-16 flex items-center justify-center bg-black/50 hover:bg-black/70 rounded-full"
                      />
                    </div>
                    
                    {/* Bottom Controls */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center space-x-3">
                        <Button 
                          type="text" 
                          icon={<StepBackwardOutlined />}
                          onClick={() => seekTo(Math.max(0, videoState.currentTime - 10))}
                          className="text-white bg-black/50 hover:bg-black/70"
                          size="small"
                        />
                        
                        <Button 
                          type="text" 
                          icon={videoState.isPlaying ? <PauseOutlined /> : <PlayCircleOutlined />} 
                          onClick={togglePlayPause}
                          className="text-white bg-black/50 hover:bg-black/70"
                        />
                        
                        <Button 
                          type="text" 
                          icon={<StepForwardOutlined />}
                          onClick={() => seekTo(Math.min(videoState.duration, videoState.currentTime + 10))}
                          className="text-white bg-black/50 hover:bg-black/70"
                          size="small"
                        />
                        
                        <div className="flex-1 mx-4">
                          <Slider
                            min={0}
                            max={videoState.duration}
                            value={videoState.currentTime}
                            step={0.1}
                            onChange={seekTo}
                            tooltip={{
                              formatter: formatTime
                            }}
                            className="video-progress-slider"
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button 
                            type="text" 
                            icon={videoState.muted ? <MutedOutlined /> : <SoundOutlined />}
                            onClick={toggleMute}
                            className="text-white bg-black/50 hover:bg-black/70"
                            size="small"
                          />
                          
                          <div className="w-20">
                            <Slider
                              min={0}
                              max={1}
                              step={0.1}
                              value={videoState.volume}
                              onChange={setVolume}
                              tooltip={{
                                formatter: value => `${Math.round(value * 100)}%`
                              }}
                            />
                          </div>
                          
                          <Text className="text-white text-xs min-w-max bg-black/50 px-2 py-1 rounded">
                            {formatTime(videoState.currentTime)} / {formatTime(videoState.duration || 0)}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preview canvas */}
                <AnimatePresence>
                  {videoState.duration > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute bottom-2 right-2 bg-black/70 rounded-lg overflow-hidden"
                      style={{ width: '160px', height: '90px' }}
                    >
                      <canvas 
                        ref={canvasRef} 
                        className="w-full h-full object-contain"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Card className={`rounded-xl mb-4 ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <Title level={5} className={`mb-0 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    Điều chỉnh vùng cắt
                  </Title>
                  <Space>
                    <Tooltip title="Đặt điểm bắt đầu">
                      <Button 
                        size="small" 
                        icon={<BackwardOutlined />}
                        onClick={() => {
                          setVideoInfo(prev => ({ 
                            ...prev, 
                            cutStart: videoState.currentTime 
                          }));
                        }}
                      >
                        Đặt Start
                      </Button>
                    </Tooltip>
                    <Tooltip title="Đặt điểm kết thúc">
                      <Button 
                        size="small" 
                        icon={<ForwardOutlined />}
                        onClick={() => {
                          setVideoInfo(prev => ({ 
                            ...prev, 
                            cutEnd: videoState.currentTime 
                          }));
                        }}
                      >
                        Đặt End
                      </Button>
                    </Tooltip>
                  </Space>
                </div>
                
                <div className="mb-4">
                  <Slider
                    range
                    min={0}
                    max={videoState.duration || 100}
                    value={[videoInfo.cutStart, videoInfo.cutEnd]}
                    step={0.1}
                    onChange={handleTimelineChange}
                    tooltip={{ 
                      formatter: formatTime
                    }}
                    className="timeline-slider"
                  />
                </div>
                
                <Row gutter={[16, 8]}>
                  <Col xs={24} sm={8}>
                    <div className="text-center p-2 bg-blue-50 rounded border border-blue-200">
                      <Text strong className="text-blue-600 block text-xs mb-1">
                        BẮT ĐẦU
                      </Text>
                      <Text strong className="text-blue-700">
                        {formatTime(videoInfo.cutStart)}
                      </Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div className="text-center p-2 bg-green-50 rounded border border-green-200">
                      <Text strong className="text-green-600 block text-xs mb-1">
                        KẾT THÚC
                      </Text>
                      <Text strong className="text-green-700">
                        {formatTime(videoInfo.cutEnd)}
                      </Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div className="text-center p-2 bg-red-50 rounded border border-red-200">
                      <Text strong className="text-red-600 block text-xs mb-1">
                        ĐỘ DÀI
                      </Text>
                      <Text strong className="text-red-700">
                        {formatTime(videoInfo.cutEnd - videoInfo.cutStart)}
                      </Text>
                    </div>
                  </Col>
                </Row>
                
                {/* Quick Actions */}
                <Divider className="my-3" />
                <div className="flex flex-wrap gap-2">
                  <Button 
                    size="small" 
                    onClick={() => {
                      const duration = videoState.duration;
                      setVideoInfo(prev => ({ 
                        ...prev, 
                        cutStart: 0, 
                        cutEnd: duration 
                      }));
                    }}
                  >
                    Toàn bộ video
                  </Button>
                  <Button 
                    size="small" 
                    onClick={() => {
                      const current = videoState.currentTime;
                      setVideoInfo(prev => ({ 
                        ...prev, 
                        cutStart: Math.max(0, current - 30), 
                        cutEnd: Math.min(videoState.duration, current + 30) 
                      }));
                    }}
                  >
                    ±30s từ hiện tại
                  </Button>
                  <Button 
                    size="small" 
                    onClick={() => {
                      const current = videoState.currentTime;
                      setVideoInfo(prev => ({ 
                        ...prev, 
                        cutStart: Math.max(0, current - 60), 
                        cutEnd: Math.min(videoState.duration, current + 60) 
                      }));
                    }}
                  >
                    ±1 phút từ hiện tại
                  </Button>
                </div>
              </Card>
            </Col>

            {/* Cột điều khiển */}
            <Col xs={24} lg={8}>
              <Tabs 
                activeKey={activeTab}
                onChange={setActiveTab}
                className={`custom-tabs ${
                  theme === 'dark' ? 'dark-tabs' : ''
                }`}
                items={[
                  {
                    key: 'basic',
                    label: (
                      <span className="font-medium flex items-center">
                        <SettingOutlined className="mr-2" />
                        Cắt cơ bản
                      </span>
                    ),
                    children: (
                      <div className="space-y-4">
                        <Card className={`rounded-xl shadow-sm ${
                          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'
                        }`}>
                          <Title level={5} className={`mb-3 flex items-center ${
                            theme === 'dark' ? 'text-white' : 'text-gray-800'
                          }`}>
                            <SettingOutlined className="mr-2 text-blue-500" />
                            Chế độ cắt
                          </Title>
                          
                          <Radio.Group 
                            value={videoInfo.mode}
                            onChange={e => handleModeChange(e.target.value)}
                            className="w-full"
                          >
                            <Space direction="vertical" className="w-full">
                              <Radio.Button value="manual" className="w-full text-center h-12 flex items-center justify-center">
                                <div className="flex items-center">
                                  <ScissorOutlined className="mr-2" />
                                  Thủ công
                                </div>
                              </Radio.Button>
                              <Radio.Button value="scene" className="w-full text-center h-12 flex items-center justify-center">
                                <div className="flex items-center">
                                  <RobotOutlined className="mr-2" />
                                  Theo cảnh (AI)
                                </div>
                              </Radio.Button>
                              <Radio.Button value="keyframe" className="w-full text-center h-12 flex items-center justify-center">
                                <div className="flex items-center">
                                  <ThunderboltOutlined className="mr-2" />
                                  Bám keyframe
                                </div>
                              </Radio.Button>
                              <Radio.Button value="multi" className="w-full text-center h-12 flex items-center justify-center">
                                <div className="flex items-center">
                                  <RocketOutlined className="mr-2" />
                                  Cắt nhiều đoạn
                                </div>
                              </Radio.Button>
                            </Space>
                          </Radio.Group>
                          
                          {videoInfo.mode === 'multi' && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <Title level={5} className="mb-3 text-blue-700 flex items-center">
                                <RocketOutlined className="mr-2" />
                                Cài đặt Multi-cut
                              </Title>
                              <Radio.Group
                                value={videoInfo.multiType}
                                onChange={e => setVideoInfo(prev => ({ 
                                  ...prev, 
                                  multiType: e.target.value 
                                }))}
                                className="mb-3 w-full"
                              >
                                <Space direction="vertical" className="w-full">
                                <Radio value="duration" className="w-full">
                                  <div className="flex items-center">
                                    <AudioOutlined className="mr-2" />
                                    Theo thời lượng
                                  </div>
                                </Radio>
                                <Radio value="count" className="w-full">
                                  <div className="flex items-center">
                                    <PictureOutlined className="mr-2" />
                                    Theo số đoạn
                                  </div>
                                </Radio>
                              </Space>
                            </Radio.Group>
                            
                            {videoInfo.multiType === 'duration' && (
                              <div className="space-y-2">
                                <Text strong className="block">Thời lượng mỗi đoạn:</Text>
                                <InputNumber
                                  min={1}
                                  max={3600}
                                  value={videoInfo.segmentTime}
                                  onChange={val => setVideoInfo(prev => ({ 
                                    ...prev, 
                                    segmentTime: val 
                                  }))}
                                  addonAfter="giây"
                                  className="w-full"
                                  size="large"
                                />
                                <Text type="secondary" className="text-xs">
                                  Sẽ tạo ra {Math.ceil(videoState.duration / videoInfo.segmentTime)} đoạn video
                                </Text>
                              </div>
                            )}
                            
                            {videoInfo.multiType === 'count' && (
                              <div className="space-y-2">
                                <Text strong className="block">Số đoạn muốn cắt:</Text>
                                <InputNumber
                                  min={2}
                                  max={50}
                                  value={videoInfo.segmentCount}
                                  onChange={val => setVideoInfo(prev => ({ 
                                    ...prev, 
                                    segmentCount: val 
                                  }))}
                                  addonAfter="đoạn"
                                  className="w-full"
                                  size="large"
                                />
                                <Text type="secondary" className="text-xs">
                                  Mỗi đoạn dài {(videoState.duration / videoInfo.segmentCount).toFixed(1)} giây
                                </Text>
                              </div>
                            )}
                          </div>
                        )}
                      </Card>
                      
                      <Card className={`rounded-xl shadow-sm ${
                        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'
                      }`}>
                        <Title level={5} className={`mb-3 flex items-center ${
                          theme === 'dark' ? 'text-white' : 'text-gray-800'
                        }`}>
                          <DownloadOutlined className="mr-2 text-green-500" />
                          Tùy chọn xuất
                        </Title>
                        
                        <Space direction="vertical" className="w-full">
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
                            <div className="flex items-center">
                              <StarOutlined className="mr-2 text-green-600" />
                              <div>
                                <Text strong className="block">Không mất chất lượng</Text>
                                <Text type="secondary" className="text-xs">Giữ nguyên chất lượng gốc khi cắt</Text>
                              </div>
                            </div>
                            <Switch
                              checked={videoInfo.lossless}
                              onChange={checked => setVideoInfo(prev => ({ 
                                ...prev, 
                                lossless: checked 
                              }))}
                              checkedChildren="ON"
                              unCheckedChildren="OFF"
                            />
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200">
                            <div className="flex items-center">
                              <ThunderboltOutlined className="mr-2 text-blue-600" />
                              <div>
                                <Text strong className="block">Bám keyframe</Text>
                                <Text type="secondary" className="text-xs">Tự động bám vào khung hình chính</Text>
                              </div>
                            </div>
                            <Switch
                              checked={videoInfo.snapKeyframe}
                              onChange={checked => setVideoInfo(prev => ({ 
                                ...prev, 
                                snapKeyframe: checked 
                              }))}
                              checkedChildren="ON"
                              unCheckedChildren="OFF"
                            />
                          </div>
                          
                          {saveDir && (
                            <div className="p-3 bg-gray-50 rounded border border-gray-200">
                              <Text type="secondary" className="flex items-center">
                                <FolderOpenOutlined className="mr-2 text-orange-500" />
                                <span className="font-medium">Lưu tại:</span>
                              </Text>
                              <Text className="block mt-1 text-xs break-all">
                                {saveDir}
                              </Text>
                            </div>
                          )}
                        </Space>
                      </Card>
                    </div>
                  )
                },
              
                {
                  key: 'advanced',
                  label: (
                    <span className="font-medium flex items-center">
                      <RobotOutlined className="mr-2" />
                      Nâng cao
                    </span>
                  ),
                  children: (
                    <div className="space-y-4">
                      <Card className={`rounded-xl shadow-sm ${
                        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'
                      }`}>
                        <Title level={5} className={`mb-3 flex items-center ${
                          theme === 'dark' ? 'text-white' : 'text-gray-800'
                        }`}>
                          <RobotOutlined className="mr-2 text-purple-500" />
                          Tính năng AI
                        </Title>
                        
                        <div className="space-y-3">
                          {advancedOptions.slice(0, 6).map(option => (
                            <div key={option.value} className="flex items-center justify-between p-3 bg-purple-50 rounded border border-purple-200 hover:bg-purple-100 transition-colors">
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                                <div>
                                  <Text strong className="block">{option.label}</Text>
                                  <Text type="secondary" className="text-xs">
                                    {getOptionDescription(option.value)}
                                  </Text>
                                </div>
                              </div>
                              <Switch
                                size="small"
                                checked={!!videoInfo.advancedOptions[option.value]}
                                onChange={checked => handleAdvancedOptionChange(option.value, checked)}
                                checkedChildren={<CheckOutlined />}
                                unCheckedChildren={<CloseOutlined />}
                              />
                            </div>
                          ))}
                        </div>
                      </Card>
                      
                      <Card className={`rounded-xl shadow-sm ${
                        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'
                      }`}>
                        <Title level={5} className={`mb-3 flex items-center ${
                          theme === 'dark' ? 'text-white' : 'text-gray-800'
                        }`}>
                          <ThunderboltOutlined className="mr-2 text-orange-500" />
                          Tối ưu hóa
                        </Title>
                        
                        <div className="space-y-3">
                          {advancedOptions.slice(6).map(option => (
                            <div key={option.value} className="flex items-center justify-between p-3 bg-orange-50 rounded border border-orange-200 hover:bg-orange-100 transition-colors">
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                                <div>
                                  <Text strong className="block">{option.label}</Text>
                                  <Text type="secondary" className="text-xs">
                                    {getOptionDescription(option.value)}
                                  </Text>
                                </div>
                              </div>
                              <Switch
                                size="small"
                                checked={!!videoInfo.advancedOptions[option.value]}
                                onChange={checked => handleAdvancedOptionChange(option.value, checked)}
                                checkedChildren={<CheckOutlined />}
                                unCheckedChildren={<CloseOutlined />}
                              />
                            </div>
                          ))}
                        </div>
                      </Card>
                      
                      <Card className={`rounded-xl shadow-sm ${
                        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'
                      }`}>
                        <Title level={5} className={`mb-3 flex items-center ${
                          theme === 'dark' ? 'text-white' : 'text-gray-800'
                        }`}>
                          <SettingOutlined className="mr-2 text-blue-500" />
                          Cài đặt nâng cao
                        </Title>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Text strong className="block">Chế độ tối</Text>
                              <Text type="secondary" className="text-xs">Giao diện tối cho mắt</Text>
                            </div>
                            <Switch
                              checked={theme === 'dark'}
                              onChange={toggleTheme}
                              checkedChildren={<MoonOutlined />}
                              unCheckedChildren={<SunOutlined />}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Text strong className="block">Tự động lưu</Text>
                              <Text type="secondary" className="text-xs">Tự động lưu cài đặt</Text>
                            </div>
                            <Switch
                              checked={autoSave}
                              onChange={setAutoSave}
                              checkedChildren="ON"
                              unCheckedChildren="OFF"
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Text strong className="block">Hiển thị tooltip</Text>
                              <Text type="secondary" className="text-xs">Hiện gợi ý khi hover</Text>
                            </div>
                            <Switch
                              checked={showTooltips}
                              onChange={setShowTooltips}
                              checkedChildren="ON"
                              unCheckedChildren="OFF"
                            />
                          </div>
                        </div>
                      </Card>
                    </div>
                  )
                },
              ]}
            />
          </Col>
        </Row>
        
        <canvas ref={canvasRef} className="hidden" />
      </Card>
      
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Space direction="vertical">
          <Tooltip key="save-btn" title="Lưu cài đặt">
            <Button 
              type="primary" 
              shape="circle" 
              icon={<SaveOutlined />}
              size="large"
              onClick={saveSettings}
              className="shadow-lg"
            />
          </Tooltip>
          <Tooltip key="reset-btn" title="Tải lại">
            <Button 
              shape="circle" 
              icon={<ReloadOutlined />}
              onClick={resetSettings}
              className="shadow-lg"
            />
          </Tooltip>
        </Space>
      </div>
    </div> {/* Đóng thẻ div chính */}
    </div>
  );
});

export default CutVideo;
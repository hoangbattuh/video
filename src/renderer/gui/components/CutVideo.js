import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  memo,
} from "react";
import {
  message,
  Button,
  Card,
  Typography,
  Radio,
  Row,
  Col,
  Switch,
  Select,
  InputNumber,
  Tooltip,
  Tabs,
  Menu,
} from "antd";
import {
  FileAddOutlined,
  FolderOpenOutlined,
  SettingOutlined,
  SunOutlined,
  MoonOutlined,
  QuestionCircleOutlined,
  ScissorOutlined,
  SplitCellsOutlined,
  ThunderboltOutlined,
  AppstoreOutlined,
  EyeOutlined,
  ReloadOutlined,
  VideoCameraOutlined,
  CloseOutlined,
} from "@ant-design/icons";

import ProgressModal from "./Cutvideo-components/ProgressModal";
import VideoPlayer from "./Cutvideo-components/VideoPlayer";
import RecentFilesList from "./Cutvideo-components/RecentFilesList";
import TimelineControls from "./Cutvideo-components/TimelineControls";
import useVideoPlayer from "../hooks/useVideoPlayer";
import useVideoProcessor from "../hooks/useVideoProcessor";
import useFileManager from "../hooks/useFileManager";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const CutVideo = memo(() => {
  const [videoInfo, setVideoInfo] = useState({
    cutStart: 0,
    cutEnd: 10,
    mode: "manual",
    segmentTime: 15,
    segmentCount: 3,
    multiType: "duration",
    lossless: true,
    snapKeyframe: true,
    advancedOptions: {},
    selectedFile: null,
  });

  const [showProgressModal, setShowProgressModal] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [theme, setTheme] = useState("light");
  const [autoSave, setAutoSave] = useState(true);
  const [showTooltips, setShowTooltips] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const canvasRef = useRef(null);

  // Custom hooks
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
  const { processing, progress, error, processVideo, initWorker } =
    useVideoProcessor();
  const {
    files,
    saveDir,
    recentFiles,
    addFile,
    removeFile,
    selectSaveDirectory,
  } = useFileManager();

  // Hàm chọn file
  const selectFile = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        handleFileSelect(file);
      }
    };
    input.click();
  }, [handleFileSelect]);

  // Xử lý tải video với tối ưu hóa
  const handleFileSelect = useCallback(
    (file) => {
      if (typeof file === "object" && file.file) {
        file = file.file;
      }

      const fileInfo = addFile(file);
      const video = videoRef.current;

      if (!video) return;

      video.src = fileInfo.url;

      video.onloadedmetadata = () => {
        updateVideoState({
          duration: video.duration,
          currentTime: 0,
          isPlaying: false,
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
        });

        setVideoInfo((prev) => ({
          ...prev,
          cutEnd: Math.min(10, video.duration),
          selectedFile: fileInfo,
        }));

        initWorker();
        renderFrame();
      };

      video.onerror = () => {
        message.error("Không thể tải video. Vui lòng kiểm tra định dạng file.");
        removeFile(fileInfo.id);
      };
    },
    [addFile, updateVideoState, initWorker, removeFile, renderFrame]
  );

  // Render khung hình hiện tại với tối ưu hóa
  const renderFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (video.videoWidth && video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
  }, []);

  // Hàm xử lý cắt video
  const handleCutVideo = useCallback(async () => {
    if (!videoInfo.selectedFile) {
      message.error("Vui lòng chọn video trước");
      return;
    }

    if (videoInfo.cutStart >= videoInfo.cutEnd) {
      message.error("Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc");
      return;
    }

    setShowProgressModal(true);

    try {
      const options = {
        startTime: videoInfo.cutStart,
        endTime: videoInfo.cutEnd,
        mode: videoInfo.mode,
        lossless: videoInfo.lossless,
        snapKeyframe: videoInfo.snapKeyframe,
        ...videoInfo.advancedOptions,
      };

      if (videoInfo.mode === "segments") {
        options.multiType = videoInfo.multiType;
        options.segmentTime = videoInfo.segmentTime;
        options.segmentCount = videoInfo.segmentCount;
      }

      await processVideo(videoInfo.selectedFile, options);
      message.success("Cắt video thành công!");
    } catch (err) {
      message.error("Lỗi khi cắt video: " + err.message);
    } finally {
      setShowProgressModal(false);
    }
  }, [videoInfo, processVideo]);

  // Hàm xử lý thay đổi tùy chọn nâng cao
  const handleAdvancedOptionChange = useCallback((key, value) => {
    setVideoInfo((prev) => ({
      ...prev,
      advancedOptions: {
        ...prev.advancedOptions,
        [key]: value,
      },
    }));
  }, []);

  // Xử lý thay đổi chế độ cắt
  const handleModeChange = useCallback((mode) => {
    setVideoInfo((prev) => ({ ...prev, mode }));
  }, []);

  // Xử lý phím tắt
  const handleKeyPress = useCallback(
    (e) => {
      if (!videoRef.current) return;

      // Không xử lý phím tắt khi đang focus vào input
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlayPause();
          break;
        case "ArrowLeft":
          e.preventDefault();
          seekTo(Math.max(0, videoState.currentTime - 10));
          break;
        case "ArrowRight":
          e.preventDefault();
          seekTo(Math.min(videoState.duration, videoState.currentTime + 10));
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume(Math.min(1, videoState.volume + 0.1));
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume(Math.max(0, videoState.volume - 0.1));
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
          message.success("Đã đặt điểm bắt đầu");
          break;
        case "o":
        case "O":
          e.preventDefault();
          setVideoInfo((prev) => ({ ...prev, cutEnd: videoState.currentTime }));
          message.success("Đã đặt điểm kết thúc");
          break;
        case "x":
        case "X":
          if (e.ctrlKey) {
            e.preventDefault();
            handleCutVideo();
          }
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
      handleFullscreen,
      setVideoInfo,
    ]
  );

  // Định dạng thời gian
  const formatTime = useCallback((seconds) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, []);

  // Kiểm tra có file được chọn không
  const showNoFileNotice = !videoInfo.selectedFile;

  // Xử lý drag & drop
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      const videoFile = files.find((file) => file.type.startsWith("video/"));

      if (videoFile) {
        handleFileSelect({ file: videoFile });
      } else {
        message.warning("Vui lòng chọn file video hợp lệ!");
      }
    },
    [handleFileSelect]
  );

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
        currentTime: video.currentTime,
      });
    };

    const handleEnded = () => {
      updateVideoState({ isPlaying: false });
    };

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("ended", handleEnded);
    };
  }, [updateVideoState, renderFrame]);

  // Keyboard shortcuts effect
  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
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
      advancedOptions: videoInfo.advancedOptions,
    };
    localStorage.setItem("videoEditor_settings", JSON.stringify(settings));
  }, [videoInfo]);

  // Load saved settings
  useEffect(() => {
    const savedSettings = localStorage.getItem("videoEditor_settings");
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setVideoInfo((prev) => ({ ...prev, ...settings }));
      } catch (error) {
        console.warn("Failed to load saved settings:", error);
      }
    }
  }, []);

  // Tùy chọn nâng cao với mô tả chi tiết
  const advancedOptions = useMemo(
    () => [
      {
        label: "Cắt theo frame chính xác",
        value: "frameCut",
        description:
          "Cắt chính xác theo frame, tăng độ chính xác nhưng chậm hơn",
        category: "precision",
      },
      {
        label: "Phát hiện thay đổi cảnh",
        value: "sceneDetection",
        description: "Tự động phát hiện và cắt theo thay đổi cảnh",
        category: "ai",
      },
      {
        label: "Phát hiện chuyển động",
        value: "motionDetection",
        description: "Phát hiện vùng có chuyển động để tối ưu cắt",
        category: "ai",
      },
      {
        label: "Phát hiện khuôn mặt",
        value: "faceDetection",
        description: "Ưu tiên giữ lại các đoạn có khuôn mặt",
        category: "ai",
      },
      {
        label: "Phát hiện âm thanh lớn",
        value: "audioSpike",
        description: "Cắt dựa trên mức độ âm thanh",
        category: "audio",
      },
      {
        label: "Phát hiện đoạn im lặng",
        value: "silenceDetection",
        description: "Loại bỏ hoặc rút ngắn các đoạn im lặng",
        category: "audio",
      },
      {
        label: "Tự động căn giữa đối tượng",
        value: "autoCenter",
        description: "Tự động crop và căn giữa đối tượng chính",
        category: "enhancement",
      },
      {
        label: "Loại bỏ logo/watermark",
        value: "logoRemoval",
        description: "Tự động phát hiện và loại bỏ logo",
        category: "enhancement",
      },
      {
        label: "Bảo toàn âm thanh gốc",
        value: "preserveAudio",
        description: "Giữ nguyên chất lượng âm thanh gốc",
        category: "quality",
      },
      {
        label: "Xử lý hàng loạt",
        value: "batchProcessing",
        description: "Cho phép xử lý nhiều video cùng lúc",
        category: "performance",
      },
      {
        label: "Hiệu ứng chuyển tiếp",
        value: "transitions",
        description: "Thêm hiệu ứng mượt mà giữa các đoạn",
        category: "enhancement",
      },
      {
        label: "Giữ metadata gốc",
        value: "keepMetadata",
        description: "Bảo toàn thông tin metadata của video",
        category: "quality",
      },
    ],
    []
  );

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

  // Helper functions

  const getOptionDescription = useCallback((option) => {
    const descriptions = {
      frameCut: "Cắt chính xác theo từng frame",
      sceneDetection: "Tự động phát hiện thay đổi cảnh",
      motionDetection: "Phát hiện chuyển động trong video",
      faceDetection: "Nhận diện khuôn mặt trong video",
      audioSpike: "Phát hiện âm thanh đột ngột",
      silenceDetection: "Tìm các đoạn im lặng",
      autoCenter: "Tự động căn giữa đối tượng chính",
      logoRemoval: "Loại bỏ logo và watermark",
      preserveAudio: "Giữ nguyên chất lượng âm thanh",
      batchProcessing: "Xử lý nhiều file cùng lúc",
      transitions: "Thêm hiệu ứng chuyển tiếp",
      keepMetadata: "Giữ thông tin metadata gốc",
    };
    return descriptions[option] || "Tính năng nâng cao";
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const newTheme = prev === "light" ? "dark" : "light";
      localStorage.setItem("videoEditor_theme", newTheme);
      return newTheme;
    });
  }, []);

  const saveSettings = useCallback(() => {
    const settings = {
      videoInfo,
      theme,
      autoSave,
      showTooltips,
      saveDir,
    };
    localStorage.setItem("videoEditorSettings", JSON.stringify(settings));
    message.success("Đã lưu cài đặt!");
    setShowSettings(false);
  }, [videoInfo, theme, autoSave, showTooltips, saveDir]);

  const resetSettings = useCallback(() => {
    setVideoInfo({
      cutStart: 0,
      cutEnd: 10,
      mode: "manual",
      segmentTime: 15,
      segmentCount: 3,
      multiType: "duration",
      lossless: true,
      snapKeyframe: true,
      advancedOptions: {},
      selectedFile: null,
    });
    setTheme("light");
    setAutoSave(true);
    setShowTooltips(true);
    message.info("Đã khôi phục cài đặt mặc định!");
  }, []);

  // Xử lý thay đổi slider timeline
  const handleTimelineChange = useCallback(
    ([start, end]) => {
      setVideoInfo((prev) => ({
        ...prev,
        cutStart: start,
        cutEnd: end,
      }));
      seekTo(start);
      renderFrame();
    },
    [seekTo, renderFrame]
  );

  // Playback rate options
  const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

  // Speed control menu
  const speedMenu = (
    <Menu>
      {playbackRates.map((rate) => (
        <Menu.Item
          key={`speed-${rate}`}
          onClick={() => setPlaybackRate(rate)}
          className={
            videoState.playbackRate === rate ? "ant-menu-item-selected" : ""
          }
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
      video.requestFullscreen().catch((e) => {
        console.error("Lỗi toàn màn hình:", e);
        message.error("Trình duyệt không hỗ trợ toàn màn hình");
      });
    }
  }, []);

  // Load theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("videoEditor_theme") || "light";
    setTheme(savedTheme);
  }, []);

  // Thêm hiệu ứng loading khi đang xử lý video
  useEffect(() => {
    if (processing) {
      document.body.style.cursor = "wait";
    } else {
      document.body.style.cursor = "default";
    }
    return () => {
      document.body.style.cursor = "default";
    };
  }, [processing]);

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
    <div
      className={`cut-video-wrapper min-h-screen ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Header với toolbar */}
      <div
        className={`sticky top-0 z-40 ${
          theme === "dark"
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } border-b px-6 py-4`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1
              className={`text-2xl font-bold ${
                theme === "dark" ? "text-white" : "text-gray-800"
              }`}
            >
              Video Editor Pro - Cắt Video
            </h1>
            <div className="flex items-center space-x-2">
              <Button
                type="primary"
                icon={<FileAddOutlined />}
                onClick={selectFile}
                size="large"
              >
                Chọn Video
              </Button>
              <Button
                icon={<FolderOpenOutlined />}
                onClick={selectSaveDirectory}
                size="large"
              >
                Thư mục lưu
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Tooltip title="Cài đặt">
              <Button
                icon={<SettingOutlined />}
                onClick={() => setShowSettings(!showSettings)}
                type={showSettings ? "primary" : "default"}
              />
            </Tooltip>
            <Tooltip title={theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}>
              <Button
                icon={theme === "dark" ? <SunOutlined /> : <MoonOutlined />}
                onClick={toggleTheme}
              />
            </Tooltip>
            <Tooltip title="Phím tắt">
              <Button
                icon={<QuestionCircleOutlined />}
                onClick={() => setShowShortcuts(!showShortcuts)}
              />
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          <div className="flex flex-1">
            {/* Video player section */}
            <div className="flex-1 p-6">
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

              {/* Timeline và controls */}
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

              {/* Cutting modes */}
              <Card
                className={`mb-4 ${
                  theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white"
                }`}
              >
                <Title
                  level={5}
                  className={`mb-4 ${
                    theme === "dark" ? "text-white" : "text-gray-800"
                  }`}
                >
                  Chế độ cắt video
                </Title>
                <Radio.Group
                  value={videoInfo.mode}
                  onChange={(e) =>
                    setVideoInfo((prev) => ({ ...prev, mode: e.target.value }))
                  }
                  className="w-full"
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                      <Radio.Button
                        value="manual"
                        className="w-full text-center"
                      >
                        <div className="p-2">
                          <ScissorOutlined className="text-lg mb-1" />
                          <div className="text-sm">Cắt thủ công</div>
                        </div>
                      </Radio.Button>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <Radio.Button
                        value="segments"
                        className="w-full text-center"
                      >
                        <div className="p-2">
                          <SplitCellsOutlined className="text-lg mb-1" />
                          <div className="text-sm">Chia đoạn</div>
                        </div>
                      </Radio.Button>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <Radio.Button
                        value="smart"
                        className="w-full text-center"
                      >
                        <div className="p-2">
                          <ThunderboltOutlined className="text-lg mb-1" />
                          <div className="text-sm">Cắt thông minh</div>
                        </div>
                      </Radio.Button>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                      <Radio.Button
                        value="batch"
                        className="w-full text-center"
                      >
                        <div className="p-2">
                          <AppstoreOutlined className="text-lg mb-1" />
                          <div className="text-sm">Xử lý hàng loạt</div>
                        </div>
                      </Radio.Button>
                    </Col>
                  </Row>
                </Radio.Group>

                {/* Mode-specific controls */}
                {videoInfo.mode === "segments" && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <Row gutter={16}>
                      <Col span={12}>
                        <Text strong>Loại chia đoạn:</Text>
                        <Select
                          value={videoInfo.multiType}
                          onChange={(val) =>
                            setVideoInfo((prev) => ({
                              ...prev,
                              multiType: val,
                            }))
                          }
                          className="w-full mt-2"
                        >
                          <Option value="duration">Theo thời lượng</Option>
                          <Option value="count">Theo số đoạn</Option>
                          <Option value="size">Theo kích thước</Option>
                        </Select>
                      </Col>
                      <Col span={12}>
                        {videoInfo.multiType === "duration" && (
                          <div>
                            <Text strong>Thời lượng mỗi đoạn (giây):</Text>
                            <InputNumber
                              min={1}
                              max={3600}
                              value={videoInfo.segmentTime}
                              onChange={(val) =>
                                setVideoInfo((prev) => ({
                                  ...prev,
                                  segmentTime: val,
                                }))
                              }
                              className="w-full mt-2"
                            />
                          </div>
                        )}
                        {videoInfo.multiType === "count" && (
                          <div>
                            <Text strong>Số đoạn:</Text>
                            <InputNumber
                              min={2}
                              max={100}
                              value={videoInfo.segmentCount}
                              onChange={(val) =>
                                setVideoInfo((prev) => ({
                                  ...prev,
                                  segmentCount: val,
                                }))
                              }
                              className="w-full mt-2"
                            />
                          </div>
                        )}
                      </Col>
                    </Row>
                  </div>
                )}
              </Card>

              {/* Quality settings */}
              <Card
                className={`mb-4 ${
                  theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white"
                }`}
              >
                <Title
                  level={5}
                  className={`mb-4 ${
                    theme === "dark" ? "text-white" : "text-gray-800"
                  }`}
                >
                  Cài đặt chất lượng
                </Title>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={8}>
                    <div className="text-center">
                      <Switch
                        checked={videoInfo.lossless}
                        onChange={(checked) =>
                          setVideoInfo((prev) => ({
                            ...prev,
                            lossless: checked,
                          }))
                        }
                        className="mb-2"
                      />
                      <div className="text-sm">Chất lượng gốc</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div className="text-center">
                      <Switch
                        checked={videoInfo.snapKeyframe}
                        onChange={(checked) =>
                          setVideoInfo((prev) => ({
                            ...prev,
                            snapKeyframe: checked,
                          }))
                        }
                        className="mb-2"
                      />
                      <div className="text-sm">Snap to keyframe</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div className="text-center">
                      <Switch
                        checked={videoInfo.advancedOptions.preserveAudio}
                        onChange={(checked) =>
                          handleAdvancedOptionChange("preserveAudio", checked)
                        }
                        className="mb-2"
                      />
                      <div className="text-sm">Giữ âm thanh gốc</div>
                    </div>
                  </Col>
                </Row>
              </Card>

              {/* Action buttons */}
              <Card
                className={`${
                  theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white"
                }`}
              >
                <Row gutter={16}>
                  <Col xs={24} sm={8}>
                    <Button
                      type="primary"
                      size="large"
                      icon={<ScissorOutlined />}
                      onClick={handleCutVideo}
                      disabled={!videoInfo.selectedFile || processing}
                      loading={processing}
                      className="w-full"
                    >
                      {processing ? "Đang xử lý..." : "Cắt Video"}
                    </Button>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Button
                      size="large"
                      icon={<EyeOutlined />}
                      onClick={() => {
                        if (videoInfo.selectedFile) {
                          seekTo(videoInfo.cutStart);
                          togglePlayPause();
                        }
                      }}
                      disabled={!videoInfo.selectedFile}
                      className="w-full"
                    >
                      Xem trước
                    </Button>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Button
                      size="large"
                      icon={<ReloadOutlined />}
                      onClick={() => {
                        setVideoInfo((prev) => ({
                          ...prev,
                          cutStart: 0,
                          cutEnd: videoState.duration || 10,
                        }));
                        seekTo(0);
                      }}
                      disabled={!videoInfo.selectedFile}
                      className="w-full"
                    >
                      Đặt lại
                    </Button>
                  </Col>
                </Row>
              </Card>

              {showNoFileNotice && (
                <Card className="mt-4">
                  <div className="text-center py-12">
                    <VideoCameraOutlined className="text-6xl text-gray-400 mb-4" />
                    <Title level={4} className="text-gray-500 mb-2">
                      Chưa có video nào được chọn
                    </Title>
                    <Text className="text-gray-400 mb-6 block">
                      Vui lòng chọn một file video để bắt đầu chỉnh sửa hoặc kéo
                      thả file vào đây
                    </Text>
                    <Button
                      type="primary"
                      size="large"
                      icon={<FileAddOutlined />}
                      onClick={selectFile}
                    >
                      Chọn Video
                    </Button>
                  </div>
                </Card>
              )}
            </div>

            {/* Right sidebar */}
            <div
              className={`w-80 ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              } border-l overflow-y-auto`}
            >
              <div className="p-4">
                {/* Recent files */}
                <RecentFilesList
                  recentFiles={recentFiles}
                  handleFileSelect={handleFileSelect}
                  removeFile={removeFile}
                />

                {/* Video info */}
                {videoInfo.selectedFile && (
                  <Card
                    className={`mt-4 ${
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600"
                        : "bg-gray-50"
                    }`}
                    size="small"
                  >
                    <Title
                      level={5}
                      className={`mb-3 ${
                        theme === "dark" ? "text-white" : "text-gray-800"
                      }`}
                    >
                      Thông tin video
                    </Title>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Thời lượng:</span>
                        <span
                          className={
                            theme === "dark" ? "text-white" : "text-gray-800"
                          }
                        >
                          {formatTime(videoState.duration)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Độ phân giải:</span>
                        <span
                          className={
                            theme === "dark" ? "text-white" : "text-gray-800"
                          }
                        >
                          {videoState.videoWidth}x{videoState.videoHeight}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Kích thước:</span>
                        <span
                          className={
                            theme === "dark" ? "text-white" : "text-gray-800"
                          }
                        >
                          {(
                            videoInfo.selectedFile.size /
                            (1024 * 1024)
                          ).toFixed(1)}{" "}
                          MB
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Đoạn cắt:</span>
                        <span
                          className={
                            theme === "dark" ? "text-white" : "text-gray-800"
                          }
                        >
                          {formatTime(
                            Math.abs(videoInfo.cutEnd - videoInfo.cutStart)
                          )}
                        </span>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Presets */}
                <Card
                  className={`mt-4 ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600"
                      : "bg-gray-50"
                  }`}
                  size="small"
                >
                  <Title
                    level={5}
                    className={`mb-3 ${
                      theme === "dark" ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Preset nhanh
                  </Title>
                  <div className="space-y-2">
                    <Button
                      size="small"
                      className="w-full text-left"
                      onClick={() => {
                        const duration = videoState.duration || 60;
                        setVideoInfo((prev) => ({
                          ...prev,
                          cutStart: 0,
                          cutEnd: Math.min(30, duration),
                          mode: "manual",
                        }));
                      }}
                    >
                      30 giây đầu
                    </Button>
                    <Button
                      size="small"
                      className="w-full text-left"
                      onClick={() => {
                        const duration = videoState.duration || 60;
                        setVideoInfo((prev) => ({
                          ...prev,
                          cutStart: Math.max(0, duration - 30),
                          cutEnd: duration,
                          mode: "manual",
                        }));
                      }}
                    >
                      30 giây cuối
                    </Button>
                    <Button
                      size="small"
                      className="w-full text-left"
                      onClick={() => {
                        const duration = videoState.duration || 60;
                        const start = duration * 0.25;
                        const end = duration * 0.75;
                        setVideoInfo((prev) => ({
                          ...prev,
                          cutStart: start,
                          cutEnd: end,
                          mode: "manual",
                        }));
                      }}
                    >
                      Phần giữa (50%)
                    </Button>
                    <Button
                      size="small"
                      className="w-full text-left"
                      onClick={() => {
                        setVideoInfo((prev) => ({
                          ...prev,
                          mode: "segments",
                          multiType: "duration",
                          segmentTime: 15,
                        }));
                      }}
                    >
                      Chia 15s/đoạn
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <Card className="w-[600px] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <Title level={4} className="mb-0">
                Cài đặt nâng cao
              </Title>
              <Button
                icon={<CloseOutlined />}
                onClick={() => setShowSettings(false)}
              />
            </div>

            <Tabs>
              <TabPane tab="Tùy chọn AI" key="ai">
                {Object.entries(groupedOptions).map(([category, options]) => (
                  <div key={category} className="mb-6">
                    <Title level={5} className="mb-3 capitalize">
                      {category === "ai" && "Trí tuệ nhân tạo"}
                      {category === "audio" && "Xử lý âm thanh"}
                      {category === "enhancement" && "Cải thiện chất lượng"}
                      {category === "precision" && "Độ chính xác"}
                      {category === "quality" && "Chất lượng"}
                      {category === "performance" && "Hiệu suất"}
                    </Title>
                    <div className="space-y-3">
                      {options.map((option) => (
                        <div
                          key={option.value}
                          className="flex items-start space-x-3"
                        >
                          <Switch
                            checked={
                              videoInfo.advancedOptions[option.value] || false
                            }
                            onChange={(checked) =>
                              handleAdvancedOptionChange(option.value, checked)
                            }
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-gray-500">
                              {option.description}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </TabPane>
              <TabPane tab="Giao diện" key="ui">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Chế độ tối</span>
                    <Switch checked={theme === "dark"} onChange={toggleTheme} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tự động lưu</span>
                    <Switch checked={autoSave} onChange={setAutoSave} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Hiển thị tooltip</span>
                    <Switch checked={showTooltips} onChange={setShowTooltips} />
                  </div>
                </div>
              </TabPane>
              <TabPane tab="Xuất video" key="export">
                <div className="space-y-4">
                  <div>
                    <Text strong>Định dạng xuất:</Text>
                    <Select defaultValue="mp4" className="w-full mt-2">
                      <Option value="mp4">MP4 (H.264)</Option>
                      <Option value="webm">WebM</Option>
                      <Option value="avi">AVI</Option>
                      <Option value="mov">MOV</Option>
                    </Select>
                  </div>
                  <div>
                    <Text strong>Chất lượng:</Text>
                    <Select defaultValue="high" className="w-full mt-2">
                      <Option value="low">Thấp (Nhanh)</Option>
                      <Option value="medium">Trung bình</Option>
                      <Option value="high">Cao (Chậm)</Option>
                      <Option value="lossless">Không mất chất lượng</Option>
                    </Select>
                  </div>
                </div>
              </TabPane>
            </Tabs>

            <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
              <Button onClick={resetSettings}>Khôi phục mặc định</Button>
              <Button type="primary" onClick={saveSettings}>
                Lưu cài đặt
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Shortcuts panel */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <Card className="w-[500px]">
            <div className="flex items-center justify-between mb-4">
              <Title level={4} className="mb-0">
                Phím tắt
              </Title>
              <Button
                icon={<CloseOutlined />}
                onClick={() => setShowShortcuts(false)}
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Phát/Tạm dừng</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">
                  Space
                </kbd>
              </div>
              <div className="flex justify-between">
                <span>Tua lại 10s</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">←</kbd>
              </div>
              <div className="flex justify-between">
                <span>Tua tới 10s</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">→</kbd>
              </div>
              <div className="flex justify-between">
                <span>Tăng âm lượng</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">↑</kbd>
              </div>
              <div className="flex justify-between">
                <span>Giảm âm lượng</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">↓</kbd>
              </div>
              <div className="flex justify-between">
                <span>Tắt/Bật tiếng</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">M</kbd>
              </div>
              <div className="flex justify-between">
                <span>Toàn màn hình</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">F</kbd>
              </div>
              <div className="flex justify-between">
                <span>Đặt điểm bắt đầu</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">I</kbd>
              </div>
              <div className="flex justify-between">
                <span>Đặt điểm kết thúc</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">O</kbd>
              </div>
              <div className="flex justify-between">
                <span>Cắt video</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">
                  Ctrl + X
                </kbd>
              </div>
            </div>
          </Card>
        </div>
      )}

      <ProgressModal
        showProgressModal={showProgressModal}
        theme={theme}
        progress={progress}
        processing={processing}
        videoInfo={videoInfo}
      />

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {error}
        </div>
      )}
    </div>
  );
});

export default CutVideo;

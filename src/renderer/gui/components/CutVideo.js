import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  memo,
} from "react";
import { message } from "antd";

import ProgressModal from "./Cutvideo-components/ProgressModal";
import Header from "./Cutvideo-components/Header";
import LeftSidebar from "./Cutvideo-components/LeftSidebar";
import MainContent from "./Cutvideo-components/MainContent";
import RightSidebar from "./Cutvideo-components/RightSidebar";
import SettingsModal from "./Cutvideo-components/SettingsModal";
import ShortcutsModal from "./Cutvideo-components/ShortcutsModal";
import useVideoPlayer from "../hooks/useVideoPlayer";
import useVideoProcessor from "../hooks/useVideoProcessor";
import useFileManager from "../hooks/useFileManager";
import useVideoSettings from "./hooks/useVideoSettings";

const CutVideo = memo(() => {
  // Use custom hooks
  const {
    videoInfo,
    setVideoInfo,
    activeTab,
    setActiveTab,
    theme,
    autoSave,
    setAutoSave,
    showTooltips,
    setShowTooltips,
    showSettings,
    setShowSettings,
    showShortcuts,
    setShowShortcuts,
    selectedPreset,
    platformPresets,
    groupedOptions,
    handleAdvancedOptionChange,
    handleModeChange,
    applyPreset,
    toggleTheme,
    saveSettings,
    resetSettings,
    formatTime,
  } = useVideoSettings();

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

  // Add showProgressModal state
  const [showProgressModal, setShowProgressModal] = useState(false);

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

  // Preset configurations for different platforms
  const platformPresets = useMemo(() => ({
    tiktok: {
      name: "TikTok",
      aspectRatio: "9:16",
      resolution: "1080x1920",
      duration: 60,
      effects: ["fade-in", "fade-out"],
      music: "trending",
      icon: "📱"
    },
    youtube: {
      name: "YouTube",
      aspectRatio: "16:9", 
      resolution: "1920x1080",
      duration: 300,
      effects: ["intro", "outro"],
      music: "background",
      icon: "🎬"
    },
    instagram: {
      name: "Instagram",
      aspectRatio: "1:1",
      resolution: "1080x1080",
      duration: 90,
      effects: ["filter", "transition"],
      music: "upbeat",
      icon: "📷"
    },
    facebook: {
      name: "Facebook",
      aspectRatio: "16:9",
      resolution: "1280x720",
      duration: 180,
      effects: ["captions", "thumbnail"],
      music: "ambient",
      icon: "👥"
    }
  }), []);

  const [selectedPreset, setSelectedPreset] = useState(null);

  const applyPreset = useCallback((presetKey) => {
    const preset = platformPresets[presetKey];
    if (preset) {
      setVideoInfo(prev => ({
        ...prev,
        cutEnd: Math.min(preset.duration, videoState.duration || preset.duration),
        advancedOptions: {
          ...prev.advancedOptions,
          aspectRatio: preset.aspectRatio,
          resolution: preset.resolution,
          effects: preset.effects,
          music: preset.music
        }
      }));
      setSelectedPreset(presetKey);
      message.success(`Đã áp dụng preset ${preset.name}`);
    }
  }, [platformPresets, videoState.duration]);

  return (
    <div
      className={`cut-video-wrapper min-h-screen ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Header */}
      <Header
        theme={theme}
        selectFile={selectFile}
        selectSaveDirectory={selectSaveDirectory}
        setShowSettings={setShowSettings}
        setShowShortcuts={setShowShortcuts}
        toggleTheme={toggleTheme}
        showTooltips={showTooltips}
      />

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar */}
        <LeftSidebar
          theme={theme}
          recentFiles={recentFiles}
          handleFileSelect={handleFileSelect}
          platformPresets={platformPresets}
          selectedPreset={selectedPreset}
          applyPreset={applyPreset}
          showTooltips={showTooltips}
        />

        {/* Main Content */}
        <MainContent
          theme={theme}
          videoInfo={videoInfo}
          videoRef={videoRef}
          canvasRef={canvasRef}
          videoState={videoState}
          handleFileSelect={handleFileSelect}
          handleDrop={handleDrop}
          handleDragOver={handleDragOver}
          togglePlayPause={togglePlayPause}
          seekTo={seekTo}
          setVolume={setVolume}
          toggleMute={toggleMute}
          setPlaybackRate={setPlaybackRate}
          handleFullscreen={handleFullscreen}
          handleTimelineChange={handleTimelineChange}
          setVideoInfo={setVideoInfo}
          formatTime={formatTime}
          showTooltips={showTooltips}
        />

        {/* Right Sidebar */}
        <RightSidebar
          videoInfo={videoInfo}
          setVideoInfo={setVideoInfo}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleModeChange={handleModeChange}
          handleAdvancedOptionChange={handleAdvancedOptionChange}
          handleCutVideo={handleCutVideo}
          groupedOptions={groupedOptions}
          formatTime={formatTime}
          showTooltips={showTooltips}
          videoState={videoState}
          theme={theme}
        />
      </div>

      {/* Modals */}
      <SettingsModal
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        theme={theme}
        autoSave={autoSave}
        setAutoSave={setAutoSave}
        showTooltips={showTooltips}
        setShowTooltips={setShowTooltips}
        saveSettings={saveSettings}
        resetSettings={resetSettings}
      />

      <ShortcutsModal
        showShortcuts={showShortcuts}
        setShowShortcuts={setShowShortcuts}
        theme={theme}
      />





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

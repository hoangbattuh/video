import { useState, useCallback, useEffect, useMemo } from 'react';
import { message } from 'antd';

const useVideoSettings = () => {
  const [videoInfo, setVideoInfo] = useState({
    cutStart: 0,
    cutEnd: 10,
    mode: "manual",
    segmentTime: 15,
    segmentCount: 3,
    multiType: "duration",
    lossless: true,
    snapKeyframe: true,
    advancedOptions: {
      preserveAudio: true,
      removeMetadata: false,
      fastStart: true,
      customCodec: false,
      smartCut: false,
      autoEnhance: false,
      noiseReduction: false,
      stabilization: false,
      colorCorrection: false,
      hardwareAccel: true,
      multiThreading: true,
      memoryOptimization: false,
    },
    selectedFile: null,
  });

  const [activeTab, setActiveTab] = useState("basic");
  const [theme, setTheme] = useState("light");
  const [autoSave, setAutoSave] = useState(true);
  const [showTooltips, setShowTooltips] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);

  // Platform presets
  const platformPresets = useMemo(() => ({
    tiktok: {
      name: "TikTok",
      icon: "🎵",
      aspectRatio: "9:16",
      resolution: "1080x1920",
      maxDuration: 180,
      effects: ["Vertical", "Quick cuts", "Trending music"],
      description: "Tối ưu cho TikTok - Video dọc, cắt nhanh"
    },
    youtube: {
      name: "YouTube",
      icon: "📺",
      aspectRatio: "16:9",
      resolution: "1920x1080",
      maxDuration: 600,
      effects: ["Horizontal", "Intro/Outro", "Thumbnails"],
      description: "Tối ưu cho YouTube - Video ngang, chất lượng cao"
    },
    instagram: {
      name: "Instagram",
      icon: "📸",
      aspectRatio: "1:1",
      resolution: "1080x1080",
      maxDuration: 60,
      effects: ["Square", "Stories", "Reels"],
      description: "Tối ưu cho Instagram - Video vuông hoặc Stories"
    },
    facebook: {
      name: "Facebook",
      icon: "👥",
      aspectRatio: "16:9",
      resolution: "1280x720",
      maxDuration: 240,
      effects: ["Social", "Auto-captions", "Engagement"],
      description: "Tối ưu cho Facebook - Tương tác cao"
    }
  }), []);

  // Grouped advanced options
  const groupedOptions = useMemo(() => ({
    precision: [
      { value: "smartCut", label: "Cắt thông minh", description: "Tự động phát hiện cảnh tốt nhất" },
      { value: "fastStart", label: "Khởi động nhanh", description: "Tối ưu cho streaming" },
    ],
    ai: [
      { value: "autoEnhance", label: "Tự động cải thiện", description: "AI tự động cải thiện chất lượng" },
      { value: "smartCut", label: "Cắt AI", description: "AI chọn điểm cắt tối ưu" },
    ],
    audio: [
      { value: "preserveAudio", label: "Giữ âm thanh gốc", description: "Không nén âm thanh" },
      { value: "noiseReduction", label: "Giảm nhiễu", description: "Loại bỏ tiếng ồn nền" },
    ],
    enhancement: [
      { value: "stabilization", label: "Chống rung", description: "Ổn định hình ảnh" },
      { value: "colorCorrection", label: "Hiệu chỉnh màu", description: "Tự động cân bằng màu sắc" },
    ],
    quality: [
      { value: "removeMetadata", label: "Xóa metadata", description: "Loại bỏ thông tin EXIF" },
      { value: "customCodec", label: "Codec tùy chỉnh", description: "Sử dụng codec chuyên dụng" },
    ],
    performance: [
      { value: "hardwareAccel", label: "Tăng tốc phần cứng", description: "Sử dụng GPU để xử lý" },
      { value: "multiThreading", label: "Đa luồng", description: "Xử lý song song" },
      { value: "memoryOptimization", label: "Tối ưu bộ nhớ", description: "Giảm sử dụng RAM" },
    ]
  }), []);

  // Handlers
  const handleAdvancedOptionChange = useCallback((key, value) => {
    setVideoInfo((prev) => ({
      ...prev,
      advancedOptions: {
        ...prev.advancedOptions,
        [key]: value,
      },
    }));
  }, []);

  const handleModeChange = useCallback((mode) => {
    setVideoInfo((prev) => ({ ...prev, mode }));
  }, []);

  const applyPreset = useCallback((presetKey) => {
    const preset = platformPresets[presetKey];
    if (!preset) return;

    setSelectedPreset(presetKey);
    setVideoInfo(prev => ({
      ...prev,
      cutEnd: Math.min(prev.cutEnd, preset.maxDuration),
      advancedOptions: {
        ...prev.advancedOptions,
        aspectRatio: preset.aspectRatio,
        targetResolution: preset.resolution,
      }
    }));
    message.success(`Đã áp dụng preset ${preset.name}`);
  }, [platformPresets]);

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
    };
    localStorage.setItem("videoEditorSettings", JSON.stringify(settings));
    message.success("Đã lưu cài đặt!");
    setShowSettings(false);
  }, [videoInfo, theme, autoSave, showTooltips]);

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
      advancedOptions: {
        preserveAudio: true,
        removeMetadata: false,
        fastStart: true,
        customCodec: false,
        smartCut: false,
        autoEnhance: false,
        noiseReduction: false,
        stabilization: false,
        colorCorrection: false,
        hardwareAccel: true,
        multiThreading: true,
        memoryOptimization: false,
      },
      selectedFile: null,
    });
    setTheme("light");
    setAutoSave(true);
    setShowTooltips(true);
    message.info("Đã khôi phục cài đặt mặc định!");
  }, []);

  const formatTime = useCallback((seconds) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Auto-save settings
  useEffect(() => {
    if (autoSave) {
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
    }
  }, [videoInfo, autoSave]);

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

    const savedTheme = localStorage.getItem("videoEditor_theme");
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  return {
    // State
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
    
    // Data
    platformPresets,
    groupedOptions,
    
    // Handlers
    handleAdvancedOptionChange,
    handleModeChange,
    applyPreset,
    toggleTheme,
    saveSettings,
    resetSettings,
    formatTime,
  };
};

export default useVideoSettings;
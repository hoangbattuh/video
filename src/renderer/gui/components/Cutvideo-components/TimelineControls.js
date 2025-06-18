import React, { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Slider,
  Typography,
  InputNumber,
  Button,
  Space,
  Tooltip,
  Card,
  Row,
  Col,
  Select,
  Dropdown,
  Menu,
  Progress,
} from "antd";
import PropTypes from "prop-types";
import {
  BackwardOutlined,
  ForwardOutlined,
  ScissorOutlined,
  PlayCircleOutlined,
  ClearOutlined,
  ColumnWidthOutlined,
  ClockCircleOutlined,
  MoreOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  BorderOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

const TimelineControls = ({
  videoInfo,
  videoState,
  setVideoInfo,
  onTimelineChange,
  formatTime,
  seekTo,
  theme,
  showTooltips,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showWaveform, setShowWaveform] = useState(false);
  const [snapToKeyframes, setSnapToKeyframes] = useState(true);

  // Calculate zoom range
  const zoomRange = useMemo(() => {
    const duration = videoState.duration || 100;
    const zoomedDuration = duration / zoomLevel;
    const center = (videoInfo.cutStart + videoInfo.cutEnd) / 2;
    const start = Math.max(0, center - zoomedDuration / 2);
    const end = Math.min(duration, start + zoomedDuration);
    return [start, end];
  }, [videoState.duration, zoomLevel, videoInfo.cutStart, videoInfo.cutEnd]);

  // Quick preset durations
  const quickPresets = [
    { label: "15s", value: 15 },
    { label: "30s", value: 30 },
    { label: "1m", value: 60 },
    { label: "2m", value: 120 },
    { label: "5m", value: 300 },
    { label: "10m", value: 600 },
  ];

  // Handle timeline range change with validation
  const handleTimelineChange = useCallback(
    ([start, end]) => {
      const validStart = Math.max(0, Math.min(start, videoState.duration || 0));
      const validEnd = Math.max(
        validStart + 0.1,
        Math.min(end, videoState.duration || 0),
      );

      onTimelineChange([validStart, validEnd]);
    },
    [onTimelineChange, videoState.duration],
  );

  // Quick actions
  const setCurrentAsStart = useCallback(() => {
    setVideoInfo((prev) => ({
      ...prev,
      cutStart: Math.min(videoState.currentTime, prev.cutEnd - 0.1),
    }));
  }, [videoState.currentTime, setVideoInfo]);

  const setCurrentAsEnd = useCallback(() => {
    setVideoInfo((prev) => ({
      ...prev,
      cutEnd: Math.max(videoState.currentTime, prev.cutStart + 0.1),
    }));
  }, [videoState.currentTime, setVideoInfo]);

  const applyQuickPreset = useCallback(
    (duration) => {
      const start = videoState.currentTime;
      const end = Math.min(start + duration, videoState.duration);
      setVideoInfo((prev) => ({ ...prev, cutStart: start, cutEnd: end }));
    },
    [videoState.currentTime, videoState.duration, setVideoInfo],
  );

  const resetSelection = useCallback(() => {
    setVideoInfo((prev) => ({
      ...prev,
      cutStart: 0,
      cutEnd: Math.min(30, videoState.duration),
    }));
  }, [videoState.duration, setVideoInfo]);

  const selectAll = useCallback(() => {
    setVideoInfo((prev) => ({
      ...prev,
      cutStart: 0,
      cutEnd: videoState.duration,
    }));
  }, [videoState.duration, setVideoInfo]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev * 2, 16));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev / 2, 1));
  }, []);

  const resetZoom = useCallback(() => {
    setZoomLevel(1);
  }, []);

  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    if (!videoState.duration) return 0;
    return (videoState.currentTime / videoState.duration) * 100;
  }, [videoState.currentTime, videoState.duration]);

  // Calculate selection percentage
  const selectionPercentage = useMemo(() => {
    if (!videoState.duration) return 0;
    const selectionDuration = videoInfo.cutEnd - videoInfo.cutStart;
    return (selectionDuration / videoState.duration) * 100;
  }, [videoInfo.cutStart, videoInfo.cutEnd, videoState.duration]);

  // More options menu
  const moreOptionsMenu = [
    {
      key: "waveform",
      icon: <ColumnWidthOutlined />,
      label: `${showWaveform ? "Ẩn" : "Hiện"} dạng sóng`,
    },
    {
      key: "snap",
      icon: <BorderOutlined />,
      label: `${snapToKeyframes ? "Tắt" : "Bật"} snap keyframe`,
    },
    {
      type: "divider",
    },
    {
      key: "reset-zoom",
      icon: <ZoomOutOutlined />,
      label: "Reset zoom",
    },
    {
      key: "select-all",
      icon: <ClearOutlined />,
      label: "Chọn toàn bộ",
    },
  ];

  if (!videoState.duration) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`timeline-card ${theme === "dark" ? "dark" : ""}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Title
              level={5}
              className={`mb-0 ${theme === "dark" ? "text-white" : "text-gray-800"}`}
            >
              <ClockCircleOutlined className="mr-2" />
              Điều chỉnh vùng cắt
            </Title>

            {/* Progress indicator */}
            <div className="hidden sm:flex items-center gap-2">
              <Progress
                type="circle"
                size={32}
                percent={Math.round(progressPercentage)}
                showInfo={false}
                strokeColor="#667eea"
                strokeWidth={8}
              />
              <Text type="secondary" style={{ fontSize: "0.8rem" }}>
                {Math.round(selectionPercentage)}% được chọn
              </Text>
            </div>
          </div>

          <Space>
            {/* Zoom Controls */}
            <Space.Compact>
              <Tooltip title={showTooltips ? "Thu nhỏ" : ""}>
                <Button
                  size="small"
                  icon={<ZoomOutOutlined />}
                  onClick={zoomOut}
                  disabled={zoomLevel <= 1}
                />
              </Tooltip>
              <Button size="small" disabled>
                {zoomLevel}x
              </Button>
              <Tooltip title={showTooltips ? "Phong to" : ""}>
                <Button
                  size="small"
                  icon={<ZoomInOutlined />}
                  onClick={zoomIn}
                  disabled={zoomLevel >= 16}
                />
              </Tooltip>
            </Space.Compact>

            {/* Quick Actions */}
            <Tooltip title={showTooltips ? "Đặt điểm bắt đầu" : ""}>
              <Button
                size="small"
                icon={<BackwardOutlined />}
                onClick={setCurrentAsStart}
                type="primary"
                ghost
              >
                Đặt Start
              </Button>
            </Tooltip>

            <Tooltip title={showTooltips ? "Đặt điểm kết thúc" : ""}>
              <Button
                size="small"
                icon={<ForwardOutlined />}
                onClick={setCurrentAsEnd}
                type="primary"
                ghost
              >
                Đặt End
              </Button>
            </Tooltip>

            {/* More Options */}
            <Dropdown overlay={moreOptionsMenu} trigger={["click"]}>
              <Button size="small" icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        </div>

        {/* Quick Presets */}
        <div className="mb-4">
          <Text className="text-sm font-medium mb-2 block">
            Preset nhanh từ vị trí hiện tại:
          </Text>
          <Space wrap>
            {quickPresets.map((preset) => (
              <Button
                key={preset.value}
                size="small"
                onClick={() => applyQuickPreset(preset.value)}
                disabled={
                  videoState.currentTime + preset.value > videoState.duration
                }
                style={{
                  background:
                    "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                  border: "1px solid rgba(102, 126, 234, 0.3)",
                  color: "#667eea",
                }}
              >
                {preset.label}
              </Button>
            ))}
            <Button
              size="small"
              icon={<ClearOutlined />}
              onClick={resetSelection}
              type="dashed"
            >
              Reset
            </Button>
          </Space>
        </div>

        {/* Main Timeline Slider */}
        <div className="mb-4">
          <div className="relative">
            {/* Background waveform visualization (placeholder) */}
            {showWaveform && (
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background: `repeating-linear-gradient(
                    90deg,
                    transparent 0px,
                    rgba(102, 126, 234, 0.2) 2px,
                    transparent 4px,
                    transparent 8px
                  )`,
                  height: "8px",
                  borderRadius: "4px",
                }}
              />
            )}

            <Slider
              range
              min={zoomLevel > 1 ? zoomRange[0] : 0}
              max={zoomLevel > 1 ? zoomRange[1] : videoState.duration || 100}
              value={[
                Math.max(0, Math.min(videoInfo.cutStart, videoInfo.cutEnd)),
                Math.max(0, Math.max(videoInfo.cutStart, videoInfo.cutEnd)),
              ]}
              step={snapToKeyframes ? 1 : 0.1}
              onChange={handleTimelineChange}
              tooltip={{
                formatter: formatTime,
                placement: "top",
              }}
              className="timeline-slider"
              trackStyle={[
                {
                  background:
                    "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                  height: 8,
                  borderRadius: 4,
                },
              ]}
              railStyle={{
                background: "rgba(0, 0, 0, 0.1)",
                height: 8,
                borderRadius: 4,
              }}
              handleStyle={[
                {
                  border: "3px solid #667eea",
                  background: "white",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                  width: 20,
                  height: 20,
                  marginTop: -6,
                },
                {
                  border: "3px solid #52c41a",
                  background: "white",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                  width: 20,
                  height: 20,
                  marginTop: -6,
                },
              ]}
            />

            {/* Current time indicator */}
            <div
              className="absolute top-0 w-0.5 bg-red-500 h-8 pointer-events-none"
              style={{
                left: `${
                  ((videoState.currentTime -
                    (zoomLevel > 1 ? zoomRange[0] : 0)) /
                    (zoomLevel > 1
                      ? zoomRange[1] - zoomRange[0]
                      : videoState.duration)) *
                  100
                }%`,
                transform: "translateX(-50%)",
                zIndex: 10,
              }}
            >
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full" />
            </div>
          </div>
        </div>

        {/* Precision Controls */}
        <Row gutter={[16, 12]}>
          <Col xs={24} sm={8}>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <Text
                strong
                className="text-blue-600 dark:text-blue-400 block text-xs mb-2 uppercase tracking-wide"
              >
                <BackwardOutlined className="mr-1" />
                Bắt đầu
              </Text>
              <InputNumber
                min={0}
                max={videoState.duration}
                step={0.1}
                value={Number(videoInfo.cutStart.toFixed(1))}
                onChange={(val) => {
                  const newStart = Math.min(val || 0, videoInfo.cutEnd - 0.1);
                  setVideoInfo((prev) => ({ ...prev, cutStart: newStart }));
                }}
                className="w-full"
                size="small"
                formatter={(value) => `${value}s`}
                parser={(value) => value.replace("s", "")}
              />
              <div className="mt-1 text-xs text-blue-500 dark:text-blue-400">
                {formatTime(videoInfo.cutStart)}
              </div>
            </div>
          </Col>

          <Col xs={24} sm={8}>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <Text
                strong
                className="text-green-600 dark:text-green-400 block text-xs mb-2 uppercase tracking-wide"
              >
                <ForwardOutlined className="mr-1" />
                Kết thúc
              </Text>
              <InputNumber
                min={0}
                max={videoState.duration}
                step={0.1}
                value={Number(videoInfo.cutEnd.toFixed(1))}
                onChange={(val) => {
                  const newEnd = Math.max(val || 0, videoInfo.cutStart + 0.1);
                  setVideoInfo((prev) => ({ ...prev, cutEnd: newEnd }));
                }}
                className="w-full"
                size="small"
                formatter={(value) => `${value}s`}
                parser={(value) => value.replace("s", "")}
              />
              <div className="mt-1 text-xs text-green-500 dark:text-green-400">
                {formatTime(videoInfo.cutEnd)}
              </div>
            </div>
          </Col>

          <Col xs={24} sm={8}>
            <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <Text
                strong
                className="text-yellow-600 dark:text-yellow-400 block text-xs mb-2 uppercase tracking-wide"
              >
                <ScissorOutlined className="mr-1" />
                Thời lượng
              </Text>
              <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                {formatTime(Math.max(0, videoInfo.cutEnd - videoInfo.cutStart))}
              </div>
              <div className="mt-1 text-xs text-yellow-500 dark:text-yellow-400">
                {(
                  ((videoInfo.cutEnd - videoInfo.cutStart) /
                    videoState.duration) *
                  100
                ).toFixed(1)}
                % của video
              </div>
            </div>
          </Col>
        </Row>

        {/* Additional Info */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <Row gutter={16}>
            <Col span={12}>
              <Text type="secondary" className="text-xs">
                Vị trí hiện tại:{" "}
                <strong>{formatTime(videoState.currentTime)}</strong>
              </Text>
            </Col>
            <Col span={12} className="text-right">
              <Text type="secondary" className="text-xs">
                Tổng thời lượng:{" "}
                <strong>{formatTime(videoState.duration)}</strong>
              </Text>
            </Col>
          </Row>
        </div>
      </Card>
    </motion.div>
  );
};

TimelineControls.propTypes = {
  videoInfo: PropTypes.object.isRequired,
  videoState: PropTypes.object.isRequired,
  setVideoInfo: PropTypes.func.isRequired,
  onTimelineChange: PropTypes.func.isRequired,
  formatTime: PropTypes.func.isRequired,
  seekTo: PropTypes.func.isRequired,
  theme: PropTypes.string.isRequired,
  showTooltips: PropTypes.bool,
};

TimelineControls.defaultProps = {
  showTooltips: true,
};

export default TimelineControls;

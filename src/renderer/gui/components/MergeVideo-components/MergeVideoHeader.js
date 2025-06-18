import React, { memo } from "react";
import { motion } from "framer-motion";
import {
  Button,
  Space,
  Tooltip,
  Dropdown,
  Menu,
  Badge,
  Progress,
  Typography,
  Select,
} from "antd";
import {
  FolderOpenOutlined,
  SaveOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  BulbOutlined,
  ExportOutlined,
  PlayCircleOutlined,
  VideoCameraAddOutlined,
  BgColorsOutlined,
  LayoutOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;
const { Option } = Select;

const MergeVideoHeader = memo(
  ({
    theme,
    currentMode,
    onModeChange,
    onImportFiles,
    onSaveProject,
    onExportVideo,
    onPreviewProject,
    onSettings,
    onHelp,
    toggleTheme,
    showTooltips,
    isExporting,
    exportProgress,
    layoutMode,
    onLayoutModeChange,
    videoCount = 0,
    timelineCount = 0,
  }) => {
    // Mode selection menu
    const modeItems = [
      {
        key: "beginner",
        label: (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "1.2rem" }}>🌱</span>
            <div>
              <div>Người mới bắt đầu</div>
              <div style={{ fontSize: "0.8rem", color: "#666" }}>
                Giao diện đơ giản
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "pro",
        label: (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "1.2rem" }}>⚡</span>
            <div>
              <div>Chuyên nghiệp</div>
              <div style={{ fontSize: "0.8rem", color: "#666" }}>
                Nhiều tính năng
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "expert",
        label: (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "1.2rem" }}>🚀</span>
            <div>
              <div>Chuyên gia</div>
              <div style={{ fontSize: "0.8rem", color: "#666" }}>
                Toàn quyền kiểm soát
              </div>
            </div>
          </div>
        ),
      },
    ];

    // Theme menu
    const themeMenuItems = [
      {
        key: 'light',
        icon: <BulbOutlined />,
        label: 'Giao diện sáng',
        style: {
          background: theme === 'light' ? '#f0f0f0' : 'transparent',
        },
        onClick: () => theme !== 'light' && toggleTheme()
      },
      {
        key: 'dark', 
        icon: <BgColorsOutlined />,
        label: 'Giao diện tối',
        style: {
          background: theme === 'dark' ? '#f0f0f0' : 'transparent',
        },
        onClick: () => theme !== 'dark' && toggleTheme()
      }
    ];

    const themeMenu = {
      items: themeMenuItems,
      selectable: true,
      selectedKeys: [theme]
    };

    // Layout mode menu
    const layoutMenuItems = [
      {
        key: 'standard',
        label: 'Chuẩn',
      },
      {
        key: 'compact',
        label: 'Gọn',
      },
      {
        key: 'wide',
        label: 'Rộng',
      }
    ];

    const layoutMenu = {
      items: layoutMenuItems,
      onClick: ({ key }) => onLayoutModeChange(key),
      selectable: true,
      selectedKeys: [layoutMode]
    };

    const getModeDisplay = () => {
      const modes = {
        beginner: { icon: "🌱", label: "Cơ bản", color: "#52c41a" },
        pro: { icon: "⚡", label: "Pro", color: "#1890ff" },
        expert: { icon: "🚀", label: "Expert", color: "#722ed1" },
      };
      return modes[currentMode] || modes.pro;
    };

    const modeDisplay = getModeDisplay();

    return (
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "16px 24px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 1px, transparent 1px),
                           radial-gradient(circle at 80% 50%, rgba(255,255,255,0.2) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
            backgroundPosition: "0 0, 30px 30px",
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            {/* Left Section - Title and Mode */}
            <div className="flex items-center space-x-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-3"
              >
                <div className="relative">
                  <VideoCameraAddOutlined
                    style={{
                      fontSize: "2.2rem",
                      color: "white",
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                    }}
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                  />
                </div>

                <div>
                  <Title
                    level={3}
                    style={{
                      color: "white",
                      margin: 0,
                      fontWeight: 700,
                      textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                    }}
                  >
                    Video Merger Pro
                  </Title>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.9)",
                      fontSize: "0.85rem",
                      textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                    }}
                  >
                    Ghép video chuyên nghiệp
                  </Text>
                </div>
              </motion.div>

              {/* Mode Selector */}
              <Dropdown
                menu={{
                  items: modeItems,
                  selectable: true,
                  selectedKeys: [currentMode],
                  onClick: ({ key }) => onModeChange(key),
                }}
                placement="bottomLeft"
                trigger={["click"]}
              >
                <Button
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    color: "white",
                    fontWeight: 600,
                    borderRadius: "8px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ fontSize: "1.1rem" }}>{modeDisplay.icon}</span>
                  <span>{modeDisplay.label}</span>
                </Button>
              </Dropdown>

              {/* Stats */}
              <div className="hidden lg:flex items-center space-x-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
                  <div className="flex items-center space-x-2">
                    <InfoCircleOutlined
                      style={{ color: "rgba(255,255,255,0.8)" }}
                    />
                    <div className="text-xs">
                      <div style={{ color: "white", fontWeight: 600 }}>
                        {videoCount} video • {timelineCount} timeline
                      </div>
                    </div>
                  </div>
                </div>

                {isExporting && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
                    <div className="flex items-center space-x-2">
                      <ThunderboltOutlined
                        style={{ color: "rgba(255,255,255,0.8)" }}
                      />
                      <div className="text-xs">
                        <div style={{ color: "white", fontWeight: 600 }}>
                          Đang xuất: {Math.round(exportProgress)}%
                        </div>
                        <Progress
                          percent={exportProgress}
                          size="small"
                          showInfo={false}
                          strokeColor="rgba(255,255,255,0.8)"
                          trailColor="rgba(255,255,255,0.2)"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Center Section - Main Actions */}
            <div className="flex items-center space-x-3">
              <Space.Compact>
                <Tooltip title={showTooltips ? "Nhập video để ghép" : ""}>
                  <Button
                    icon={<FolderOpenOutlined />}
                    onClick={onImportFiles}
                    type="primary"
                    style={{
                      background: "rgba(255,255,255,0.9)",
                      border: "none",
                      color: "#667eea",
                      fontWeight: 600,
                      height: "40px",
                    }}
                  >
                    <span className="hidden sm:inline">Nhập Video</span>
                  </Button>
                </Tooltip>

                <Tooltip title={showTooltips ? "Xem trước kết quả ghép" : ""}>
                  <Button
                    icon={<PlayCircleOutlined />}
                    onClick={onPreviewProject}
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      color: "white",
                      height: "40px",
                    }}
                  >
                    <span className="hidden sm:inline">Xem trước</span>
                  </Button>
                </Tooltip>

                <Tooltip title={showTooltips ? "Xuất video đã ghép" : ""}>
                  <Button
                    type="primary"
                    icon={<ExportOutlined />}
                    onClick={onExportVideo}
                    disabled={timelineCount === 0}
                    style={{
                      background:
                        timelineCount > 0
                          ? "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)"
                          : "rgba(255,255,255,0.3)",
                      border: "none",
                      height: "40px",
                      fontWeight: 600,
                    }}
                  >
                    <span className="hidden sm:inline">Xuất Video</span>
                  </Button>
                </Tooltip>
              </Space.Compact>
            </div>

            {/* Right Section - Settings and Tools */}
            <div className="flex items-center space-x-2">
              {/* Layout Mode */}
              {currentMode !== "beginner" && (
                <Tooltip title={showTooltips ? "Chế độ bố cục" : ""}>
                  <Dropdown
                    overlay={layoutMenu}
                    trigger={["click"]}
                    placement="bottomRight"
                  >
                    <Button
                      icon={<LayoutOutlined />}
                      type="text"
                      style={{
                        color: "white",
                        background: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        height: "36px",
                      }}
                    />
                  </Dropdown>
                </Tooltip>
              )}

              {/* Theme Switcher */}
              <Tooltip title={showTooltips ? "Chuyển đổi giao diện" : ""}>
                <Dropdown
                  overlay={themeMenu}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <Button
                    icon={
                      theme === "dark" ? <BulbOutlined /> : <BgColorsOutlined />
                    }
                    type="text"
                    style={{
                      color: "white",
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      height: "36px",
                    }}
                  />
                </Dropdown>
              </Tooltip>

              {/* Save Project */}
              <Tooltip title={showTooltips ? "Lưu dự án hiện tại" : ""}>
                <Badge dot={timelineCount > 0} color="orange">
                  <Button
                    icon={<SaveOutlined />}
                    onClick={onSaveProject}
                    type="text"
                    style={{
                      color: "white",
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      height: "36px",
                    }}
                  />
                </Badge>
              </Tooltip>

              {/* Help */}
              <Tooltip title={showTooltips ? "Trợ giúp và hướng dẫn" : ""}>
                <Button
                  icon={<QuestionCircleOutlined />}
                  onClick={onHelp}
                  type="text"
                  style={{
                    color: "white",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    height: "36px",
                  }}
                />
              </Tooltip>

              {/* Settings */}
              <Tooltip title={showTooltips ? "Cài đặt xuất video" : ""}>
                <Button
                  icon={<SettingOutlined />}
                  onClick={onSettings}
                  type="text"
                  style={{
                    color: "white",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    height: "36px",
                  }}
                />
              </Tooltip>
            </div>
          </div>

          {/* Bottom Progress Bar for Export */}
          {isExporting && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3"
            >
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Đang xuất video...</span>
                <span>{Math.round(exportProgress)}%</span>
              </div>
              <Progress
                percent={exportProgress}
                showInfo={false}
                strokeColor="rgba(255,255,255,0.9)"
                trailColor="rgba(255,255,255,0.2)"
                strokeWidth={6}
              />
            </motion.div>
          )}
        </div>

        {/* Animated Background Elements */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-4 right-20 w-24 h-24 rounded-full bg-white/5 backdrop-blur-sm"
          style={{ filter: "blur(2px)" }}
        />

        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-2 left-32 w-16 h-16 rounded-full bg-white/5 backdrop-blur-sm"
          style={{ filter: "blur(2px)" }}
        />
      </motion.header>
    );
  },
);

MergeVideoHeader.displayName = "MergeVideoHeader";

export default MergeVideoHeader;

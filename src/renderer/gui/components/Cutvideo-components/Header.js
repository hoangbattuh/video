import React, { memo } from "react";
import { motion } from "framer-motion";
import {
  Button,
  Space,
  Typography,
  Tooltip,
  Badge,
  Dropdown,
  Menu,
  Progress,
} from "antd";
import {
  ScissorOutlined,
  FileAddOutlined,
  FolderOpenOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  BulbOutlined,
  BgColorsOutlined,
  SaveOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import PropTypes from "prop-types";

const { Title, Text } = Typography;

const Header = memo(
  ({
    theme,
    selectFile,
    selectSaveDirectory,
    setShowSettings,
    setShowShortcuts,
    toggleTheme,
    showTooltips,
    videoInfo,
    processingStats,
  }) => {
    // Theme menu
    const themeMenu = [
      {
        key: "light",
        icon: <BulbOutlined />,
        label: "Sáng",
        style: {
          background: theme === "light" ? "#f0f0f0" : "transparent",
        },
        onClick: () => {
          if (theme !== "light") toggleTheme();
        },
      },
      {
        key: "dark",
        icon: <BgColorsOutlined />,
        label: "Tối",
        style: {
          background: theme === "dark" ? "#f0f0f0" : "transparent",
        },
        onClick: () => {
          if (theme !== "dark") toggleTheme();
        },
      },
    ];

    // Calculate header stats
    const hasVideo = !!videoInfo?.selectedFile;
    const cutDuration = hasVideo ? videoInfo.cutEnd - videoInfo.cutStart : 0;

    return (
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "20px 24px",
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
            {/* Left Section - Title and Info */}
            <div className="flex items-center space-x-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-3"
              >
                <div className="relative">
                  <ScissorOutlined
                    style={{
                      fontSize: "2.5rem",
                      color: "white",
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                    }}
                  />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
                  />
                </div>

                <div>
                  <Title
                    level={2}
                    style={{
                      color: "white",
                      margin: 0,
                      fontWeight: 700,
                      textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                    }}
                  >
                    Video Cutter Pro
                  </Title>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.9)",
                      fontSize: "0.9rem",
                      textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                    }}
                  >
                    Công cụ cắt video chuyên nghiệp
                  </Text>
                </div>
              </motion.div>

              {/* Video Stats */}
              {hasVideo && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="hidden lg:flex items-center space-x-4 ml-8"
                >
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
                    <div className="flex items-center space-x-2">
                      <InfoCircleOutlined
                        style={{ color: "rgba(255,255,255,0.8)" }}
                      />
                      <div>
                        <Text
                          style={{
                            color: "white",
                            fontSize: "0.8rem",
                            display: "block",
                          }}
                        >
                          Đoạn cắt: <strong>{cutDuration.toFixed(1)}s</strong>
                        </Text>
                        <Text
                          style={{
                            color: "rgba(255,255,255,0.7)",
                            fontSize: "0.7rem",
                          }}
                        >
                          {videoInfo.selectedFile.name.slice(0, 20)}...
                        </Text>
                      </div>
                    </div>
                  </div>

                  {processingStats?.startTime && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
                      <div className="flex items-center space-x-2">
                        <ClockCircleOutlined
                          style={{ color: "rgba(255,255,255,0.8)" }}
                        />
                        <div>
                          <Text
                            style={{
                              color: "white",
                              fontSize: "0.8rem",
                              display: "block",
                            }}
                          >
                            Đang xử lý...
                          </Text>
                          <Text
                            style={{
                              color: "rgba(255,255,255,0.7)",
                              fontSize: "0.7rem",
                            }}
                          >
                            {(
                              (Date.now() - processingStats.startTime) /
                              1000
                            ).toFixed(0)}
                            s
                          </Text>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Right Section - Action Buttons */}
            <div className="flex items-center space-x-3">
              {/* Quick Actions */}
              <Space.Compact>
                <Tooltip title={showTooltips ? "Chọn video để cắt" : ""}>
                  <Button
                    icon={<FileAddOutlined />}
                    onClick={selectFile}
                    type="primary"
                    ghost
                    style={{
                      borderColor: "rgba(255,255,255,0.5)",
                      color: "white",
                      background: "rgba(255,255,255,0.1)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <span className="hidden sm:inline">Chọn Video</span>
                  </Button>
                </Tooltip>

                <Tooltip title={showTooltips ? "Chọn thư mục lưu" : ""}>
                  <Button
                    icon={<FolderOpenOutlined />}
                    onClick={selectSaveDirectory}
                    type="primary"
                    ghost
                    style={{
                      borderColor: "rgba(255,255,255,0.5)",
                      color: "white",
                      background: "rgba(255,255,255,0.1)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <span className="hidden sm:inline">Thư mục</span>
                  </Button>
                </Tooltip>
              </Space.Compact>

              {/* Settings and Utils */}
              <Space>
                {/* Theme Switcher */}
                <Tooltip title={showTooltips ? "Chuyển đổi giao diện" : ""}>
                  <Dropdown
                    overlay={themeMenu}
                    trigger={["click"]}
                    placement="bottomRight"
                  >
                    <Button
                      icon={
                        theme === "dark" ? (
                          <BulbOutlined />
                        ) : (
                          <BgColorsOutlined />
                        )
                      }
                      type="text"
                      style={{
                        color: "white",
                        background: "rgba(255,255,255,0.1)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.2)",
                      }}
                    />
                  </Dropdown>
                </Tooltip>

                {/* Help */}
                <Tooltip title={showTooltips ? "Phím tắt và hướng dẫn" : ""}>
                  <Badge dot={false}>
                    <Button
                      icon={<QuestionCircleOutlined />}
                      onClick={() => setShowShortcuts(true)}
                      type="text"
                      style={{
                        color: "white",
                        background: "rgba(255,255,255,0.1)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.2)",
                      }}
                    />
                  </Badge>
                </Tooltip>

                {/* Settings */}
                <Tooltip title={showTooltips ? "Cài đặt ứng dụng" : ""}>
                  <Button
                    icon={<SettingOutlined />}
                    onClick={() => setShowSettings(true)}
                    type="text"
                    style={{
                      color: "white",
                      background: "rgba(255,255,255,0.1)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
                  />
                </Tooltip>
              </Space>
            </div>
          </div>

          {/* Bottom Info Bar */}
          {hasVideo && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4 pt-4 border-t border-white/20"
            >
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <ThunderboltOutlined
                      style={{ color: "rgba(255,255,255,0.8)" }}
                    />
                    <span>
                      Sẵn sàng để cắt từ{" "}
                      <strong>{videoInfo.cutStart.toFixed(1)}s</strong> đến{" "}
                      <strong>{videoInfo.cutEnd.toFixed(1)}s</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div style={{ color: "rgba(255,255,255,0.8)" }}>
                    Kích thước:{" "}
                    {(videoInfo.selectedFile.size / (1024 * 1024)).toFixed(1)}{" "}
                    MB
                  </div>
                  {videoInfo.mode && (
                    <div style={{ color: "rgba(255,255,255,0.8)" }}>
                      Chế độ:{" "}
                      <strong>
                        {videoInfo.mode === "manual" ? "Thủ công" : "Chia đoạn"}
                      </strong>
                    </div>
                  )}
                </div>
              </div>
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
          className="absolute top-4 right-20 w-32 h-32 rounded-full bg-white/5 backdrop-blur-sm"
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
          className="absolute bottom-4 left-32 w-20 h-20 rounded-full bg-white/5 backdrop-blur-sm"
          style={{ filter: "blur(2px)" }}
        />
      </motion.header>
    );
  },
);

Header.propTypes = {
  theme: PropTypes.string.isRequired,
  selectFile: PropTypes.func.isRequired,
  selectSaveDirectory: PropTypes.func.isRequired,
  setShowSettings: PropTypes.func.isRequired,
  setShowShortcuts: PropTypes.func.isRequired,
  toggleTheme: PropTypes.func.isRequired,
  showTooltips: PropTypes.bool.isRequired,
  videoInfo: PropTypes.object,
  processingStats: PropTypes.object,
};

Header.defaultProps = {
  videoInfo: null,
  processingStats: null,
};

Header.displayName = "Header";

export default Header;

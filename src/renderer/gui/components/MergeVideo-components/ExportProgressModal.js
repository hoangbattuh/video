import React from "react";
import {
  Modal,
  Progress,
  Typography,
  Space,
  Card,
  Row,
  Col,
  Button,
} from "antd";
import { motion } from "framer-motion";
import {
  LoadingOutlined,
  VideoCameraOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  FileDoneOutlined,
  CloseOutlined,
  FileAddOutlined,
} from "@ant-design/icons";
import { formatTime } from "../../utils/formatTime";

const { Title, Text } = Typography;

const ExportProgressModal = ({
  visible,
  progress,
  theme,
  exportSettings,
  onCancel,
  estimatedTime,
  processingSpeed,
  currentStage = "processing",
}) => {
  const progressColor =
    progress < 30 ? "#ff4757" : progress < 70 ? "#ffa502" : "#2ed573";

  const stages = [
    { name: "Chuẩn bị", icon: <FileAddOutlined />, threshold: 5 },
    { name: "Xử lý video", icon: <VideoCameraOutlined />, threshold: 30 },
    { name: "Ghép nối", icon: <LoadingOutlined />, threshold: 80 },
    { name: "Hoàn tất", icon: <CheckCircleOutlined />, threshold: 100 },
  ];

  const getCurrentStage = () => {
    return (
      stages.find((stage) => progress < stage.threshold) ||
      stages[stages.length - 1]
    );
  };

  const currentStageInfo = getCurrentStage();

  return (
    <Modal
      open={visible}
      footer={null}
      closable={false}
      centered
      maskClosable={false}
      width={560}
      styles={{
        content: {
          background: theme === "dark" ? "#1f1f1f" : "#ffffff",
          borderRadius: "16px",
          padding: 0,
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "24px",
          color: "white",
          textAlign: "center",
          position: "relative",
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{ display: "inline-block", marginBottom: "16px" }}
        >
          <VideoCameraOutlined style={{ fontSize: "2.5rem" }} />
        </motion.div>

        <Title level={3} style={{ color: "white", margin: 0 }}>
          Đang ghép video...
        </Title>
        <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "1rem" }}>
          {currentStageInfo.name} - {Math.round(progress)}% hoàn thành
        </Text>

        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={onCancel}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            color: "white",
            border: "1px solid rgba(255,255,255,0.3)",
          }}
          size="small"
        >
          Hủy
        </Button>
      </div>

      <div style={{ padding: "32px" }}>
        {/* Main Progress Circle */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <Progress
            type="circle"
            size={140}
            percent={Math.round(progress)}
            strokeColor={{
              "0%": progressColor,
              "100%": progress > 90 ? "#2ed573" : progressColor,
            }}
            strokeWidth={6}
            format={(percent) => (
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: "bold",
                    color: theme === "dark" ? "#fff" : "#333",
                  }}
                >
                  {percent}%
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: progressColor,
                    marginTop: "4px",
                  }}
                >
                  {currentStageInfo.name}
                </div>
              </div>
            )}
          />
        </div>

        {/* Linear Progress */}
        <Progress
          percent={progress}
          strokeColor={progressColor}
          trailColor={theme === "dark" ? "#333" : "#f0f0f0"}
          strokeWidth={8}
          style={{ marginBottom: "24px" }}
        />

        {/* Stats Row */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col span={8}>
            <Card
              size="small"
              style={{
                textAlign: "center",
                background: theme === "dark" ? "#2a2a2a" : "#f8f9fa",
                border: `1px solid ${theme === "dark" ? "#444" : "#e9ecef"}`,
              }}
            >
              <ClockCircleOutlined
                style={{
                  fontSize: "1.2rem",
                  color: "#667eea",
                  marginBottom: "8px",
                }}
              />
              <Text
                strong
                style={{
                  display: "block",
                  color: theme === "dark" ? "#fff" : "#333",
                  marginBottom: "4px",
                }}
              >
                Thời gian
              </Text>
              <Text style={{ color: theme === "dark" ? "#ccc" : "#666" }}>
                {estimatedTime ? formatTime(estimatedTime) : "--:--"}
              </Text>
            </Card>
          </Col>

          <Col span={8}>
            <Card
              size="small"
              style={{
                textAlign: "center",
                background: theme === "dark" ? "#2a2a2a" : "#f8f9fa",
                border: `1px solid ${theme === "dark" ? "#444" : "#e9ecef"}`,
              }}
            >
              <ThunderboltOutlined
                style={{
                  fontSize: "1.2rem",
                  color: "#ffa502",
                  marginBottom: "8px",
                }}
              />
              <Text
                strong
                style={{
                  display: "block",
                  color: theme === "dark" ? "#fff" : "#333",
                  marginBottom: "4px",
                }}
              >
                Tốc độ
              </Text>
              <Text style={{ color: theme === "dark" ? "#ccc" : "#666" }}>
                {processingSpeed
                  ? `${processingSpeed.toFixed(1)}%/s`
                  : "Đang tính..."}
              </Text>
            </Card>
          </Col>

          <Col span={8}>
            <Card
              size="small"
              style={{
                textAlign: "center",
                background: theme === "dark" ? "#2a2a2a" : "#f8f9fa",
                border: `1px solid ${theme === "dark" ? "#444" : "#e9ecef"}`,
              }}
            >
              <FileDoneOutlined
                style={{
                  fontSize: "1.2rem",
                  color: "#52c41a",
                  marginBottom: "8px",
                }}
              />
              <Text
                strong
                style={{
                  display: "block",
                  color: theme === "dark" ? "#fff" : "#333",
                  marginBottom: "4px",
                }}
              >
                Định dạng
              </Text>
              <Text style={{ color: theme === "dark" ? "#ccc" : "#666" }}>
                {exportSettings?.outputFormat?.toUpperCase() || "MP4"}
              </Text>
            </Card>
          </Col>
        </Row>

        {/* Export Settings Summary */}
        <Card
          size="small"
          title="Cài đặt xuất"
          style={{
            marginBottom: "24px",
            background: theme === "dark" ? "#2a2a2a" : "#f8f9fa",
            border: `1px solid ${theme === "dark" ? "#444" : "#e9ecef"}`,
          }}
        >
          <Row gutter={[12, 8]}>
            <Col span={12}>
              <Text type="secondary">Độ phân giải:</Text>
              <div style={{ color: theme === "dark" ? "#ccc" : "#666" }}>
                {exportSettings?.resolution || "1920x1080"}
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary">Chất lượng:</Text>
              <div style={{ color: theme === "dark" ? "#ccc" : "#666" }}>
                {exportSettings?.quality || "Cao"}
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary">FPS:</Text>
              <div style={{ color: theme === "dark" ? "#ccc" : "#666" }}>
                {exportSettings?.fps || 30}
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary">Bitrate:</Text>
              <div style={{ color: theme === "dark" ? "#ccc" : "#666" }}>
                {exportSettings?.videoBitrate || 8000} kbps
              </div>
            </Col>
          </Row>
        </Card>

        {/* Processing Stages */}
        <div>
          <Text
            strong
            style={{
              display: "block",
              marginBottom: "16px",
              color: theme === "dark" ? "#fff" : "#333",
            }}
          >
            Tiến trình xử lý:
          </Text>

          <Space direction="vertical" style={{ width: "100%" }}>
            {stages.map((stage, index) => {
              const isCompleted = progress >= stage.threshold;
              const isCurrent = currentStageInfo.name === stage.name;

              return (
                <motion.div
                  key={stage.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    background: isCurrent
                      ? "rgba(102, 126, 234, 0.1)"
                      : isCompleted
                        ? "rgba(46, 213, 115, 0.1)"
                        : "transparent",
                    border: `1px solid ${
                      isCurrent
                        ? "rgba(102, 126, 234, 0.3)"
                        : isCompleted
                          ? "rgba(46, 213, 115, 0.3)"
                          : "transparent"
                    }`,
                    transition: "all 0.3s ease",
                  }}
                >
                  <div
                    style={{
                      color: isCompleted
                        ? "#2ed573"
                        : isCurrent
                          ? "#667eea"
                          : "#ccc",
                      fontSize: "1.2rem",
                    }}
                  >
                    {React.cloneElement(stage.icon, {
                      spin: isCurrent && stage.name !== "Hoàn tất",
                    })}
                  </div>

                  <div style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: isCompleted
                          ? theme === "dark"
                            ? "#2ed573"
                            : "#2ed573"
                          : isCurrent
                            ? theme === "dark"
                              ? "#667eea"
                              : "#667eea"
                            : theme === "dark"
                              ? "#666"
                              : "#ccc",
                        fontWeight: isCurrent ? 600 : 400,
                      }}
                    >
                      {stage.name}
                    </Text>
                  </div>

                  {isCompleted && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <CheckCircleOutlined style={{ color: "#2ed573" }} />
                    </motion.div>
                  )}

                  {isCurrent && !isCompleted && (
                    <div
                      style={{
                        width: "60px",
                        textAlign: "right",
                        color: "#667eea",
                        fontSize: "0.8rem",
                      }}
                    >
                      {Math.round(progress)}%
                    </div>
                  )}
                </motion.div>
              );
            })}
          </Space>
        </div>

        {/* Tips */}
        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            background: "rgba(102, 126, 234, 0.05)",
            borderRadius: "8px",
            border: "1px solid rgba(102, 126, 234, 0.2)",
          }}
        >
          <Text
            style={{
              fontSize: "0.85rem",
              color: theme === "dark" ? "#ccc" : "#666",
              fontStyle: "italic",
            }}
          >
            💡 <strong>Mẹo:</strong> Thời gian xử lý phụ thuộc vào số lượng
            video, độ phân giải và chất lượng xuất. Bạn có thể hủy quá trình bất
            cứ lúc nào.
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default ExportProgressModal;

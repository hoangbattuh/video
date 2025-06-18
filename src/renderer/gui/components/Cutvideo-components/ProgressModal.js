import React from "react";
import { Modal, Progress, Typography, Space, Card, Row, Col } from "antd";
import { motion } from "framer-motion";
import {
  LoadingOutlined,
  ScissorOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import PropTypes from "prop-types";

const { Title, Text } = Typography;

const ProgressModal = ({
  showProgressModal,
  theme,
  progress,
  processing,
  videoInfo,
  processingStats,
  formatTime,
}) => {
  const progressColor =
    progress < 30 ? "#ff4757" : progress < 70 ? "#ffa502" : "#2ed573";

  const estimatedRemaining = processingStats?.estimatedTime
    ? Math.max(0, processingStats.estimatedTime)
    : null;

  const processingSpeed = processingStats?.speed || 0;

  return (
    <Modal
      open={showProgressModal}
      footer={null}
      closable={false}
      centered
      maskClosable={false}
      className="progress-modal"
      width={480}
      styles={{
        content: {
          background: theme === "dark" ? "#1f1f1f" : "#ffffff",
          borderRadius: "16px",
          padding: 0,
          overflow: "hidden",
        },
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "24px",
          color: "white",
          textAlign: "center",
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{ display: "inline-block", marginBottom: "16px" }}
        >
          <ScissorOutlined style={{ fontSize: "2.5rem" }} />
        </motion.div>

        <Title level={3} style={{ color: "white", margin: 0 }}>
          Đang cắt video...
        </Title>
        <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "1rem" }}>
          Vui lòng đợi trong khi chúng tôi xử lý video của bạn
        </Text>
      </div>

      <div style={{ padding: "32px" }}>
        {/* Main Progress */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <Progress
            type="circle"
            size={120}
            percent={Math.round(progress)}
            strokeColor={{
              "0%": progressColor,
              "100%": progress > 90 ? "#2ed573" : progressColor,
            }}
            strokeWidth={8}
            format={(percent) => (
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: theme === "dark" ? "#fff" : "#333",
                  }}
                >
                  {percent}%
                </div>
                {processing && (
                  <LoadingOutlined
                    style={{
                      fontSize: "1rem",
                      color: progressColor,
                      marginTop: "4px",
                    }}
                  />
                )}
              </div>
            )}
          />
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: "24px" }}>
          <Progress
            percent={progress}
            strokeColor={progressColor}
            trailColor={theme === "dark" ? "#333" : "#f0f0f0"}
            strokeWidth={12}
            style={{ marginBottom: "8px" }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.9rem",
              color: theme === "dark" ? "#ccc" : "#666",
            }}
          >
            <span>{Math.round(progress)}% hoàn thành</span>
            <span>
              {estimatedRemaining
                ? `~${formatTime(estimatedRemaining)} còn lại`
                : "Đang tính toán..."}
            </span>
          </div>
        </div>

        {/* Processing Stats */}
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card
              size="small"
              style={{
                textAlign: "center",
                background: theme === "dark" ? "#2a2a2a" : "#f8f9fa",
                border: `1px solid ${theme === "dark" ? "#444" : "#e9ecef"}`,
              }}
            >
              <div style={{ marginBottom: "8px" }}>
                <ClockCircleOutlined
                  style={{
                    fontSize: "1.2rem",
                    color: "#667eea",
                    marginBottom: "4px",
                  }}
                />
              </div>
              <Text
                strong
                style={{
                  display: "block",
                  color: theme === "dark" ? "#fff" : "#333",
                  marginBottom: "4px",
                }}
              >
                Thời gian đã qua
              </Text>
              <Text style={{ color: theme === "dark" ? "#ccc" : "#666" }}>
                {processingStats?.startTime
                  ? formatTime((Date.now() - processingStats.startTime) / 1000)
                  : "00:00"}
              </Text>
            </Card>
          </Col>

          <Col span={12}>
            <Card
              size="small"
              style={{
                textAlign: "center",
                background: theme === "dark" ? "#2a2a2a" : "#f8f9fa",
                border: `1px solid ${theme === "dark" ? "#444" : "#e9ecef"}`,
              }}
            >
              <div style={{ marginBottom: "8px" }}>
                <ThunderboltOutlined
                  style={{
                    fontSize: "1.2rem",
                    color: "#ffa502",
                    marginBottom: "4px",
                  }}
                />
              </div>
              <Text
                strong
                style={{
                  display: "block",
                  color: theme === "dark" ? "#fff" : "#333",
                  marginBottom: "4px",
                }}
              >
                Tốc độ xử lý
              </Text>
              <Text style={{ color: theme === "dark" ? "#ccc" : "#666" }}>
                {processingSpeed > 0
                  ? `${processingSpeed.toFixed(1)}%/s`
                  : "Đang tính..."}
              </Text>
            </Card>
          </Col>
        </Row>

        {/* Video Info */}
        {videoInfo?.selectedFile && (
          <Card
            size="small"
            style={{
              marginTop: "16px",
              background: theme === "dark" ? "#2a2a2a" : "#f8f9fa",
              border: `1px solid ${theme === "dark" ? "#444" : "#e9ecef"}`,
            }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <FileImageOutlined style={{ color: "#667eea" }} />
                <Text
                  strong
                  style={{ color: theme === "dark" ? "#fff" : "#333" }}
                >
                  Thông tin video
                </Text>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                  fontSize: "0.85rem",
                }}
              >
                <div>
                  <Text type="secondary">Tên file:</Text>
                  <div
                    style={{
                      color: theme === "dark" ? "#ccc" : "#666",
                      wordBreak: "break-all",
                      fontSize: "0.8rem",
                    }}
                  >
                    {videoInfo.selectedFile.name}
                  </div>
                </div>

                <div>
                  <Text type="secondary">Kích thước:</Text>
                  <div style={{ color: theme === "dark" ? "#ccc" : "#666" }}>
                    {(videoInfo.selectedFile.size / (1024 * 1024)).toFixed(1)}{" "}
                    MB
                  </div>
                </div>

                <div>
                  <Text type="secondary">Từ:</Text>
                  <div style={{ color: theme === "dark" ? "#ccc" : "#666" }}>
                    {formatTime(videoInfo.cutStart)}
                  </div>
                </div>

                <div>
                  <Text type="secondary">Đến:</Text>
                  <div style={{ color: theme === "dark" ? "#ccc" : "#666" }}>
                    {formatTime(videoInfo.cutEnd)}
                  </div>
                </div>
              </div>
            </Space>
          </Card>
        )}

        {/* Processing Stages */}
        <div style={{ marginTop: "16px" }}>
          <Text
            strong
            style={{
              display: "block",
              marginBottom: "12px",
              color: theme === "dark" ? "#fff" : "#333",
            }}
          >
            Tiến trình xử lý:
          </Text>

          <Space direction="vertical" style={{ width: "100%" }}>
            {[
              {
                stage: "Phân tích video",
                threshold: 10,
                icon: <FileImageOutlined />,
              },
              {
                stage: "Xử lý dữ liệu",
                threshold: 30,
                icon: <LoadingOutlined />,
              },
              { stage: "Cắt video", threshold: 80, icon: <ScissorOutlined /> },
              {
                stage: "Hoàn thiện",
                threshold: 100,
                icon: <CheckCircleOutlined />,
              },
            ].map((item, index) => {
              const isActive = progress >= item.threshold;
              const isCurrent =
                progress >= (index > 0 ? [10, 30, 80, 100][index - 1] : 0) &&
                progress < item.threshold;

              return (
                <motion.div
                  key={item.stage}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    background: isCurrent
                      ? "rgba(102, 126, 234, 0.1)"
                      : isActive
                        ? "rgba(46, 213, 115, 0.1)"
                        : "transparent",
                    border: `1px solid ${
                      isCurrent
                        ? "rgba(102, 126, 234, 0.3)"
                        : isActive
                          ? "rgba(46, 213, 115, 0.3)"
                          : "transparent"
                    }`,
                    transition: "all 0.3s ease",
                  }}
                >
                  <div
                    style={{
                      color: isActive
                        ? "#2ed573"
                        : isCurrent
                          ? "#667eea"
                          : "#ccc",
                      fontSize: "1rem",
                    }}
                  >
                    {React.cloneElement(item.icon, {
                      spin: isCurrent && item.stage !== "Hoàn thiện",
                    })}
                  </div>

                  <Text
                    style={{
                      color: isActive
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
                    {item.stage}
                  </Text>

                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{ marginLeft: "auto" }}
                    >
                      <CheckCircleOutlined style={{ color: "#2ed573" }} />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </Space>
        </div>

        {/* Tips */}
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
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
            💡 <strong>Mẹo:</strong> Thời gian xử lý phụ thuộc vào độ phức tạp
            và chất lượng video. Video chất lượng cao sẽ mất nhiều thời gian hơn
            để xử lý.
          </Text>
        </div>
      </div>
    </Modal>
  );
};

ProgressModal.propTypes = {
  showProgressModal: PropTypes.bool.isRequired,
  theme: PropTypes.string.isRequired,
  progress: PropTypes.number.isRequired,
  processing: PropTypes.bool.isRequired,
  videoInfo: PropTypes.object,
  processingStats: PropTypes.object,
  formatTime: PropTypes.func.isRequired,
};

ProgressModal.defaultProps = {
  videoInfo: null,
  processingStats: null,
};

export default ProgressModal;

import React, { useState } from "react";
import { Modal, Tabs, Card, Typography, Space, Tag, Divider } from "antd";
import {
  QuestionCircleOutlined,
  MacCommandOutlined,
  PlayCircleOutlined,
  ToolOutlined,
  BulbOutlined,
  FileOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const HelpModal = ({ visible, onClose, theme, currentMode }) => {
  const [activeTab, setActiveTab] = useState("basics");

  const keyboardShortcuts = [
    { key: "Space", action: "Phát/Tạm dừng video" },
    { key: "←", action: "Lùi 10 giây" },
    { key: "→", action: "Tiến 10 giây" },
    { key: "Shift + ←", action: "Lùi 1 giây" },
    { key: "Shift + →", action: "Tiến 1 giây" },
    { key: "Delete", action: "Xóa clip đã chọn" },
    { key: "Escape", action: "Bỏ chọn clip" },
    { key: "Ctrl + S", action: "Lưu dự án" },
    { key: "Ctrl + E", action: "Xuất video" },
    { key: "Ctrl + Z", action: "Hoàn tác" },
    { key: "Ctrl + Y", action: "Làm lại" },
  ];

  const modeFeatures = {
    beginner: {
      title: "Chế độ Người mới bắt đầu",
      description: "Giao diện đơn giản, dễ sử dụng",
      features: [
        "Giao diện tối giản",
        "Các tùy chọn cơ bản",
        "Hướng dẫn từng bước",
        "Preset chất lượng có sẵn",
      ],
    },
    pro: {
      title: "Chế độ Chuyên nghiệp",
      description: "Nhiều tính năng hơn cho người dùng có kinh nghiệm",
      features: [
        "Hiệu ứng chuyển cảnh",
        "Cài đặt xuất nâng cao",
        "Timeline chi tiết",
        "Điều chỉnh âm thanh",
      ],
    },
    expert: {
      title: "Chế độ Chuyên gia",
      description: "Toàn quyền kiểm soát mọi tính năng",
      features: [
        "Tất cả tính năng Pro",
        "Cài đặt codec chi tiết",
        "Xử lý GPU",
        "Color grading",
        "Multi-track timeline",
      ],
    },
  };

  const tips = [
    {
      title: "Tối ưu hóa hiệu suất",
      content: "Đóng các ứng dụng khác khi xuất video để tăng tốc độ xử lý",
    },
    {
      title: "Chất lượng video",
      content: "Sử dụng bitrate cao hơn cho video có nhiều chuyển động",
    },
    {
      title: "Định dạng tệp",
      content: "MP4 với H.264 có tương thích tốt nhất trên mọi thiết bị",
    },
    {
      title: "Sắp xếp clip",
      content: "Kéo thả clip trên timeline để thay đổi thứ tự",
    },
    {
      title: "Lưu dự án",
      content: "Lưu dự án thường xuyên để tránh mất dữ liệu",
    },
  ];

  const troubleshooting = [
    {
      problem: "Video không phát được",
      solutions: [
        "Kiểm tra định dạng video có được hỗ trợ",
        "Thử làm mới trình phát",
        "Kiểm tra file có bị hỏng không",
      ],
    },
    {
      problem: "Xuất video lâu",
      solutions: [
        "Giảm độ phân giải xuất",
        "Tắt các ứng dụng khác",
        "Sử dụng tăng tốc GPU nếu có",
        "Chọn preset chất lượng thấp hơn",
      ],
    },
    {
      problem: "Âm thanh bị lệch",
      solutions: [
        "Kiểm tra đồng bộ âm thanh",
        "Thử codec âm thanh khác",
        "Điều chỉnh sample rate",
      ],
    },
    {
      problem: "File xuất quá lớn",
      solutions: [
        "Giảm bitrate video",
        "Sử dụng codec H.265",
        "Giảm độ phân giải",
        "Sử dụng mã hóa 2 lần",
      ],
    },
  ];

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      title="Trợ giúp - Video Merger Pro"
      width={900}
      footer={null}
      styles={{
        content: {
          background: theme === "dark" ? "#1f1f1f" : "#ffffff",
        },
      }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "basics",
            label: (
              <span>
                <PlayCircleOutlined />
                Cơ bản
              </span>
            ),
            children: (
              <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
                <Card title="Bắt đầu nhanh" style={{ marginBottom: 16 }}>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div>
                      <Title level={5}>1. Thêm video</Title>
                      <Paragraph>
                        Nhấn nút "Nhập Video" hoặc kéo thả file video vào thư
                        viện. Hỗ trợ các định dạng: MP4, AVI, MOV, MKV, WebM.
                      </Paragraph>
                    </div>

                    <div>
                      <Title level={5}>2. Sắp xếp video</Title>
                      <Paragraph>
                        Kéo video từ thư viện vào timeline theo thứ tự bạn muốn
                        ghép. Bạn có thể thay đổi thứ tự bằng cách kéo thả trên
                        timeline.
                      </Paragraph>
                    </div>

                    <div>
                      <Title level={5}>3. Xem trước</Title>
                      <Paragraph>
                        Nhấn "Xem trước" để kiểm tra kết quả trước khi xuất. Sử
                        dụng các điều khiển phát để điều hướng.
                      </Paragraph>
                    </div>

                    <div>
                      <Title level={5}>4. Cài đặt xuất</Title>
                      <Paragraph>
                        Chọn chất lượng, định dạng và cài đặt xuất phù hợp. Với
                        người mới, chọn preset "Cao" cho chất lượng tốt.
                      </Paragraph>
                    </div>

                    <div>
                      <Title level={5}>5. Xuất video</Title>
                      <Paragraph>
                        Nhấn "Xuất Video" và chờ quá trình hoàn tất. Video sẽ
                        được lưu vào thư mục bạn đã chọn.
                      </Paragraph>
                    </div>
                  </Space>
                </Card>

                <Card title="Chế độ sử dụng">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    {Object.entries(modeFeatures).map(([mode, info]) => (
                      <div key={mode}>
                        <Title level={5}>
                          {info.title}
                          {currentMode === mode && (
                            <Tag color="blue" style={{ marginLeft: 8 }}>
                              Hiện tại
                            </Tag>
                          )}
                        </Title>
                        <Paragraph>{info.description}</Paragraph>
                        <div>
                          {info.features.map((feature, index) => (
                            <Tag
                              key={index}
                              style={{ margin: "2px 4px 2px 0" }}
                            >
                              {feature}
                            </Tag>
                          ))}
                        </div>
                        {mode !== "expert" && <Divider />}
                      </div>
                    ))}
                  </Space>
                </Card>
              </div>
            ),
          },
          {
            key: "shortcuts",
            label: (
              <span>
                <MacCommandOutlined />
                Phím tắt
              </span>
            ),
            children: (
              <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
                <Card title="Phím tắt hữu ích">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(300px, 1fr))",
                      gap: 16,
                    }}
                  >
                    {keyboardShortcuts.map((shortcut, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 12px",
                          background: theme === "dark" ? "#2a2a2a" : "#f5f5f5",
                          borderRadius: "6px",
                        }}
                      >
                        <span>{shortcut.action}</span>
                        <Tag style={{ fontFamily: "monospace" }}>
                          {shortcut.key}
                        </Tag>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            ),
          },
          {
            key: "tips",
            label: (
              <span>
                <BulbOutlined />
                Mẹo hay
              </span>
            ),
            children: (
              <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  {tips.map((tip, index) => (
                    <Card key={index} size="small" title={tip.title}>
                      <Paragraph>{tip.content}</Paragraph>
                    </Card>
                  ))}
                </Space>
              </div>
            ),
          },
          {
            key: "troubleshooting",
            label: (
              <span>
                <ToolOutlined />
                Xử lý sự cố
              </span>
            ),
            children: (
              <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  {troubleshooting.map((item, index) => (
                    <Card key={index} size="small" title={`❓ ${item.problem}`}>
                      <div>
                        <Text strong>Giải pháp:</Text>
                        <ul style={{ marginTop: 8, marginBottom: 0 }}>
                          {item.solutions.map((solution, sIndex) => (
                            <li key={sIndex} style={{ marginBottom: 4 }}>
                              {solution}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Card>
                  ))}
                </Space>
              </div>
            ),
          },
          {
            key: "formats",
            label: (
              <span>
                <FileOutlined />
                Định dạng
              </span>
            ),
            children: (
              <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
                <Card
                  title="Định dạng được hỗ trợ"
                  style={{ marginBottom: 16 }}
                >
                  <Title level={5}>Định dạng đầu vào:</Title>
                  <div style={{ marginBottom: 16 }}>
                    <Tag color="blue">MP4</Tag>
                    <Tag color="green">AVI</Tag>
                    <Tag color="purple">MOV</Tag>
                    <Tag color="orange">MKV</Tag>
                    <Tag color="cyan">WebM</Tag>
                    <Tag color="red">FLV</Tag>
                    <Tag color="gold">WMV</Tag>
                    <Tag color="lime">3GP</Tag>
                  </div>

                  <Title level={5}>Định dạng đầu ra:</Title>
                  <div>
                    <Tag color="blue">MP4 (Khuyến nghị)</Tag>
                    <Tag color="green">AVI</Tag>
                    <Tag color="purple">MOV</Tag>
                    <Tag color="orange">MKV</Tag>
                    <Tag color="cyan">WebM</Tag>
                  </div>
                </Card>

                <Card title="Khuyến nghị chất lượng">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div>
                      <Title level={5}>🎬 Xem trên TV/Máy tính</Title>
                      <Text>MP4, H.264, 1080p, 8000 kbps</Text>
                    </div>

                    <div>
                      <Title level={5}>📱 Xem trên điện thoại</Title>
                      <Text>MP4, H.264, 720p, 4000 kbps</Text>
                    </div>

                    <div>
                      <Title level={5}>🌐 Đăng lên mạng xã hội</Title>
                      <Text>MP4, H.264, 1080p, 6000 kbps</Text>
                    </div>

                    <div>
                      <Title level={5}>💾 Lưu trữ lâu dài</Title>
                      <Text>MKV, H.265, 1080p, 6000 kbps</Text>
                    </div>
                  </Space>
                </Card>
              </div>
            ),
          },
        ]}
      />
    </Modal>
  );
};

export default HelpModal;

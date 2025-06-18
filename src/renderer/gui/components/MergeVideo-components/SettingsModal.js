import React, { useState } from "react";
import {
  Modal,
  Tabs,
  Card,
  Form,
  Select,
  Slider,
  Switch,
  InputNumber,
  Button,
  Space,
  Divider,
  message,
} from "antd";
import {
  SettingOutlined,
  FileOutlined,
  SoundOutlined,
  ToolOutlined,
  SaveOutlined,
  ReloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { TabPane } = Tabs;

const SettingsModal = ({
  visible,
  onClose,
  theme,
  settings,
  onChange,
  onSave,
  onLoad,
  onReset,
  currentMode,
}) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("video");

  const handleFormChange = (changedFields, allFields) => {
    const newSettings = {};
    allFields.forEach((field) => {
      newSettings[field.name[0]] = field.value;
    });
    onChange(newSettings);
  };

  const handleSavePreset = () => {
    onSave();
    message.success("Đã lưu preset cài đặt");
  };

  const handleLoadPreset = () => {
    onLoad();
    message.success("Đã tải preset cài đặt");
  };

  const handleReset = () => {
    onReset();
    form.setFieldsValue(settings);
    message.success("Đã khôi phục cài đặt mặc định");
  };

  const videoFormats = [
    { value: "mp4", label: "MP4", description: "Tương thích tốt nhất" },
    { value: "avi", label: "AVI", description: "Chất lượng cao" },
    { value: "mov", label: "MOV", description: "Apple format" },
    { value: "mkv", label: "MKV", description: "Hỗ trợ nhiều track" },
    { value: "webm", label: "WebM", description: "Tối ưu cho web" },
  ];

  const videoCodecs = [
    { value: "h264", label: "H.264", description: "Cân bằng tốt" },
    { value: "h265", label: "H.265", description: "Nén tốt hơn" },
    { value: "vp9", label: "VP9", description: "Open source" },
    { value: "av1", label: "AV1", description: "Thế hệ mới" },
  ];

  const audioCodecs = [
    { value: "aac", label: "AAC", description: "Chất lượng tốt" },
    { value: "mp3", label: "MP3", description: "Tương thích cao" },
    { value: "opus", label: "Opus", description: "Hiệu quả" },
    { value: "flac", label: "FLAC", description: "Lossless" },
  ];

  const resolutions = [
    { value: "3840x2160", label: "4K UHD (3840x2160)" },
    { value: "2560x1440", label: "2K QHD (2560x1440)" },
    { value: "1920x1080", label: "Full HD (1920x1080)" },
    { value: "1280x720", label: "HD (1280x720)" },
    { value: "854x480", label: "SD (854x480)" },
    { value: "custom", label: "Tùy chỉnh" },
  ];

  const qualityPresets = [
    { value: "ultra", label: "Cực cao", bitrate: 20000 },
    { value: "high", label: "Cao", bitrate: 8000 },
    { value: "medium", label: "Trung bình", bitrate: 4000 },
    { value: "low", label: "Thấp", bitrate: 2000 },
  ];

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      title="Cài đặt xuất video"
      width={800}
      footer={
        <Space>
          <Button onClick={handleLoadPreset} icon={<UploadOutlined />}>
            Tải preset
          </Button>
          <Button onClick={handleSavePreset} icon={<SaveOutlined />}>
            Lưu preset
          </Button>
          <Button onClick={handleReset} icon={<ReloadOutlined />}>
            Đặt lại
          </Button>
          <Button type="primary" onClick={onClose}>
            Đóng
          </Button>
        </Space>
      }
      styles={{
        content: {
          background: theme === "dark" ? "#1f1f1f" : "#ffffff",
        },
      }}
    >
      <Form
        form={form}
        initialValues={settings}
        onFieldsChange={handleFormChange}
        layout="vertical"
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "video",
              label: (
                <span>
                  <FileOutlined />
                  Video
                </span>
              ),
              children: (
                <Card>
                  <Form.Item name="outputFormat" label="Định dạng xuất">
                    <Select>
                      {videoFormats.map((format) => (
                        <Option key={format.value} value={format.value}>
                          <div>
                            <strong>{format.label}</strong>
                            <div style={{ fontSize: "0.8rem", color: "#666" }}>
                              {format.description}
                            </div>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item name="resolution" label="Độ phân giải">
                    <Select>
                      {resolutions.map((res) => (
                        <Option key={res.value} value={res.value}>
                          {res.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item name="quality" label="Chất lượng">
                    <Select>
                      {qualityPresets.map((preset) => (
                        <Option key={preset.value} value={preset.value}>
                          <div>
                            <strong>{preset.label}</strong>
                            <div style={{ fontSize: "0.8rem", color: "#666" }}>
                              {preset.bitrate} kbps
                            </div>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item name="fps" label="Tốc độ khung hình (FPS)">
                    <Select>
                      <Option value={24}>24 FPS (Cinema)</Option>
                      <Option value={25}>25 FPS (PAL)</Option>
                      <Option value={30}>30 FPS (NTSC)</Option>
                      <Option value={50}>50 FPS (PAL Progressive)</Option>
                      <Option value={60}>60 FPS (Smooth)</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item name="videoBitrate" label="Bitrate video (kbps)">
                    <Slider
                      min={1000}
                      max={50000}
                      step={500}
                      marks={{
                        1000: "1M",
                        5000: "5M",
                        10000: "10M",
                        20000: "20M",
                        50000: "50M",
                      }}
                    />
                  </Form.Item>

                  {currentMode !== "beginner" && (
                    <>
                      <Form.Item name="videoCodec" label="Codec video">
                        <Select>
                          {videoCodecs.map((codec) => (
                            <Option key={codec.value} value={codec.value}>
                              <div>
                                <strong>{codec.label}</strong>
                                <div
                                  style={{ fontSize: "0.8rem", color: "#666" }}
                                >
                                  {codec.description}
                                </div>
                              </div>
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item name="twoPass" valuePropName="checked">
                        <Switch /> Mã hóa 2 lần (chậm hơn nhưng chất lượng tốt
                        hơn)
                      </Form.Item>
                    </>
                  )}
                </Card>
              ),
            },
            {
              key: "audio",
              label: (
                <span>
                  <SoundOutlined />
                  Âm thanh
                </span>
              ),
              children: (
                <Card>
                  <Form.Item name="audioCodec" label="Codec âm thanh">
                    <Select>
                      {audioCodecs.map((codec) => (
                        <Option key={codec.value} value={codec.value}>
                          <div>
                            <strong>{codec.label}</strong>
                            <div style={{ fontSize: "0.8rem", color: "#666" }}>
                              {codec.description}
                            </div>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="audioBitrate"
                    label="Bitrate âm thanh (kbps)"
                  >
                    <Select>
                      <Option value={96}>96 kbps (Thấp)</Option>
                      <Option value={128}>128 kbps (Chuẩn)</Option>
                      <Option value={192}>192 kbps (Cao)</Option>
                      <Option value={320}>320 kbps (Rất cao)</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item name="sampleRate" label="Tần số mẫu (Hz)">
                    <Select>
                      <Option value={22050}>22.05 kHz</Option>
                      <Option value={44100}>44.1 kHz (CD Quality)</Option>
                      <Option value={48000}>48 kHz (Professional)</Option>
                      <Option value={96000}>96 kHz (Hi-Res)</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item name="normalizeAudio" valuePropName="checked">
                    <Switch /> Chuẩn hóa âm lượng
                  </Form.Item>

                  {currentMode === "expert" && (
                    <Form.Item name="audioChannels" label="Số kênh âm thanh">
                      <Select>
                        <Option value={1}>Mono (1 kênh)</Option>
                        <Option value={2}>Stereo (2 kênh)</Option>
                        <Option value={6}>5.1 Surround (6 kênh)</Option>
                        <Option value={8}>7.1 Surround (8 kênh)</Option>
                      </Select>
                    </Form.Item>
                  )}
                </Card>
              ),
            },
            {
              key: "advanced",
              label: (
                <span>
                  <ToolOutlined />
                  Nâng cao
                </span>
              ),
              children:
                currentMode === "beginner" ? (
                  <Card>
                    <div
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "#999",
                      }}
                    >
                      <ToolOutlined
                        style={{ fontSize: "3rem", marginBottom: "16px" }}
                      />
                      <h3>Chế độ nâng cao</h3>
                      <p>
                        Các tùy chọn nâng cao chỉ khả dụng ở chế độ Chuyên
                        nghiệp và Chuyên gia
                      </p>
                    </div>
                  </Card>
                ) : (
                  <Card>
                    <Form.Item name="threads" label="Số luồng xử lý">
                      <InputNumber min={1} max={16} />
                    </Form.Item>

                    <Form.Item name="gpuAcceleration" label="Tăng tốc GPU">
                      <Select>
                        <Option value="none">Không sử dụng</Option>
                        <Option value="nvidia">NVIDIA NVENC</Option>
                        <Option value="amd">AMD VCE</Option>
                        <Option value="intel">Intel Quick Sync</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item name="rateControl" label="Kiểm soát bitrate">
                      <Select>
                        <Option value="cbr">CBR (Constant)</Option>
                        <Option value="vbr">VBR (Variable)</Option>
                        <Option value="crf">CRF (Quality-based)</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item name="crfValue" label="Giá trị CRF (0-51)">
                      <Slider
                        min={0}
                        max={51}
                        marks={{
                          0: "Lossless",
                          18: "Rất cao",
                          23: "Cao",
                          28: "Trung bình",
                          35: "Thấp",
                          51: "Rất thấp",
                        }}
                      />
                    </Form.Item>

                    <Divider />

                    <Form.Item name="fastStart" valuePropName="checked">
                      <Switch /> Fast start (tối ưu cho streaming)
                    </Form.Item>

                    <Form.Item name="deinterlace" valuePropName="checked">
                      <Switch /> Khử xen kẽ (deinterlace)
                    </Form.Item>

                    <Form.Item name="denoise" valuePropName="checked">
                      <Switch /> Giảm nhiễu
                    </Form.Item>

                    {currentMode === "expert" && (
                      <>
                        <Form.Item name="colorSpace" label="Không gian màu">
                          <Select>
                            <Option value="bt709">BT.709 (HD)</Option>
                            <Option value="bt2020">BT.2020 (4K)</Option>
                            <Option value="srgb">sRGB</Option>
                          </Select>
                        </Form.Item>

                        <Form.Item name="pixelFormat" label="Định dạng pixel">
                          <Select>
                            <Option value="yuv420p">YUV 4:2:0 8-bit</Option>
                            <Option value="yuv420p10le">
                              YUV 4:2:0 10-bit
                            </Option>
                            <Option value="yuv444p">YUV 4:4:4 8-bit</Option>
                          </Select>
                        </Form.Item>
                      </>
                    )}
                  </Card>
                ),
            },
          ]}
        />
      </Form>
    </Modal>
  );
};

export default SettingsModal;

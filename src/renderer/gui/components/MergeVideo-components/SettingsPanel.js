import React, { memo, useState } from 'react';
import { Card, Form, Select, InputNumber, Switch, Button, Space, Collapse, Tooltip, Alert } from 'antd';
import {
  SettingOutlined,
  VideoFileOutlined,
  AudioFileOutlined,
  CompressOutlined,
  QualityOutlined,
  ExportOutlined,
  SaveOutlined,
  ReloadOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { Panel } = Collapse;

const SettingsPanel = memo(({
  settings,
  onSettingsChange,
  onExport,
  onSavePreset,
  onLoadPreset,
  onResetSettings,
  currentMode,
  theme,
  showTooltips,
  isExporting = false,
  exportProgress = 0
}) => {
  const [form] = Form.useForm();
  const [activeKey, setActiveKey] = useState(['output', 'video']);

  const outputFormats = [
    { value: 'mp4', label: 'MP4 (Khuyến nghị)', icon: '🎬' },
    { value: 'avi', label: 'AVI', icon: '📹' },
    { value: 'mov', label: 'MOV', icon: '🎥' },
    { value: 'mkv', label: 'MKV', icon: '📺' },
    { value: 'webm', label: 'WebM', icon: '🌐' }
  ];

  const videoCodecs = [
    { value: 'h264', label: 'H.264 (Khuyến nghị)', description: 'Tương thích tốt, kích thước vừa phải' },
    { value: 'h265', label: 'H.265/HEVC', description: 'Chất lượng cao, kích thước nhỏ' },
    { value: 'vp9', label: 'VP9', description: 'Mã nguồn mở, tối ưu web' },
    { value: 'av1', label: 'AV1', description: 'Công nghệ mới nhất, hiệu quả cao' }
  ];

  const audioCodecs = [
    { value: 'aac', label: 'AAC (Khuyến nghị)' },
    { value: 'mp3', label: 'MP3' },
    { value: 'opus', label: 'Opus' },
    { value: 'vorbis', label: 'Vorbis' }
  ];

  const qualityPresets = [
    { value: 'ultra', label: '🏆 Siêu cao (4K)', bitrate: 50000, description: 'Chất lượng tốt nhất' },
    { value: 'high', label: '⭐ Cao (1080p)', bitrate: 8000, description: 'Chất lượng cao' },
    { value: 'medium', label: '👍 Trung bình (720p)', bitrate: 4000, description: 'Cân bằng chất lượng/dung lượng' },
    { value: 'low', label: '💾 Thấp (480p)', bitrate: 1500, description: 'Tiết kiệm dung lượng' }
  ];

  const handleFormChange = (changedFields, allFields) => {
    const newSettings = {};
    allFields.forEach(field => {
      newSettings[field.name[0]] = field.value;
    });
    onSettingsChange(newSettings);
  };

  const handlePresetChange = (preset) => {
    const presetData = qualityPresets.find(p => p.value === preset);
    if (presetData) {
      const newSettings = {
        ...settings,
        quality: preset,
        videoBitrate: presetData.bitrate,
        resolution: preset === 'ultra' ? '3840x2160' : 
                   preset === 'high' ? '1920x1080' :
                   preset === 'medium' ? '1280x720' : '854x480'
      };
      form.setFieldsValue(newSettings);
      onSettingsChange(newSettings);
    }
  };

  const getEstimatedFileSize = () => {
    const duration = settings.totalDuration || 0;
    const videoBitrate = settings.videoBitrate || 4000;
    const audioBitrate = settings.audioBitrate || 128;
    const totalBitrate = videoBitrate + audioBitrate;
    const sizeInMB = (totalBitrate * duration) / (8 * 1000);
    
    if (sizeInMB > 1000) {
      return `${(sizeInMB / 1000).toFixed(1)} GB`;
    }
    return `${sizeInMB.toFixed(0)} MB`;
  };

  return (
    <div className={`w-80 border-l p-4 overflow-y-auto ${
      theme === 'dark' 
        ? 'bg-gray-900 border-gray-700' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      <Card 
        title="⚙️ Cài đặt Xuất Video" 
        size="small"
        extra={
          <Space>
            <Tooltip title={showTooltips ? "Lưu cài đặt" : ""}>
              <Button
                size="small"
                icon={<SaveOutlined />}
                onClick={onSavePreset}
              />
            </Tooltip>
            <Tooltip title={showTooltips ? "Khôi phục mặc định" : ""}>
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={onResetSettings}
              />
            </Tooltip>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={settings}
          onFieldsChange={handleFormChange}
          size="small"
        >
          <Collapse 
            activeKey={activeKey} 
            onChange={setActiveKey}
            size="small"
            ghost
          >
            {/* Output Settings */}
            <Panel 
              header="📁 Cài đặt Xuất" 
              key="output"
              extra={<VideoFileOutlined />}
            >
              <Form.Item 
                label="Định dạng xuất" 
                name="outputFormat"
                tooltip={showTooltips ? "Chọn định dạng file video" : ""}
              >
                <Select>
                  {outputFormats.map(format => (
                    <Option key={format.value} value={format.value}>
                      {format.icon} {format.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item 
                label="Chất lượng" 
                name="quality"
                tooltip={showTooltips ? "Chọn preset chất lượng" : ""}
              >
                <Select onChange={handlePresetChange}>
                  {qualityPresets.map(preset => (
                    <Option key={preset.value} value={preset.value}>
                      <div>
                        <div>{preset.label}</div>
                        <div className="text-xs text-gray-500">{preset.description}</div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {currentMode !== 'beginner' && (
                <>
                  <Form.Item 
                    label="Độ phân giải" 
                    name="resolution"
                    tooltip={showTooltips ? "Độ phân giải video xuất" : ""}
                  >
                    <Select>
                      <Option value="3840x2160">4K (3840x2160)</Option>
                      <Option value="1920x1080">Full HD (1920x1080)</Option>
                      <Option value="1280x720">HD (1280x720)</Option>
                      <Option value="854x480">SD (854x480)</Option>
                      <Option value="auto">Tự động (theo video gốc)</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item 
                    label="Tỷ lệ khung hình" 
                    name="aspectRatio"
                    tooltip={showTooltips ? "Tỷ lệ khung hình video" : ""}
                  >
                    <Select>
                      <Option value="16:9">16:9 (Widescreen)</Option>
                      <Option value="4:3">4:3 (Standard)</Option>
                      <Option value="1:1">1:1 (Square)</Option>
                      <Option value="9:16">9:16 (Vertical)</Option>
                      <Option value="auto">Tự động</Option>
                    </Select>
                  </Form.Item>
                </>
              )}
            </Panel>

            {/* Video Settings */}
            <Panel 
              header="🎬 Cài đặt Video" 
              key="video"
              extra={<QualityOutlined />}
            >
              {currentMode !== 'beginner' && (
                <>
                  <Form.Item 
                    label="Codec Video" 
                    name="videoCodec"
                    tooltip={showTooltips ? "Codec nén video" : ""}
                  >
                    <Select>
                      {videoCodecs.map(codec => (
                        <Option key={codec.value} value={codec.value}>
                          <div>
                            <div>{codec.label}</div>
                            <div className="text-xs text-gray-500">{codec.description}</div>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item 
                    label="Bitrate Video (kbps)" 
                    name="videoBitrate"
                    tooltip={showTooltips ? "Chất lượng video, càng cao càng rõ nét" : ""}
                  >
                    <InputNumber 
                      min={500} 
                      max={100000} 
                      step={500}
                      style={{ width: '100%' }}
                      formatter={value => `${value} kbps`}
                      parser={value => value.replace(' kbps', '')}
                    />
                  </Form.Item>

                  <Form.Item 
                    label="FPS (Khung hình/giây)" 
                    name="fps"
                    tooltip={showTooltips ? "Số khung hình trên giây" : ""}
                  >
                    <Select>
                      <Option value={24}>24 fps (Cinema)</Option>
                      <Option value={25}>25 fps (PAL)</Option>
                      <Option value={30}>30 fps (Standard)</Option>
                      <Option value={60}>60 fps (Smooth)</Option>
                      <Option value="auto">Tự động</Option>
                    </Select>
                  </Form.Item>
                </>
              )}

              {currentMode === 'expert' && (
                <>
                  <Form.Item 
                    label="Chế độ Rate Control" 
                    name="rateControl"
                    tooltip={showTooltips ? "Cách kiểm soát chất lượng video" : ""}
                  >
                    <Select>
                      <Option value="cbr">CBR (Constant Bitrate)</Option>
                      <Option value="vbr">VBR (Variable Bitrate)</Option>
                      <Option value="crf">CRF (Constant Rate Factor)</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item 
                    label="CRF Value" 
                    name="crfValue"
                    tooltip={showTooltips ? "Giá trị CRF (0-51, thấp hơn = chất lượng cao hơn)" : ""}
                  >
                    <InputNumber min={0} max={51} step={1} style={{ width: '100%' }} />
                  </Form.Item>
                </>
              )}
            </Panel>

            {/* Audio Settings */}
            <Panel 
              header="🔊 Cài đặt Audio" 
              key="audio"
              extra={<AudioFileOutlined />}
            >
              <Form.Item 
                label="Codec Audio" 
                name="audioCodec"
                tooltip={showTooltips ? "Codec nén âm thanh" : ""}
              >
                <Select>
                  {audioCodecs.map(codec => (
                    <Option key={codec.value} value={codec.value}>
                      {codec.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item 
                label="Bitrate Audio (kbps)" 
                name="audioBitrate"
                tooltip={showTooltips ? "Chất lượng âm thanh" : ""}
              >
                <Select>
                  <Option value={64}>64 kbps (Thấp)</Option>
                  <Option value={128}>128 kbps (Chuẩn)</Option>
                  <Option value={192}>192 kbps (Cao)</Option>
                  <Option value={320}>320 kbps (Rất cao)</Option>
                </Select>
              </Form.Item>

              <Form.Item 
                label="Sample Rate" 
                name="sampleRate"
                tooltip={showTooltips ? "Tần số lấy mẫu âm thanh" : ""}
              >
                <Select>
                  <Option value={22050}>22.05 kHz</Option>
                  <Option value={44100}>44.1 kHz (CD Quality)</Option>
                  <Option value={48000}>48 kHz (Professional)</Option>
                  <Option value={96000}>96 kHz (High-end)</Option>
                </Select>
              </Form.Item>

              {currentMode !== 'beginner' && (
                <Form.Item 
                  name="normalizeAudio"
                  valuePropName="checked"
                  tooltip={showTooltips ? "Cân bằng âm lượng giữa các clip" : ""}
                >
                  <Switch checkedChildren="Cân bằng âm lượng" unCheckedChildren="Giữ nguyên" />
                </Form.Item>
              )}
            </Panel>

            {/* Advanced Settings */}
            {currentMode === 'expert' && (
              <Panel 
                header="🚀 Cài đặt Nâng cao" 
                key="advanced"
                extra={<CompressOutlined />}
              >
                <Form.Item 
                  label="Số luồng xử lý" 
                  name="threads"
                  tooltip={showTooltips ? "Số CPU cores sử dụng" : ""}
                >
                  <InputNumber min={1} max={16} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item 
                  label="GPU Acceleration" 
                  name="gpuAcceleration"
                  tooltip={showTooltips ? "Sử dụng GPU để tăng tốc" : ""}
                >
                  <Select>
                    <Option value="none">Không sử dụng</Option>
                    <Option value="nvenc">NVIDIA NVENC</Option>
                    <Option value="qsv">Intel Quick Sync</Option>
                    <Option value="amf">AMD AMF</Option>
                  </Select>
                </Form.Item>

                <Form.Item 
                  name="twoPass"
                  valuePropName="checked"
                  tooltip={showTooltips ? "Mã hóa 2 lần để chất lượng tốt hơn" : ""}
                >
                  <Switch checkedChildren="Two-pass encoding" unCheckedChildren="Single-pass" />
                </Form.Item>

                <Form.Item 
                  name="fastStart"
                  valuePropName="checked"
                  tooltip={showTooltips ? "Tối ưu cho streaming" : ""}
                >
                  <Switch checkedChildren="Fast start" unCheckedChildren="Normal" />
                </Form.Item>
              </Panel>
            )}
          </Collapse>
        </Form>

        {/* Export Info */}
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded">
          <div className="text-sm font-medium mb-2">📊 Thông tin Xuất</div>
          <div className="text-xs space-y-1">
            <div>Dung lượng ước tính: <strong>{getEstimatedFileSize()}</strong></div>
            <div>Thời gian ước tính: <strong>
              {Math.ceil((settings.totalDuration || 0) / 10)} phút
            </strong></div>
          </div>
        </div>

        {/* Export Button */}
        <Button
          type="primary"
          size="large"
          icon={<ExportOutlined />}
          onClick={onExport}
          loading={isExporting}
          disabled={!settings.totalDuration || settings.totalDuration === 0}
          className="w-full mt-4 bg-green-600 hover:bg-green-700 border-green-600"
        >
          {isExporting ? `Đang xuất... ${exportProgress}%` : 'Xuất Video'}
        </Button>

        {isExporting && (
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Tiến độ</span>
              <span>{exportProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Warnings */}
        {currentMode === 'beginner' && (
          <Alert
            message="💡 Mẹo"
            description="Chế độ cơ bản đã tối ưu các cài đặt phù hợp. Chuyển sang chế độ Pro để có thêm tùy chọn."
            type="info"
            showIcon
            className="mt-4"
            size="small"
          />
        )}
      </Card>
    </div>
  );
});

export default SettingsPanel;